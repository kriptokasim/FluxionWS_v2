import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'crypto';
import { Client } from 'pg';
import Redis from 'ioredis';
import { resolveFlowEntry } from '@fluxion/flows';
import { appendRunRecord, getFlowSpec } from '@fluxion/local-store';
import type { FlowSpec } from '@fluxion/types';

type RunRequestBody = {
  flowId?: string;
  version?: string;
  input?: any;
};

const app = Fastify({ logger: true });

const allowedOrigins = process.env.RUNTIME_CORS_ORIGIN
  ? process.env.RUNTIME_CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173'];

await app.register(cors, {
  origin: allowedOrigins,
});

const port = Number(process.env.PORT || 4000);
const pgUrl = process.env.POSTGRES_URL;
const redisUrl = process.env.REDIS_URL;

const pgClient = pgUrl ? new Client({ connectionString: pgUrl }) : null;
const redisClient = redisUrl ? new Redis(redisUrl) : null;

async function ensureConnections() {
  if (pgClient) {
    try {
      await pgClient.connect();
      app.log.info('Postgres connected');
    } catch (err) {
      app.log.warn({ err }, 'Failed to connect to Postgres. Falling back to file storage only.');
    }
  }
  if (redisClient) {
    try {
      await redisClient.ping();
      app.log.info('Redis connected');
    } catch (err) {
      app.log.warn({ err }, 'Failed to connect to Redis. Continuing without cache.');
    }
  }
}

app.get('/health', async () => {
  return {
    ok: true,
    runtime: 'fluxion',
    postgres: !!pgClient,
    redis: !!redisClient,
  };
});

app.get('/memory/ping', async () => {
  const postgres = pgClient ? await pgClient.query('select 1').then(() => 'ok').catch(() => 'error') : 'disabled';
  const redis = redisClient ? await redisClient.ping().catch(() => 'error') : 'disabled';
  return { postgres, redis };
});

app.post('/v1/runs', async (request, reply) => {
  const body = request.body as RunRequestBody;
  if (!body?.flowId) {
    return reply.code(400).send({ ok: false, error: 'Missing flowId' });
  }

  const spec = await getFlowSpec(body.flowId);
  if (!spec) {
    return reply.code(404).send({ ok: false, error: `Flow not found: ${body.flowId}` });
  }

  if (body.version && body.version !== spec.version) {
    app.log.warn({ flowId: body.flowId, requested: body.version, stored: spec.version }, 'Version mismatch requested');
  }

  const runId = randomUUID();
  const startTs = Date.now();
  const events: any[] = [];

  const append = async (event: any) => {
    events.push({ ...event, ts: Date.now() });
  };

  try {
    const entry = resolveFlowEntry(spec as FlowSpec);
    await append({ kind: 'start', node: 'entry', data: truncate(body.input) });

    const out = await entry(body.input, { spec, append, runId, flowId: body.flowId });
    const durationMs = Date.now() - startTs;

    await append({ kind: 'finish', node: 'entry', ms: durationMs, data: truncate(out) });

    const record = {
      id: runId,
      status: out?.status === 'pending_approval' ? 'pending_approval' : 'ok',
      createdAt: startTs,
      durationMs,
      specVersion: spec.version,
      inputSummary: summarize(body.input),
      outputSummary: summarize(out),
      events,
    };

    await appendRunRecord(body.flowId, record);
    await persistRunRecordToPostgres(spec, record);

    return { ok: true, out };
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    const durationMs = Date.now() - startTs;
    await append({ kind: 'error', node: 'entry', error: errorMsg });

    const record = {
      id: runId,
      status: 'error',
      createdAt: startTs,
      durationMs,
      specVersion: spec.version,
      inputSummary: summarize(body.input),
      error: errorMsg,
      events,
    };
    await appendRunRecord(body.flowId, record);
    await persistRunRecordToPostgres(spec, record);

    return reply.code(500).send({ ok: false, error: errorMsg });
  }
});

function summarize(x: any) {
  if (typeof x === 'string') {
    return x.length > 200 ? x.slice(0, 200) + '…' : x;
  }
  const s = JSON.stringify(truncate(x));
  return s.length > 200 ? s.slice(0, 200) + '…' : s;
}

function truncate(x: any) {
  try {
    return JSON.parse(
      JSON.stringify(x, (_k, v) => (typeof v === 'string' && v.length > 500 ? v.slice(0, 500) + '…' : v)),
    );
  } catch {
    return x;
  }
}

async function persistRunRecordToPostgres(spec: FlowSpec, record: any) {
  if (!pgClient) return;
  try {
    await pgClient.query(
      `
        insert into runs (id, created_at, spec, result)
        values ($1, to_timestamp($2 / 1000.0), $3::jsonb, $4::jsonb)
      `,
      [record.id, record.createdAt, JSON.stringify(spec), JSON.stringify(record)],
    );
  } catch (err) {
    app.log.warn({ err }, 'Failed to persist run to Postgres');
  }
}

const start = async () => {
  try {
    await ensureConnections();
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Fluxion runtime listening on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

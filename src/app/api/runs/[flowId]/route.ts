import { NextRequest } from 'next/server';
import { getRunRecords } from '@fluxion/local-store';

export async function GET(request: NextRequest, { params }: { params: { flowId: string } }) {
  const { flowId } = params;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? '20');
  const runs = await getRunRecords(flowId, Number.isFinite(limit) ? limit : 20);
  return Response.json({ ok: true, runs });
}

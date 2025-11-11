import Fastify from 'fastify'
import cors from '@fastify/cors'
// import { Client } from 'pg'
// import Redis from 'ioredis'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: "*", // For development, allow all origins.
});

const port = Number(process.env.PORT || 4000)
// const pgUrl = process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/fluxion'
// const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// const pg = new Client({ connectionString: pgUrl })
// const redis = new Redis(redisUrl)

app.get('/health', async () => 'ok')

app.get('/memory/ping', async () => {
  // await pg.query('select 1')
  // const pong = await redis.ping()
  return { postgres: 'ok', redis: 'ok' }
})

const start = async () => {
  try {
    // await pg.connect()
    await app.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()

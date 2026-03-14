import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

const server = fastify({ logger: true });

// Статика для изображений
server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'images'),
  prefix: '/images/',
  decorateReply: false,
});

// Статика для public (HTML, CSS, JS)
server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
  decorateReply: false,
});

// GET endpoint
server.get('/api/hello', async (request, reply) => {
  return { message: 'Hello from Fastify + TypeScript!' };
});

// POST endpoint
server.post('/api/data', async (request, reply) => {
  const body:any = request.body;
  server.log.info('Received data:', body);
  return {
    success: true,
    received: body,
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Сервер запущен на http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
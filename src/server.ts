import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import b2Service from './b2Service';

dotenv.config();

const server = fastify({ logger: false });

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

server.get('/api/fileList', async () => {
  console.log('/api/fileList');
    const result = await b2Service.listFiles();
    return {
      status: 'fileList',
      result
    };
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

// POST endpoint
/*server.post('/api/fileList', async (request, reply) => {
  const body:any = .listFiles();
  server.log.info('Received data:', body);
  return {
    success: true,
    received: body,
    timestamp: new Date().toISOString(),
  };
});*/

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
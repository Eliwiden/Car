import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';

const fastify: FastifyInstance = Fastify({ logger: true });

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// 1. Регистрация плагина для отдачи статических файлов из папки 'public'
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'), // public/ находится на один уровень выше dst/
  prefix: '/', // Файлы из public/ будут доступны по корневому URL
});

fastify.get('/dst', async (request, reply) => {
  const fileName = request.url.split('/')[1];  // main.js → main.js
  const jsPath = path.join(__dirname, 'dst', fileName);
  return reply.sendFile(jsPath);
});

fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

fastify.get<{ Params: { id: string } }>('/user/:id', async (request, reply) => {
  return { id: request.params.id, name: 'Иван' };
});

fastify.post<{ Body: { name: string; age: number } }>('/data', async (request, reply) => {
  const { name, age } = request.body;
  return { message: `Привет, ${name}! Тебе ${age} лет.` };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Сервер запущен на http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
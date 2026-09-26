import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import b2Service from './b2Service';
import { hashPasswordServer, verifyPasswordServer } from './AuthService';
import {LoginData } from './types';

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
  const result = await b2Service.listItems();
  return {
    status: 'fileList',
    result
  };
});

// POST endpoint
server.post('/api/data', async (request, reply) => {
  const body: any = request.body;
  server.log.info('Received data:', body);
  return {
    success: true,
    received: body,
    timestamp: new Date().toISOString(),
  };
});

server.post('/api/upload', async (request, reply) => {
  const body: any = request.body;

  // Декодируем base64 строку в настоящий Buffer
  const fileBuffer = Buffer.from(body.file, 'base64');
  const fileName = body.fileName;
  const mimeType = body.mimeType;
  console.log(fileName);
  const decodedText = fileBuffer.toString('utf-8');
  console.log(decodedText);
  const ret = await b2Service.uploadFile(fileBuffer, fileName, mimeType);

  return {
    success: true,
    fileId: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    fileName: fileName,
    mimeType: mimeType,
    size: fileBuffer?.length || 0,
    ret,
    timestamp: new Date().toISOString(),

  };
});

server.post('/api/login', async (request, reply) => {
  const body: LoginData = request.body as any;
  // Декодируем base64 строку в настоящий Buffer
  const Password = Buffer.from(body.password, 'base64').toString('utf-8');
  const userId = body.userId;
  //Берем с нашего хранилища данных в которых хранятся пароли
  const result = await b2Service.listItems();

  for (const it of result.files) {
    if (it.key && userId.toLowerCase() === it.key.toLowerCase()) {
      try {
        const content = await b2Service.readTextFile(userId);
        await verifyPasswordServer(Password, content);
        return {
          success: true,
        }
      } catch (error) {
        console.log('Password verification failed:', error);
        return {
          success: false,
        }
      }
    }
    console.log(userId);
  }
  return {
    success: false,
  }

});


server.post('/api/signup', async (request, reply) => {
  const result = await b2Service.listItems();
  const body: any = request.body;

  // Декодируем base64 строку в настоящий Buffer
  const Password = Buffer.from(body.file, 'base64').toString('utf-8');
  const userId = body.fileName;

  for (const it of result.files) {
    if (it.key && userId.toLowerCase() === it.key.toLowerCase()) {
      return {
        success: false,
        message: 'User already exists'
      };
    }
    console.log(userId);
  }
  try{
    const hashedPassword = await hashPasswordServer(Password);
    await b2Service.uploadFile(Buffer.from(hashedPassword), userId, 'text/plain');
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: 'Error creating user',
      error
    }
  }
  return {
    success: true,
    message: 'User created successfully'
  }

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
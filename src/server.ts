import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import b2Service from './b2Service';
import { hashPasswordServer, verifyPasswordServer } from './AuthService';
import { LoginData } from './types';

dotenv.config();

const server = fastify({
  logger: false,
});

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'images'),
  prefix: '/images/',
  decorateReply: false,
});

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
  decorateReply: false,
});

server.get('/api/hello', async () => {
  return {
    message: 'Hello from Fastify + TypeScript!',
  };
});

server.get('/api/fileList', async () => {
  const result = await b2Service.listItems();

  return {
    status: 'fileList',
    result,
  };
});

server.post('/api/data', async request => {
  const body = request.body as Record<string, unknown>;

  return {
    success: true,
    received: body,
    timestamp: new Date().toISOString(),
  };
});

const uploadSchema = {
  body: {
    type: 'object',
    required: ['file', 'fileName', 'mimeType'],
    properties: {
      file: { type: 'string' },
      fileName: { type: 'string', minLength: 1 },
      mimeType: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
} as const;

server.post('/api/upload', { schema: uploadSchema }, async (request, reply) => {
  type UploadBody = { file: string; fileName: string; mimeType: string };
  const { file, fileName, mimeType } = request.body as unknown as UploadBody;

  const fileBuffer = Buffer.from(file, 'base64');

  if (fileBuffer.length === 0) {
    return reply.status(400).send({
      success: false,
      message: 'Uploaded file is empty',
    });
  }

  const uploadResult = await b2Service.uploadFile(
    fileBuffer,
    fileName,
    mimeType
  );

  return {
    success: true,
    fileName,
    mimeType,
    size: fileBuffer.length,
    uploadResult,
    timestamp: new Date().toISOString(),
  };
});

const loginSchema = {
  body: {
    type: 'object',
    required: ['password', 'userId'],
    properties: {
      password: { type: 'string' },
      userId: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
} as const;

server.post('/api/login', { schema: loginSchema }, async (request, reply) => {
  const { password, userId } = request.body as LoginData;

  const normalizedUserId = userId.trim().toLowerCase();

  if (!normalizedUserId) {
    return reply.status(400).send({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    const passwordHash = await b2Service.readTextFile(normalizedUserId);
    const isValid = await verifyPasswordServer(
      Buffer.from(password, 'base64').toString('utf-8'),
      passwordHash
    );

    if (!isValid) {
      server.log.warn(`Invalid password for user: ${normalizedUserId}`);

      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    server.log.error({ err: error }, 'Login failed');

    return {
      success: false,
    };
  }
});

const signupSchema = {
  body: {
    type: 'object',
    required: ['file', 'userId'],
    properties: {
      file: { type: 'string' },
      userId: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
} as const;

server.post('/api/signup', async (request, reply) => {
  const SignUpData = request.body as LoginData;
  const userId = SignUpData.userId.trim().toLowerCase();

  if (!userId) {
    return reply.status(400).send({
      success: false,
      message: 'User ID is required',
    });
  }
  try {
    const existingFiles = await b2Service.listItems();

    const userExists = existingFiles.files.some(
      existingFile =>
        existingFile.key?.toLowerCase() === userId
    );
    if (userExists) {
      return reply.status(409).send({
        success: false,
        message: 'User already exists',
      });
    }
    const plainPassword = Buffer.from(SignUpData.password, 'base64').toString('utf-8');
    if (!plainPassword) {
      return reply.status(400).send({
        success: false,
        message: 'Password is required',
      });
    }
    console.log('Password is okay')

    const hashedPassword = await hashPasswordServer(plainPassword);
    await b2Service.uploadFile(
      Buffer.from(hashedPassword, 'utf-8'),
      userId,
      'text/plain'
    );

    return {
      success: true,
      message: 'User created successfully',
    };
  } catch (error) {
    server.log.error({ err: error }, 'Signup failed');

    return reply.status(500).send({
      success: false,
      message: 'Error creating user',
    });
  }
});

server.setErrorHandler((error, request, reply) => {
  const errAny = error as any;

  server.log.error({ err: errAny, url: request.url }, 'Request failed');

  const statusCode = typeof errAny?.statusCode === 'number' ? errAny.statusCode : 500;

  reply.status(statusCode).send({
    success: false,
    message: statusCode < 500 && typeof errAny?.message === 'string' ? errAny.message : 'Internal server error',
  });
});

const start = async () => {
  try {
    await server.listen({
      port: 3000,
      host: '0.0.0.0',
    });

    console.log('Сервер запущен на http://localhost:3000');
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
import 'source-map-support/register';
import { Handler, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { Server } from 'http';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import * as express from 'express';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

const binaryMimeTypes: string[] = [];

let cachedServer: Server;

/**
 * Creates a server express for lambda function bootstrap app nestJS
 */
async function bootstrapServer(): Promise<Server> {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn']
    }
  );
  nestApp.setGlobalPrefix('user/v1');
  nestApp.use(eventContext());
  nestApp.use(helmet());

  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept'
  });
  nestApp.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );
  await nestApp.init();

  return createServer(expressApp, undefined, binaryMimeTypes);
}

export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};

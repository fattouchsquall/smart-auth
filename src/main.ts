import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstraps current App.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn']
  });
  app.setGlobalPrefix('v1');
  await app.listen(3000);
}
bootstrap();

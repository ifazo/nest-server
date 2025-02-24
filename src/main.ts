import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8000;
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('/api');
  await app.listen(8000, '0.0.0.0');
  console.log(`Server running at: http://localhost:${port}`);
}

bootstrap();

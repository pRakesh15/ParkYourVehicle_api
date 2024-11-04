import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder().setTitle(
    'parkYourVehicle | Rakesh Pradhan')
    .setDescription(
      `the parkYourVehicle API,
      <h1> Looking for the graphql api?</h1>
      Go to <a href="/graphql" target="_blank">/Graphql</a>
      Or,
      You might also need to use the <a target="_blank" href="https://studio.apollographql.com"> Apollo explorer</a> for a grater expense `

    )
    .setVersion('0.1')
    .addBasicAuth()
    .build()

    const document= SwaggerModule.createDocument(app,config)
    SwaggerModule.setup('/',app,document)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

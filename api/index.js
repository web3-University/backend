// vercel入口文件
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app.getHttpAdapter().getInstance()(req, res);
};

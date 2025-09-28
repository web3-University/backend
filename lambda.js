const { configure } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const serverlessExpress = require('@codegenie/serverless-express');
const { AppModule } = require('./app.module');

let cachedApp;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = configure(AppModule, new ExpressAdapter());
  await expressApp.init();
  
  cachedApp = expressApp.getHttpAdapter().getInstance();
  return cachedApp;
}

exports.handler = async (event, context) => {
  const app = await createApp();
  return serverlessExpress({ app })(event, context);
};
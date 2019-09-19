const configParse = require('./util/config-parse');
const responseGen = require('./util/response-generator');
const indexRoute = require('./routes/index');
const baseRoute = require('./routes/base-model-router');
const mongoose = require('mongoose');
const cors = require('cors');
const CONST = require('./util/const');

const init = (app, config, hooks) => {
  config = configParse(config);

  if (config.enableCors) {
    app.use(cors()); // cross origin issues
  }

  // MongoDB configurations
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost:27017/api-tester', { useNewUrlParser: true, useUnifiedTopology: true });

  const pathStart = `/${config.routePrefix}/${config.apiVersion}`;
  app.use(pathStart, indexRoute);

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.pre) {
    app.use(hooks.generic.pre);
  }

  // model vise routes
  config.models.forEach((model) => {
    app.use(`${pathStart}/${model.path}`, baseRoute(model, hooks.models[model.name]));
  });

  // post generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    app.use(hooks.generic.post);
  }

  app.use(responseGen.success);
  app.use(responseGen.error);
};

module.exports = init;

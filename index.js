const configParse = require('./util/config-parse');
const responseGen = require('./util/response-generator');
const indexRoute = require('./routes/index');
const baseRoute = require('./routes/base-model-router');
const authRoute = require('./routes/users-router');
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
  mongoose.connect(`mongodb://localhost:27017/${config.dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const pathStart = `/${config.routePrefix}/${config.apiVersion}`;
  app.use(pathStart, indexRoute);

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.pre) {
    app.use(hooks.generic.pre);
  }

  app.use((req, res, next) => {
    req.mjsHandled = false;
    next();
  });

  // authentication routes
  if (config.auth.enableAuth) {
    app.use(authRoute.authMiddleware);
    app.use(`${pathStart}/user`, authRoute.authRouter(config.auth, hooks && hooks.signUp));
  }

  // model vise routes
  config.models.forEach((model) => {
    app.use(`${pathStart}/${model.path}`, baseRoute(model, hooks.models && hooks.models[model.name]));
  });

  // post generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    app.use(hooks.generic.post);
  }

  app.use(responseGen.success);
  app.use(responseGen.error);
};

module.exports = init;

module.exports.CONST = CONST;
module.exports.MongooseTypes = mongoose.Schema.Types;

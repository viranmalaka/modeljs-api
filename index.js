const configParse = require('./util/config-parse');
const responseGen = require('./util/response-generator');
const indexRoute = require('./routes/index');
const baseRoute = require('./routes/base-model-router');
const authRoute = require('./routes/users-router');
const mongoose = require('mongoose');
const cors = require('cors');
const CONST = require('./util/const');
const logger = require('./util/logger');

const metaExport = {};

const init = (app, config, hooks) => {
  config = configParse(config);
  logger.info('Init app with ', config);

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
    app.use((req, res, next) => {
      logger.info('Executing Generic Pre Middleware');
      hooks.generic.pre(req, res, next);
    });
  }

  app.use((req, res, next) => {
    req.mjsHandled = false;
    next();
  });

  // authentication routes
  if (config.auth.enableAuth) {
    app.use(pathStart, authRoute.authMiddleware);
    app.use(`${pathStart}/user`, authRoute.authRouter(config.auth, hooks && hooks.signUp, metaExport));
  } else if(config.auth.isAuthenticatedMiddleware) {
    app.use(pathStart, config.auth.isAuthenticatedMiddleware);
    app.get(`${pathStart}/user/who`, (req, res, next) => {
      req.mjsHandled = true;
      res.mjsResult = req.isAuthenticated ? req.user : null;
      res.mjsResStatus = req.isAuthenticated ? 200 : 401;
      next();
    });
  }

  // model vise routes
  config.models.forEach((model) => {
    app.use(`${pathStart}/${model.path}`, baseRoute(model, hooks.models && hooks.models[model.name], metaExport));
  });

  // post generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    app.use((req, res, next) => {
      logger.info('Executing Generic Post Middleware');
      hooks.generic.post(req, res, next);
    });
  }

  app.use(responseGen.success);
  app.use(responseGen.error);
};

module.exports = init;

module.exports.CONST = CONST;
module.exports.MongooseTypes = mongoose.Schema.Types;
module.exports.Models = metaExport;
module.exports.logger = logger;

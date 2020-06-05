const baseController = require('../controller/base-controller');
const to = require('../util/to');
const hookHandler = require('../util/hooks-handler');
const allowedAction = require('../util/allowed-action');
const express = require('express');
const logger = require('../util/logger');
const {
  CREATE,
  DELETE,
  DELETE_BY_ID,
  GET_ALL,
  GET_ONE,
  GET_BY_ID,
  UPDATE,
  BULK_UPDATE,
  UPDATE_BY_ID,
  COUNT,
} = require('../util/const').ACTIONS;

module.exports = (config, hooks, metaExport) => {
  const router = express.Router();
  const controller = new baseController(config);
  metaExport[config.name] = controller.getModel();

  const modelHooks = hookHandler.modelHook(hooks);

  // this middleware will handle if an action is blocked by the config
  const notAllowedMiddleware = (req, res, next) => {
    req.mjsHandled = true;
    res.mjsError = { message: 'not allowed' };
    res.mjsResStatus = 403;
    logger.error('Not Allowed request');
    next();
  };

  // this will create routers for the express app.
  const routerCreator = (method, path, action, handler) => {
    const noPermissionMiddleware = (req, res, next) => {
      req.mjsHandled = true;
      res.mjsError = res.mjsError || { code: 401, message: 'No Permission' };
      res.mjsResStatus = 401;
      logger.error('No Permission request');
      next();
    };

    const authActionMiddleware = (handler) => {
      return (req, res, next) => {
        if (config.allPrivate || config.privateActions.indexOf(action) > -1) {
          // for private actions
          if (req.isAuthenticated) {
            // for private route user should be authenticated.
            const role = req.user.userRole;

            if (role) {
              if (role < 0) {
                // for admins
                logger.info(`${config.name} [${method}] Executing`);
                return handler(req, res, next);
              } else {
                return allowedAction(action, config.allowedActionByRole[role], config.blockedActionByRole[role])
                  ? handler(req, res, next)
                  : noPermissionMiddleware(req, res, next);
              }
            } else {
              return noPermissionMiddleware(req, res, next);
            }
          } else {
            // for private route but not authenticated.
            return noPermissionMiddleware(req, res, next);
          }
        }
        return handler(req, res, next); // for non-private action call the handler.
      };
    };

    logger.info(`Creating [${method.toUpperCase()}] \t ${config.path + path}`);
    router[method](
      path,
      modelHooks(`${action}-pre`),
      allowedAction(action, config.allowedActions, config.blockedActions)
        ? authActionMiddleware(handler)
        : notAllowedMiddleware,
      modelHooks(`${action}-post`),
    );
  };

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.pre) {
    router.use((req, res, next) => {
      logger.info('executing model pre hook');
      hooks.generic.pre(req, res, next);
    });
  }

  config.additionalRoutes &&
    config.additionalRoutes.map((routeData) => {
      routerCreator(routeData.method, routeData.pathPattern, routeData.actionName, async (req, res, next) => {
        req.mjsHandled = true;
        routeData.handler(controller.getModel())(req, res, next);
      });
    });

  /* Create an object. */
  routerCreator('post', '/', CREATE, async (req, res, next) => {
    req.mjsHandled = true;
    if (config.createValidator) {
      res.mjsError = config.createValidator(req.body);
      if (res.mjsError) {
        logger.error('Customer Create Validation fail');
        res.mjsResStatus = 400;
        return next();
      }
    }
    [res.mjsError, res.mjsResult] = await to(controller.create(req.body));
    if (res.mjsError) {
      res.mjsResStatus = 400;
    } else {
      res.mjsResStatus = 201;
    }
    next();
  });

  /* Get All Objects by filter */
  routerCreator('get', '/', GET_ALL, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const complexPopulate = JSON.parse(req.get('complexPopulate') || 'null');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      const sortBy = JSON.parse(req.get('sortBy') || '{}');
      const paginate = JSON.parse(req.get('paginate') || null);
      logger.info('Searching with', {filter, complexPopulate, populate, select, sortBy, paginate});
      if (paginate) {
        [res.mjsError, res.mjsResult] = await to(
          controller.paginate(filter, select, complexPopulate || populate, paginate, sortBy),
        );
      } else {
        [res.mjsError, res.mjsResult] = await to(controller.find(filter, select, complexPopulate || populate, sortBy));
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Find By Id */
  routerCreator('get', '/:id', GET_BY_ID, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const id = req.params.id || '';
      const complexPopulate = JSON.parse(req.get('complexPopulate') || 'null');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      if (/^[a-f\d]{24}$/i.test(id)) {
        [res.mjsError, res.mjsResult] = await to(controller.findById(id, select, complexPopulate || populate));
        logger.info('get object by _id with ', {complexPopulate, populate, select});
      } else {
        [res.mjsError, res.mjsResult] = await to(controller.findOne({ id }, select, complexPopulate || populate));
        logger.info('get object by id with ', {complexPopulate, populate, select});
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Get one Objects by filter */
  routerCreator('get', '/one', GET_ONE, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const complexPopulate = JSON.parse(req.get('complexPopulate') || 'null');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      logger.info('get one object with ', {complexPopulate, populate, select});
      [res.mjsError, res.mjsResult] = await to(controller.findOne(filter, select, complexPopulate || populate));
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Get count of the objects*/
  routerCreator('get', '/count', COUNT, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      [res.mjsError, res.mjsResult] = await to(controller.count(filter));
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Update by query */
  routerCreator('patch', '/', UPDATE, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const options = JSON.parse(req.get('options') || '{}');
      [res.mjsError, res.mjsResult] = await to(controller.editOne(filter, req.body, options));
      if (res.mjsError) {
        res.mjsResStatus = 304;
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }

    next();
  });

  /* bulk Update by query */
  config.enableBulkUpdateEndpoint && routerCreator('patch', '/updates/bulk/', BULK_UPDATE, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filters = JSON.parse(req.get('filters') || '[]');
      const updates = req.body.updates;

      if (filters.length !== updates.length) {
        res.mjsError = { message: 'filters and updates are not matched' };
        res.mjsResStatus = 400;
      } else {

        const results = [], errors = [];

        for (let i = 0; i < filters.length; i ++) {
          const [err, res] = await to(controller.editOne((filters[i]), updates[i], {}));
          results.push(res);
          errors.push(err);
        }
        res.mjsResult = {results, errors};
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Update by Id */
  routerCreator('patch', '/:id', UPDATE_BY_ID, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const id = req.params.id || '';
      const options = JSON.parse(req.get('options') || '{}');
      [res.mjsError, res.mjsResult] = await to(controller.editById(id, req.body, options));
      if (res.mjsError) {
        res.mjsResStatus = 304;
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* delete by query */
  routerCreator('delete', '/', DELETE, async (req, res, next) => {
    req.mjsHandled = true;
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      [res.mjsError, res.mjsResult] = await to(controller.removeOne(filter));
      if (res.mjsError) {
        res.mjsResStatus = 304;
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
      logger.error('JSON parse error', e);
    }
    next();
  });

  /* Delete by Id */
  routerCreator('delete', '/:id', DELETE_BY_ID, async (req, res, next) => {
    req.mjsHandled = true;
    const id = req.params.id || '';
    const deleteUsages = req.get('delete-usages') || false;
    logger.info('', {deleteUsages});
    let fullResults = {};
    if (config.checkUsageBeforeDelete) {
      for (let i = 0; i < config.checkUsageBeforeDelete.length; i++) {
        const { model, key } = config.checkUsageBeforeDelete[i];
        const [, results] = await to(metaExport[model].find({ [key]: id }));
        fullResults = {[model]: results};
        // TODO error handle
      }
      if (fullResults && Object.keys(fullResults).length > 0 && !deleteUsages) {
        res.mjsError = { msg: 'Cannot delete, because there are some usages', example: fullResults, code: 'NO_DELETE_HAS_USAGES' };
        logger.info('Found some usages');
        return next();
      }
    }
    if (deleteUsages && config.checkUsageBeforeDelete) {
      for (let i = 0; i < config.checkUsageBeforeDelete.length; i++) {
        const { model, key } = config.checkUsageBeforeDelete[i];
        logger.info('Deleting item', {model, key});
        await to(metaExport[model].find({ [key]: id }).remove());
        // TODO error handle
      }
    }
    [res.mjsError, res.mjsResult] = await to(controller.removeById(id));
    if (res.mjsError) {
      res.mjsResStatus = 304;
    }
    next();
  });

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    router.use((req, res, next) => {
      logger.info('Executing model post hook');
      hooks.generic.post(req, res, next);
    });
  }

  return router;
};

const baseController = require('../controller/base-controller');
const to = require('../util/to');
const hookHandler = require('../util/hooks-handler');
const allowedAction = require('../util/allowed-action');
const express = require('express');
const {
  CREATE,
  DELETE,
  DELETE_BY_ID,
  GET_ALL,
  GET_ONE,
  GET_BY_ID,
  UPDATE,
  UPDATE_BY_ID,
  COUNT,
} = require('../util/const').ACTIONS;

module.exports = (config, hooks) => {
  const router = express.Router();
  const controller = new baseController(config);
  const modelHooks = hookHandler.modelHook(hooks);

  // this middleware will handle if an action is blocked by the config
  const notAllowedMiddleware = (req, res, next) => {
    req.mjsHandled = true;
    res.mjsError = { message: 'not allowed' };
    res.mjsResStatus = 403;
    next();
  };

  // this will create routers for the express app.
  const routerCreator = (method, path, action, handler) => {
    const noPermissionMiddleware = (req, res, next) => {
      req.mjsHandled = true;
      res.mjsError = res.mjsError || { code: 401, message: 'No Permission' };
      res.mjsResStatus = 401;
      next();
    };

    const authActionMiddleware = (handler) => {
      return (req, res, next) => {
        if (config.allPrivate || config.privateActions.indexOf(action) > -1) { // for private actions
          if (req.isAuthenticated) {
            // for private route user should be authenticated.
            const role = req.user.userRole;

            if (role) {
              if (role < 0) { // for admins
                return handler(req, res, next);
              } else  {
                return allowedAction(action, config.allowedActionByRole[role], config.blockedActionByRole[role]) ?
                  handler(req, res, next) :
                  noPermissionMiddleware(req, res, next);
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
    router.use(hooks.generic.pre);
  }

  /* Create an object. */
  routerCreator('post', '/', CREATE, async (req, res, next) => {
    req.mjsHandled = true;
    if (config.createValidator) {
      res.mjsError = config.createValidator(req.body);
      if (res.mjsError) {
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
      const sortBy = req.get('sortBy') || '';
      const paginate = JSON.parse(req.get('paginate') || null);
      if (paginate) {
        [res.mjsError, res.mjsResult] = await to(
          controller.paginate(filter, select, complexPopulate || populate, paginate),
        );
      } else {
        [res.mjsError, res.mjsResult] = await to(controller.find(filter, select, complexPopulate || populate));
      }
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
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
      [res.mjsError, res.mjsResult] = await to(controller.findById(id, select, complexPopulate || populate));
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
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
      [res.mjsError, res.mjsResult] = await to(controller.findOne(filter, select, complexPopulate || populate));
    } catch (e) {
      res.mjsResStatus = 400;
      res.mjsError = { message: 'JSON Parse Error ' + e };
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
    }
    next();
  });

  /* Update by query */
  routerCreator('patch', '/', UPDATE, async (req, res, next) => {
    req.mjsHandled = true;
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.editOne(filter, req.body));
    if (res.mjsError) {
      res.mjsResStatus = 304;
    }
    next();
  });

  /* Update by Id */
  routerCreator('patch', '/:id', UPDATE_BY_ID, async (req, res, next) => {
    req.mjsHandled = true;
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.editById(id, req.body));
    if (res.mjsError) {
      res.mjsResStatus = 304;
    }
    next();
  });

  /* delete by query */
  routerCreator('delete', '/', DELETE, async (req, res, next) => {
    req.mjsHandled = true;
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.removeOne(filter));
    if (res.mjsError) {
      res.mjsResStatus = 304;
    }
    next();
  });

  /* Update by Id */
  routerCreator('delete', '/:id', DELETE_BY_ID, async (req, res, next) => {
    req.mjsHandled = true;
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.removeById(id));
    if (res.mjsError) {
      res.mjsResStatus = 304;
    }
    next();
  });

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    router.use(hooks.generic.post);
  }

  return router;
};

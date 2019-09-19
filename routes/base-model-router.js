const baseController = require('../controller/base-controller');
const to = require('../util/to');
const hookHandler = require('../util/hooks-handler');
const allowedAction = require('../util/allowed-action');
const {
  CREATE,
  DELETE,
  DELETE_BY_ID,
  GET_ALL,
  GET_ONE,
  GET_BY_ID,
  UPDATE,
  UPDATE_BY_ID,
} = require('../util/const').ACTIONS;

module.exports = (config, hooks) => {
  const express = require('express');
  const router = express.Router();
  const controller = new baseController(config);
  const modelHooks = hookHandler.modelPreHook(hooks);

  const notAllowedMiddleware = (req, res, next) => {
    res.mjsError = { message: 'not allowed' };
    next();
  };

  const routerCreator = (method, path, action, handler) => {
    router[method](
      path,
      modelHooks(`${action}-pre`),
      allowedAction(action, config.allowedActions, config.notAllowedActions) ? handler : notAllowedMiddleware,
      modelHooks(`${action}-post`),
    );
  };

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.pre) {
    router.use(hooks.generic.pre);
  }

  /* Create an object. */
  routerCreator('post', '/', CREATE, async (req, res, next) => {
    if (config.createValidator) {
      res.mjsError = config.createValidator(req.body);
      if (res.mjsError) {
        return next();
      }
    }
    [res.mjsError, res.mjsResult] = await to(controller.create(req.body));
    next();
  });

  /* Get All Objects by filter */
  routerCreator('get', '/', GET_ALL, async (req, res, next) => {
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.find(filter, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    next();
  });

  /* Get one Objects by filter */
  routerCreator('get', '/one', GET_ONE, async (req, res, next) => {
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.findOne(filter, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    next();
  });

  /* Find By Id */
  routerCreator('get', '/:id', GET_BY_ID, async (req, res, next) => {
    try {
      const id = req.params.id || '';
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.findById(id, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    next();
  });

  /* Update by query */
  routerCreator('patch', '/', UPDATE, async (req, res, next) => {
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.editOne(filter, req.body));
    next();
  });

  /* Update by Id */
  routerCreator('patch', '/:id', UPDATE_BY_ID, async (req, res, next) => {
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.editById(id, req.body));
    next();
  });

  /* delete by query */
  routerCreator('delete', '/', DELETE, async (req, res, next) => {
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.removeOne(filter));
    next();
  });

  /* Update by Id */
  routerCreator('delete', '/:id', DELETE_BY_ID, async (req, res, next) => {
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.removeById(id));
    next();
  });

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    router.use(hooks.generic.post);
  }

  return router;
};

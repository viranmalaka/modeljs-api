const baseController = require('../controller/base-controller');
const to = require('../util/to');
const hookHandler = require('../util/hooks-handler');

module.exports = (config, hooks) => {
  const express = require('express');
  const router = express.Router();
  const controller = new baseController(config);
  const modelHooks = hookHandler.modelPreHook(hooks);

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.pre) {
    router.use(hooks.generic.pre);
  }

  /* Create an object. */
  router.post('/', modelHooks('create-pre'), async (req, res, next) => {
    if (config.createValidator) {
      res.mjsError = config.createValidator(req.body);
      if (res.mjsError) {
        return next();
      }
    }
    [res.mjsError, res.mjsResult] = await to(controller.create(req.body));
    modelHooks('create-post')(req, res, next);
  });

  /* Get All Objects by filter */
  router.get('/', modelHooks('getAll-pre'), async (req, res, next) => {
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.find(filter, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    modelHooks('getAll-post')(req, res, next);
  });

  /* Get one Objects by filter */
  router.get('/one', modelHooks('getOne-pre'), async (req, res, next) => {
    try {
      const filter = JSON.parse(req.get('filter') || '{}');
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.findOne(filter, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    modelHooks('getOne-post')(req, res,  next);
  });

  /* Find By Id */
  router.get('/:id',modelHooks('getById-pre'), async (req, res, next) => {
    try {
      const id = req.params.id || '';
      const populate = req.get('populate') || '';
      const select = req.get('select') || '';
      [res.mjsError, res.mjsResult] = await to(controller.findById(id, select, populate));
    } catch (e) {
      res.mjsError = 'Filter Parse Error' + e;
    }
    modelHooks('getById-post')(req, res, next);
  });

  /* Update by query */
  router.patch('/',modelHooks('update-pre'), async (req, res, next) => {
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.editOne(filter, req.body));
    modelHooks('update-pre')(req, res, next);
  });

  /* Update by Id */
  router.patch('/:id', modelHooks('updateById-pre'), async (req, res, next) => {
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.editById(id, req.body));
    modelHooks('updateById-post')(req, res, next);
  });

  /* delete by query */
  router.delete('/', modelHooks('delete-pre'), async (req, res, next) => {
    const filter = JSON.parse(req.get('filter') || '{}');
    [res.mjsError, res.mjsResult] = await to(controller.removeOne(filter));
    modelHooks('delete-post')(req, res, next);
  });

  /* Update by Id */
  router.delete('/:id', modelHooks('deleteById-pre'), async (req, res, next) => {
    const id = req.params.id || '';
    [res.mjsError, res.mjsResult] = await to(controller.removeById(id));
    modelHooks('deleteById-post')(req, res, next);
  });

  // pre generic hook
  if (hooks && hooks.generic && hooks.generic.post) {
    router.use(hooks.generic.post);
  }

  return router;
};

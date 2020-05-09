const logger = require('./logger');
const {
  CREATE,
  UPDATE_BY_ID,
  UPDATE,
  GET_BY_ID,
  GET_ONE,
  GET_ALL,
  DELETE_BY_ID,
  DELETE,
} = require('../util/const').ACTIONS;

module.exports.modelHook = (hook) => {
  let middleware = (req, res, next) => {
    next();
  };
  const executeMiddleware = (a, b) => {
    if (hook && hook[a] && hook[a][b]) {
      return (req, res, next) => {
        logger.log(`Executing [${a}] [${b}] hook`);
        hook && hook[a] && hook[a][b](req, res, next);
      }
    }
    return (req, res, next) => {
      next();
    };
  };
  return (mode) => {
    switch (mode) {
      case `${CREATE}-pre`:
        return executeMiddleware('create', 'pre');
      case `${CREATE}-post`:
        return executeMiddleware('create', 'post');
      case `${GET_ALL}-pre`:
        return executeMiddleware('getAll', 'pre');
      case `${GET_ALL}-post`:
        return executeMiddleware('getAll', 'post');
      case `${GET_ONE}-pre`:
        return executeMiddleware('getOne', 'pre');
      case `${GET_ONE}-post`:
        return executeMiddleware('getOne', 'post');
      case `${GET_BY_ID}-pre`:
        return executeMiddleware('getById', 'pre');
      case `${GET_BY_ID}-post`:
        return executeMiddleware('getById', 'post');
      case `${UPDATE}-pre`:
        return executeMiddleware('update', 'pre');
      case `${UPDATE}-post`:
        return executeMiddleware('update', 'post');
      case `${UPDATE_BY_ID}-pre`:
        return executeMiddleware('updateById', 'pre');
      case `${UPDATE_BY_ID}-post`:
        return executeMiddleware('updateById', 'post');
      case `${DELETE}-pre`:
        return executeMiddleware('delete', 'pre');
      case `${DELETE}-post`:
        return executeMiddleware('delete', 'post');
      case `${DELETE_BY_ID}-pre`:
        return executeMiddleware('deleteById', 'pre');
      case `${DELETE_BY_ID}-post`:
        return executeMiddleware('deleteById', 'post');
      default:
        return middleware;
    }
  };
};

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
  return (mode) => {
    switch (mode) {
      case `${CREATE}-pre`:
        return (hook && hook.create && hook.create.pre) || middleware;
      case `${CREATE}-post`:
        return (hook && hook.create && hook.create.post) || middleware;
      case `${GET_ALL}-pre`:
        return (hook && hook.getAll && hook.getAll.pre) || middleware;
      case `${GET_ALL}-post`:
        return (hook && hook.getAll && hook.getAll.post) || middleware;
      case `${GET_ONE}-pre`:
        return (hook && hook.getOne && hook.getOne.pre) || middleware;
      case `${GET_ONE}-post`:
        return (hook && hook.getOne && hook.getOne.post) || middleware;
      case `${GET_BY_ID}-pre`:
        return (hook && hook.getById && hook.getById.pre) || middleware;
      case `${GET_BY_ID}-post`:
        return (hook && hook.getById && hook.getById.post) || middleware;
      case `${UPDATE}-pre`:
        return (hook && hook.update && hook.update.pre) || middleware;
      case `${UPDATE}-post`:
        return (hook && hook.update && hook.update.post) || middleware;
      case `${UPDATE_BY_ID}-pre`:
        return (hook && hook.updateById && hook.updateById.pre) || middleware;
      case `${UPDATE_BY_ID}-post`:
        return (hook && hook.updateById && hook.updateById.post) || middleware;
      case `${DELETE}-pre`:
        return (hook && hook.delete && hook.delete.pre) || middleware;
      case `${DELETE}-post`:
        return (hook && hook.delete && hook.delete.post) || middleware;
      case `${DELETE_BY_ID}-pre`:
        return (hook && hook.deleteById && hook.deleteById.pre) || middleware;
      case `${DELETE_BY_ID}-post`:
        return (hook && hook.deleteById && hook.deleteById.post) || middleware;
      default:
        return middleware;
    }
  };
};

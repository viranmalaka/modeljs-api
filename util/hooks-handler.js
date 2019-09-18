module.exports.modelPreHook = (hook) => {
  let middleware = (req, res, next) => {
    next();
  };
  return (mode) => {
    switch (mode) {
      case 'create-pre': return hook && hook.create && hook.create.pre || middleware;
      case 'create-post': return hook && hook.create && hook.create.post || middleware;
      case 'getAll-pre': return hook && hook.getAll && hook.getAll.pre || middleware;
      case 'getAll-post': return hook && hook.getAll && hook.getAll.post || middleware;
      case 'getOne-pre': return hook && hook.getOne && hook.getOne.pre || middleware;
      case 'getOne-post': return hook && hook.getOne && hook.getOne.post || middleware;
      case 'getById-pre': return hook && hook.getById && hook.getById.pre || middleware;
      case 'getById-post': return hook && hook.getById && hook.getById.post || middleware;
      case 'update-pre': return hook && hook.update && hook.update.pre || middleware;
      case 'update-post': return hook && hook.update && hook.update.post || middleware;
      case 'updateById-pre': return hook && hook.updateById && hook.updateById.pre || middleware;
      case 'updateById-post': return hook && hook.updateById && hook.updateById.post || middleware;
      case 'delete-pre': return hook && hook.delete && hook.delete.pre || middleware;
      case 'delete-post': return hook && hook.delete && hook.delete.post || middleware;
      case 'deleteById-pre': return hook && hook.deleteById && hook.deleteById.pre || middleware;
      case 'deleteById-post': return hook && hook.deleteById && hook.deleteById.post || middleware;
      default: return middleware;
    }
  }
};

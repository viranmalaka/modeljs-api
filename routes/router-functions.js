

module.exports.createRouterFunction = async (req, res, next) => {
  if (config.createValidator) {
    res.mjsError = config.createValidator(req.body);
    if (res.mjsError) {
      return next();
    }
  }
  [res.mjsError, res.mjsResult] = await to(controller.create(req.body));
  modelHooks('create-post')(req, res, next);
};

module.exports = {
  success: (req, res, next) => {
    if (!req.mjsHandled) return next();
    if (res.mjsResult) {
      res.jsonp({
        success: true,
        result: res.mjsResult,
      });
    } else if (!res.mjsError) {
      res.jsonp({ success: true });
    }
    next();
  },
  error: (req, res, next) => {
    if (!req.mjsHandled) return next();
    if (res.mjsError) {
      res.jsonp({
        success: false,
        error: res.mjsError || {},
      });
    }
  },
};

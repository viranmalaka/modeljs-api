const logger = require('./logger');

module.exports = {
  success: (req, res, next) => {
    if (!req.mjsHandled) return next();
    if (res.mjsResult) {
      logger.info('ModelJS ');
      res.status(res.mjsResStatus || 200).jsonp({
        success: true,
        result: res.mjsResult,
      });
    } else if (!res.mjsError) {
      res.status(res.mjsResStatus || 400).jsonp({ success: true });
    }
    next();
  },
  error: (req, res, next) => {
    if (!req.mjsHandled) return next();
    if (res.mjsError) {
      logger.error('Error Response', res.mjsError);
      res.status(res.mjsResStatus || 400).jsonp({
        success: false,
        error: res.mjsError || {},
      });
    }
  },
};

module.exports = {
  success: (req, res, next) => {
    if (res.mjsResult) {
      res.jsonp({
        success: true,
        result: res.mjsResult,
      });
    } else if (!res.mjsError) {
      res.jsonp({success: true})
    }
  },
  error: (req, res) => {
    if (res.mjsError) {
      res.jsonp({
        success: false,
        error: res.mjsError || {},
      });
    }
  }
};

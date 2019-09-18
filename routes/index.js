const express = require('express');
const router = express.Router();

/* Common Routes. */
router.get('/health', function(req, res, next) {
  res.jsonp({ok: true});
});

module.exports = router;

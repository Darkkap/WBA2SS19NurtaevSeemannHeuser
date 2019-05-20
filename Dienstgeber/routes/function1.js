var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(200).write("Test okay.");
    next();
    res.end();
});

module.exports = router;

var express = require('express');
var router = express.Router();

// handle to start Adyen e2e test drop-in
router.get('/', function(req, res, next) {
    res.render('e2e_test', { title: 'Adyen e2e test drop-in' });
});

module.exports = router;
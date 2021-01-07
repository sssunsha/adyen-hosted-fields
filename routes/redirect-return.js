var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    res.render('redirect-return', { title: 'Adyen hosted field return return' });
});

module.exports = router;
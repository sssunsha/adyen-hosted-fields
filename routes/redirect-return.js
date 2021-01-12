var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    if (req.body.MD && req.body.PaRes) {
        res.render('redirect-return', {
            title: 'Adyen hosted field return return',
            md: req.body.MD,
            pares: req.body.PaRes
        });
    } else {
        res.render('redirect-return', {title: 'Adyen hosted field return return'});
    }
});

module.exports = router;
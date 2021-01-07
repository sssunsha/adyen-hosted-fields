var express = require('express');
var router = express.Router();
const { Client, Config, CheckoutAPI } = require('@adyen/api-library');

router.post('/', function (req, res, next) {
    const config = new Config();
    // Set your X-API-KEY with the API key from the Customer Area.
    config.apiKey = 'AQElhmfuXNWTK0Qc+iSDs1QZpOeUXYVZuIQzn+Z+gOnFREznbz90VxDBXVsNvuR83LVYjEgiTGAH-4dOnhV3xOjgyzaPDa9UQ8TW+gbntp1WhFMc1prI2kjc=-X9pGtf]jPM;m843g';
    config.merchantAccount = 'SAPCOM_TEST_GATEWAY';
    const client = new Client({ config });
    client.setEnvironment('TEST');
    const checkout = new CheckoutAPI(client);
    checkout.payments({
        merchantAccount: config.merchantAccount,
        // STATE_DATA is the paymentMethod field of an object passed from the front end or client app, deserialized from JSON to a data structure.
        paymentMethod: req.body.paymentMethod,
        amount: { currency: 'USD', value: 1000 },
        riskData: req.body.riskData,
        additionalData : {
            allow3DS2: true
         },
        browserInfo: req.body.browserInfo,
        channel: 'web',
        reference: '9527',
        returnUrl: 'http://localhost:3000/redirect-return'
    }).then(result => {
        res.send(result)}, function(reason) {
            console.log(reason);
        });
});

module.exports = router;

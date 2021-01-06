var express = require('express');
var router = express.Router();
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');

router.get('/', function(req, res, next) {
    const config = new Config();
    // Set your X-API-KEY with the API key from the Customer Area.
    config.apiKey = 'AQElhmfuXNWTK0Qc+iSDs1QZpOeUXYVZuIQzn+Z+gOnFREznbz90VxDBXVsNvuR83LVYjEgiTGAH-4dOnhV3xOjgyzaPDa9UQ8TW+gbntp1WhFMc1prI2kjc=-X9pGtf]jPM;m843g';
    config.merchantAccount = 'SAPCOM_TEST_GATEWAY';
    const client = new Client({ config });
    client.setEnvironment('TEST');
    const checkout = new CheckoutAPI(client);
    const paymentsResponse = checkout.paymentMethods({
        merchantAccount: config.merchantAccount,
        countryCode: 'US',
        shopperLocale: 'en-US',
        amount: { currency: 'USD', value: 100, },
        channel: 'Web'
    }).then(result => {
        res.send(result);
    });
});

module.exports = router;
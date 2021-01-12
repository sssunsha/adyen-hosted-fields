// // Adyen account: SAPCOM_TEST_GATEWAY
$(function () {
    function getPaymentMethods() {
        if (workingMode == 'payment') {
            if (orderId.value) {
                // start to post the initiate request
                const requestBody = {
                    'orderId': orderId.value,
                    'emailAddress': 'upscale@sap.com',
                    'resultURL': 'https://example.com/success',
                    'cancelURL': 'https://example.com/cancel',
                    'channel': 'BROWSER',
                    'billingAddress': {
                        'firstName': 'brainTree',
                        'lastName': 'localE2ETest',
                        'addressLine1': '123 Main Street',
                        'addressLine2': '123 Main Street',
                        'addressLine3': '123 Main Street',
                        'city': 'Small Town',
                        'state': 'CA',
                        'country': 'US',
                        'postalCode': 98765
                    },
                    'browserInfo': {
                        'acceptHeader': 'text/html',
                        'colorDepth': 48,
                        'javaEnabled': false,
                        'javaScriptEnabled': false,
                        'language': 'de',
                        'screenHeight': 1200,
                        'screenWidth': 1600,
                        'userAgent': 'Mozilla/4.0',
                        'timezoneOffset': 60,
                        'ipAddress': '192.168.0.1',
                        'originUrl': 'https://example.com'
                    }
                }
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    url: 'https://gateway-approuter-caas2-sap-test.cfapps.us10.hana.ondemand.com/consumer/payment-service/gateway/initiate',
                    headers: {
                        'Customer-session-id': customerSessionId.value,
                        'Authorization': jwtToken.value,
                        'Content-Language': 'en-us'
                    },
                    data: JSON.stringify(requestBody)
                }).done(function (result) {
                    if (result && result.pattern == 'HOSTED_FIELDS') {
                        // start to render the hosted fileds with the response result
                        const htmlSrcUrl = window.URL.createObjectURL(new Blob([result.dynamicScript.html], {type: 'text/html;charset=utf-8'}))
                        dropInUI.src = htmlSrcUrl;
                        // set local storage
                        localStorage.setItem("Authorization", jwtToken.value);
                        localStorage.setItem("Customer-session-id", customerSessionId.value);
                    }
                });
            }
        } else {
            // const ifrdoc = dropInUI.contentWindow.document;
            // ifrdoc.open();
			// ifrdoc.write('<div id="dropin-container"></div>');
			// ifrdoc.close();
            return $.ajax({ url: '/payment-methods' });
        }
    }

    function makePayment(data) {
        if (workingMode == 'payment') {

        } else {
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                url: '/submit',
                headers: {
                    'Content-Language': 'en-us',
                    'is3ds2': $("#action-type:checked").val() == 'on' ? true : false
                    // 'Authorization': authorization,
                    // 'Customer-session-id': customerSessionId
                },
                data: JSON.stringify(data)
            });
        }
    }

    function makeDetailsCall(data) {
        if (workingMode == 'payment') {

        } else {
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                url: '/submit-complete',
                data: JSON.stringify(data)
            });
        }
    }

    function handleActionForRedirect(response) {
        if (response && response.action && response.action.type == 'redirect') {
            localStorage.setItem("redirect-paymentData", response.action.paymentData);
        } else {
            localStorage.setItem("redirect-paymentData", '');
        }
    }

    function showFinalResult(response) {
        if (response) {
            if (response.resultCode == 'Authorised') {
                $("#checkout-message").html(response.resultCode + " : " + response.merchantReference + " : " + response.pspReference);
            } else if (response.resultCode == 'Refused') {
                $("#merror-message").html(response.resultCode + " : " + response.refusalReason);
            } else {
                $("#merror-message").html(response.resultCode + " : (please check the logs for details.)");
            }

            console.log(response);
        }
    }

    function createPaymentConfiguration(paymentMethodsResponse) {
        return {
            paymentMethodsResponse: paymentMethodsResponse, // The `/paymentMethods` response from the server.
            clientKey: 'test_7MSJX6KWXJFUFJYRMAHIFFQ5OEXONJ5W', // Web Drop-in versions before 3.10.1 use originKey instead of clientKey.
            locale: 'en-US',
            environment: 'test',
            onSubmit: (state, dropin) => {
                // first clear message
                $("#checkout-message").html('');
                $("#merror-message").html('');
                // Your function calling your server to make the `/payments` request
                makePayment(state.data)
                    .then(response => {
                        if (response.action) {
                            // Drop-in handles the action object from the /payments response
                            handleActionForRedirect(response);
                            dropin.handleAction(response.action);
                        } else {
                            // Your function to show the final result to the shopper
                            showFinalResult(response);
                        }
                    })
                    .catch(error => {
                        throw Error(error);
                    });
            },
            onAdditionalDetails: (state, dropin) => {
                // Your function calling your server to make a `/payments/details` request
                makeDetailsCall(state.data)
                    .then(response => {
                        if (response.action) {
                            // Drop-in handles the action object from the /payments response
                            handleActionForRedirect(response);
                            dropin.handleAction(response.action);
                        } else {
                            // Your function to show the final result to the shopper
                            showFinalResult(response);
                        }
                    })
                    .catch(error => {
                        throw Error(error);
                    });
            },
            paymentMethodsConfiguration: {
                card: { // Example optional configuration for Cards
                    hasHolderName: true,
                    holderNameRequired: true,
                    enableStoreDetails: true,
                    hideCVC: false, // Change this to true to hide the CVC field for stored cards
                    name: 'Credit or debit card',
                    billingAddressRequired: false
                }
            }
        };
    }
    // init
    workingMode = $("#working-mode").val() || 'payment';
    dropInUI = document.querySelector('#dropin-ui');
    orderId = document.querySelector('#e2e-orderId');
    customerSessionId = document.querySelector('#e2e-customerSessionId');
    jwtToken = document.querySelector('#jwt-token');
    $("#e2e-form").submit(function (event) {
        event.preventDefault();
        // step1: Get available payment methods
        getPaymentMethods().done(res => {
            console.log(res);
            const paymentMethodsResponse = res;
            const configuration = createPaymentConfiguration(paymentMethodsResponse);
            const checkout = new AdyenCheckout(configuration);
            const dropin = checkout.create('dropin').mount('#dropin-container-local');
        });
    });
});
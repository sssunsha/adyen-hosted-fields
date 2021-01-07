// Adyen account: SAPCOM_TEST_GATEWAY

function makePayment(data) {
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

function makeDetailsCall(data) {
    return $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        url: '/submit-complete',
        data: JSON.stringify(data)
    });
}

function showFinalResult(response) {
    if (response) {
        if (response.resultCode == 'Authorised') {
            $("#checkout-message").html(response.resultCode + " : " + response.merchantReference + " : " + response.pspReference);
        } else if(response.resultCode == 'Refused') {
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


function fetchPaymentMethod() {
    $.ajax({ url: '/payment-methods' }).done(res => {
        console.log(res);
        paymentMethodsResponse = res;
        configuration = createPaymentConfiguration(paymentMethodsResponse);
        checkout = new AdyenCheckout(configuration);
        dropin = checkout.create('dropin').mount('#dropin-container');
    });
}


window.onload = function () {
    // init
    var paymentMethodsResponse = {};
    var configuration;
    var checkout;
    var dropin;

    document.querySelector("#e2e-form").addEventListener('submit',function(event){
        event.preventDefault();
        // step1: Get available payment methods
        fetchPaymentMethod();
    });
}
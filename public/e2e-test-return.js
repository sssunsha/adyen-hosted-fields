
window.onload = function () {
    md = $("#MD").text();
    pares = $("#PaRes").text();
    paymentData = localStorage.getItem("redirect-paymentData");

    if (md && pares && paymentData) {
        // make details call
        data = {
            'paymentData': paymentData,
            'details': {
                'MD': md,
                'PaRes': pares
            }
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: '/submit-complete',
            data: JSON.stringify(data)
        }).done(function(response) {
            if (response) {
                if (response.resultCode == 'Authorised') {
                    $("#checkout-message").html(response.resultCode + " : " + response.merchantReference + " : " + response.pspReference);
                } else if (response.resultCode == 'Refused') {
                    $("#error-message").html(response.resultCode + " : " + response.refusalReason);
                } else {
                    $("#error-message").html(response.resultCode + " : (please check the logs for details.)");
                }
        
                console.log(response);
            }
        });
    }
}
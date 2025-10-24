
(function () {
    "use strict";

    function displayError(thisForm, error) {
        thisForm.querySelector('.loading').classList.remove('d-block');
        thisForm.querySelector('.error-message').innerHTML = error;
        thisForm.querySelector('.error-message').classList.add('d-block');
    }

    function formSendSuccess(thisForm) {
        thisForm.querySelector('.loading').classList.remove('d-block');
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
    }

    let forms = document.querySelectorAll('.mc-embedded-subscribe-form');

    forms.forEach(function (e) {
        e.addEventListener('submit', function (event) {
            event.preventDefault();
            let thisForm = this;
            let action = thisForm.getAttribute('action');
            let recaptcha = thisForm.getAttribute('data-sitekey');

            if (!action) {
                displayError(thisForm, 'Looks like something is wrong contact our team!');
                return;
            }
            thisForm.querySelector('.loading').classList.add('d-block');
            thisForm.querySelector('.error-message').classList.remove('d-block');
            thisForm.querySelector('.sent-message').classList.remove('d-block');

            let formData = new FormData(thisForm);
            fetchMailchimpSubmit(thisForm, formData, action);

            //Captch verification

            // if (recaptcha) {
            //     if (typeof grecaptcha !== "undefined") {
            //         grecaptcha.ready(function () {
            //             try {
            //                 grecaptcha.execute(recaptcha, {
            //                     action: 'php_email_form_submit'
            //                 })
            //                 .then(token => {
            //                     formData.set('recaptcha-response', token);
            //                     php_email_form_submit(thisForm, action, formData);
            //                     ajaxMailchimpSubmit(thisForm, action, formData);
            //                 })
            //             } catch (error) {
            //                 displayError(thisForm, error);
            //             }
            //         });
            //     } else {
            //         displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
            //     }
            // } else {
            //     ajaxMailchimpSubmit(thisForm, action, formData);
            // }
        });
    });

    function fetchMailchimpSubmit(thisForm, formData, action) {
        // Convert FormData to URL-encoded string (Mailchimp expects this)
        let params = new URLSearchParams();
        formData.forEach((value, key) => {
            params.append(key, value);
        });

        // Send via fetch
        fetch(action, {
            method: 'POST',
            mode: 'no-cors', // Mailchimp doesn’t allow CORS
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        })
        .then(() => {
            // Mailchimp doesn’t return JSON with no-cors, so assume success
            formSendSuccess(thisForm);
        })
        .catch((error) => {
            displayError(thisForm, 'Submission failed! Please try again.');
            console.error(error);
        });
    }

    function ajaxMailchimpSubmit(thisForm, action, formData) {
        $(thisForm).ajaxChimp({
            url: action,
            callback: function (response) {
                console.log(response);
                if (response.result === 'success') {
                    formSendSuccess(thisForm);
                } else {
                    displayError(thisForm, response.msg);
                }
            }
        });
    }
})();

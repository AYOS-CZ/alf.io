(function() {
    
    'use strict';

    jQuery(function() {

        var hiddenClasses = 'hidden-xs hidden-sm hidden-md hidden-lg';

        $(document).ready(function() {
            $(":input:not(input[type=button],input[type=submit],button):visible:first").focus();
        });
        
        H5F.setup(document.getElementById("payment-form"));
        
        
        //validity
        //ready for ECMAScript6?
        var parser = Number && Number.parseInt ? Number : window;
        var validity = new Date(parser.parseInt($("#validity").attr('data-validity')));
        
        var displayMessage = function() {

            var validityElem = $("#validity");
            var template = validityElem.attr('data-message');

            countdown.setLabels(
                validityElem.attr('data-labels-singular'),
                validityElem.attr('data-labels-plural'),
                ' '+validityElem.attr('data-labels-and')+' ',
                ', ');

            var timerId = countdown(validity, function(ts) {
                        if(ts.value < 0) {
                            validityElem.html(template.replace('##time##', ts.toHTML("strong")));
                        } else {
                            clearInterval(timerId);
                            $('#validity-container').html('<strong>'+validityElem.attr('data-message-time-elapsed')+'</strong>');
                            $('#continue-button').addClass('hidden');
                        }
                    }, countdown.MONTHS|countdown.WEEKS|countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS);

        };
        
        displayMessage();
        

        function submitForm(e) {
            var $form = $(this);
            
            if(!this.checkValidity()) {
                return false;
            }
            
            // Disable the submit button to prevent repeated clicks
            $form.find('button').prop('disabled', true);

            return true;
        }
        
        
        
        $("#cancel-reservation").click(function(e) {
            var $form = $('#payment-form');
            
            $("input[type=submit], button:not([type=button])", $form ).unbind('click');
            $form.unbind('submit');
            $("input", $form).unbind('keypress');
            
            $form
                .attr('novalidate', 'novalidate')
                .unbind('submit', submitForm)
                .find('button').prop('disabled', true);
            $form.trigger("reset");
            $form.append($('<input type="hidden" name="cancelReservation" />').val(true))
            $form.submit();
        });
        
        $('#payment-form').submit(submitForm);

        function markFieldAsError(node) {
            $(node).parent().addClass('has-error');
            if($(node).parent().parent().parent().hasClass('form-group')) {
                $(node).parent().parent().parent().addClass('has-error');
            }
        }

        
        // based on http://tjvantoll.com/2012/08/05/html5-form-validation-showing-all-error-messages/
        // http://stackoverflow.com/questions/13798313/set-custom-html5-required-field-validation-message
        var createAllErrors = function() {
            var form = $(this);

            var showAllErrorMessages = function() {
                $(form).find('.has-error').removeClass('has-error');
                // Find all invalid fields within the form.
                var invalidFields = form.find("input,select,textarea").filter(function(i,v) {return !v.validity.valid;}).each( function( index, node ) {
                    markFieldAsError(node);
                });
            };

            // Support Safari
            form.on("submit", function( event ) {
                if (this.checkValidity && !this.checkValidity() ) {
                    $(this).find("input,select,textarea").filter(function(i,v) {return !v.validity.valid;}).first().focus();
                    event.preventDefault();
                }
            });

            $("input[type=submit], button:not([type=button])", form ).on("click", showAllErrorMessages);

            $("input", form).on("keypress", function(event) {
                var type = $(this).attr("type");
                if ( /date|email|month|number|search|tel|text|time|url|week/.test(type) && event.keyCode == 13 ) {
                    showAllErrorMessages();
                }
            });
        };
        
        $("form").each(createAllErrors);
        $("input,select,textarea").change(function() {
            if( !this.validity.valid) {
                $(this).parent().addClass('has-error');
                if($(this).parent().parent().parent().hasClass('form-group')) {
                    $(this).parent().parent().parent().addClass('has-error');
                }
            } else {
                $(this).parent().removeClass('has-error');
                if($(this).parent().parent().parent().hasClass('form-group')) {
                    $(this).parent().parent().parent().removeClass('has-error');
                }
            }
        });



        $('#first-name.autocomplete-src, #last-name.autocomplete-src').change(function() {
            fillAttendeeData($('#first-name').val(), $('#last-name').val());
        });
        $('#full-name.autocomplete-src').change(function() {
            fillAttendeeData($(this).val());
        });
        $('#email.autocomplete-src').change(function() {
            updateIfNotTouched($('#attendeesData').find('.attendee-email').first(), $(this).val());
        });

        $('#attendeesData').find('.attendee-full-name,.attendee-first-name,.attendee-last-name,.attendee-email').first()
            .change(function() {
                $(this).removeClass('untouched');
            });

        $('#copy-from-contact-data').click(function() {
            var firstOrFullName = $('#first-name').val() || $('#full-name').val();
            fillAttendeeData(firstOrFullName, $('#last-name').val());
            $('#attendeesData').find('.attendee-email').first().val($('#email').val());
        });

        var postponeAssignment = $('#postpone-assignment');

        postponeAssignment.change(function() {
            var element = $('#attendeesData');
            if($(this).is(':checked')) {
                element.find('.field-required').attr('required', false);
                element.addClass(hiddenClasses)
            } else {
                element.find('.field-required').attr('required', true);
                element.removeClass(hiddenClasses)
            }
        });

        if(postponeAssignment.is(':checked')) {
            $('#attendeesData').find('.field-required').attr('required', false);
        }

        function fillAttendeeData(firstOrFullName, lastName) {
            var useFullName = (typeof lastName === "undefined");
            var element = $('#attendeesData');
            if(useFullName) {
                updateIfNotTouched(element.find('.attendee-full-name').first(), firstOrFullName);
            } else {
                updateIfNotTouched(element.find('.attendee-first-name').first(), firstOrFullName);
                updateIfNotTouched(element.find('.attendee-last-name').first(), lastName);
            }
        }

        function updateIfNotTouched(element, newValue) {
            if(element.hasClass('untouched')) {
                element.val(newValue);
            }
        }


        /*function disableBillingFields() {
            $('#vatNr,#vatCountryCode').attr('required', false).attr('disabled', '');
        }

        disableBillingFields();


        $('#invoice-requested').change(function() {
            var element = $('#invoice');
            if($(this).is(':checked')) {
                element.find('.field-required').attr('required', true);
                element.removeClass('hidden');
                euBillingCountry.change();
                if(euBillingCountry.length === 0) {
                    //$('#billing-address-container').removeClass(hiddenClasses);
                    $('#billing-address').attr('required', true).removeAttr('disabled');
                } else {
                    $('#continue-button').attr('disabled', true);
                }
            } else {
                element.find('.field-required').attr('required', false);
                $('#billing-address').attr('required', false).attr('disabled');
                element.addClass('hidden');
                disableBillingFields();
                $('#continue-button').removeAttr('disabled');
            }
        });

        var euBillingCountry = $('#vatCountry');
        euBillingCountry.change(function() {
            if($(this).val() === '') {
                //$('#billing-address-container').removeClass(hiddenClasses);
                $('#billing-address').attr('required', true).removeAttr('disabled');
                $('#validation-result-container, #vat-number-container, #validateVAT').addClass(hiddenClasses);
                $('#vatNr').attr('required', false).attr('disabled', '');
                $("#vatCountryCode").attr('required', false).attr('disabled', '');
            } else {
                $('#billing-address-container').addClass(hiddenClasses);
                $('#validation-result-container, #vat-number-container, #validateVAT').removeClass(hiddenClasses);
                $('#billing-address').attr('required', false).attr('disabled');
                $('#vatNr').attr('required', true).removeAttr('disabled');
                $("#vatCountryCode").attr('required', true).removeAttr('disabled', '');
                var countryCode = $(this).val();
                var validateVATButton = $("#validateVAT");
                if($("#optgroup-eu-countries-list option[value="+countryCode+"]").length === 1) {
                    validateVATButton.text(validateVATButton.attr('data-text'));
                } else {
                    validateVATButton.text(validateVATButton.attr('data-text-non-eu'));
                }
            }
        });

        var invoiceOnlyMode = $('#invoice-requested[type=hidden]') && $('#invoice-requested[type=hidden]').val() == 'true';

        var euVATCheckingEnabled = $("#invoice[data-eu-vat-checking-enabled=true]").length === 1;

        if(!invoiceOnlyMode && euVATCheckingEnabled && $("input[type=hidden][name=vatNr]").length === 0) {
            $("#billing-address-container").addClass(hiddenClasses);
        }

        // invoice only mode
        if(invoiceOnlyMode) {
            $('#billing-address').attr('required', true).removeAttr('disabled');
            $('#billing-address-container').removeClass(hiddenClasses);
            $('#invoice').removeClass('hidden');
            $("#eu-vat-check-countries").addClass(hiddenClasses);
        }

        $("#add-company-billing-details").change(function() {
            if($(this).is(':checked')) {
                $('#billing-address').attr('required', false).attr('disabled');
                $('#billing-address-container').addClass(hiddenClasses);
                $("#eu-vat-check-countries").removeClass(hiddenClasses);
                $('#continue-button').attr('disabled', true);
                if(euVATCheckingEnabled) {
                    $("#vatCountry").attr('required', true).removeAttr('disabled', '');
                }
            } else {
                $('#continue-button').attr('disabled', false);
                $('#billing-address').attr('required', true).removeAttr('disabled');
                $('#billing-address-container').removeClass(hiddenClasses);
                $("#eu-vat-check-countries").addClass(hiddenClasses);
                $("#vatCountry").removeAttr('required').removeAttr('disabled', '');
            }
        });
        //

        $('#validateVAT').click(function() {
            var frm = $(this.form);
            var action = $(this).attr('data-validation-url');
            var vatInput = $('#vatNr');
            vatInput.removeClass('has-error');
            vatInput.parent('div').removeClass('has-error');
            var vatNr = vatInput.val();
            var country = euBillingCountry.val();
            var resultContainer = $('#validation-result');
            if(vatNr !== '' && country !== '') {
                var btn = $(this);
                var previousText = btn.text();
                btn.html('<i class="fa fa-circle-o-notch fa-spin"></i>');
                $('#continue-button').attr('disabled', true);
                jQuery.ajax({
                    url: action,
                    type: 'POST',
                    data: frm.serialize(),
                    success: function() {
                        window.location.reload();
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        vatInput.addClass('has-error');
                        vatInput.parent('div').addClass('has-error');
                        if(xhr.status === 400) {
                            resultContainer.html(resultContainer.attr('data-validation-error-msg'));
                        } else if (xhr.status === 503) {
                            resultContainer.html(resultContainer.attr('data-vies-down'));
                        } else {
                            resultContainer.html(resultContainer.attr('data-generic-error-msg'));
                        }
                    },
                    complete: function(xhr) {
                        btn.text(previousText);
                        var vatInput = $('#vatNr');
                        if(vatInput.hasClass('has-error')) {
                            $('#continue-button').attr('disabled', true);
                        } else {
                            $('#continue-button').attr('disabled', false);
                        }
                    }

                });
            }
        })

        $('#reset-billing-information').click(function() {
            var action = $(this).attr('data-reset-billing-information-url');
            var frm = $(this.form);
            jQuery.ajax({
                url: action,
                type:'POST',
                success: function() {
                    window.location.reload();
                },
                data:frm.serialize()
            });
        });*/

        $("select").map(function() {
            var value = $(this).attr('value');
            if(value && value.length > 0) {
                $(this).val(value);
            }
        });


        $("#invoice-requested").change(function() {
            if($("#invoice-requested:checked").length) {
                $(".invoice-details-section").removeClass(hiddenClasses);
                $("#billingAddressLine1, #billingAddressZip, #billingAddressCity, #vatCountry").attr('required', true)

            } else {
                $(".invoice-details-section").addClass(hiddenClasses);
                $(".invoice-details-section input").removeAttr('required');
            }
        });

        $("#vatCountry").change(function() {
            $("#selected-country-code").text($("#vatCountry").val());
        });

        //
        $("#vatCountry").change();
        $("#invoice-requested").change();

    });

    /*window.recaptchaLoadCallback = function() {
        window.recaptchaReady = true;
        var methods = $('input[name=paymentMethod]');
        if(methods.length === 1) {
            methodSelected(methods.val());
        } else if(methods.length === 0) {
            $('#captcha-FREE').each(function(e) {
                methodSelected('FREE');
            });
        }
    };

    var methodSelected = function(method) {
        if((method === 'FREE' || method === 'OFFLINE' || method === 'ON_SITE') && window.recaptchaReady) {
            $('.g-recaptcha').each(function(i, e) {
                try {
                    grecaptcha.reset(e.id);
                } catch(x) {}
            });
            try {
                grecaptcha.render('captcha-'+method, {
                    'sitekey': $('#captcha-'+method).attr('data-sitekey'),
                    'hl': $('html').attr('lang')
                });
            } catch(x) {}
        }
    };*/


})();
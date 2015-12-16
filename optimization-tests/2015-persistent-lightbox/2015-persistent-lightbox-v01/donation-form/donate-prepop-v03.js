[[U8:text/javascript]]
/* Donation Pre-population for persistent lightbox test DECEMBER 2015 */
var addlErrorText = '<span class="error addl-error-text">You may also contact us at 212-310-6672 for assistance from 9:00 am to 5:00 pm, Monday through Friday.</span>';

String.prototype.contains = function(contains) {
    return this.indexOf(contains) != -1 ? true : false;
};

jQuery.fn.center = function () {
    this.parent().css({
    	'z-index': '100000',
    	'position': 'fixed',
    	'top': '0',
    	'left': '0',
    	'width': $(window).width(),
    	'height': $(window).height(),
    	'opacity': '0.75'
    }).show();

    this.css("position","absolute");
    this.css("top", "50%");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
}; 

jQuery.fn.numericOnly =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
                key == 8 || 
                key == 9 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};

function numbersOnly(e,decimal){
	var key;
	var keychar;
	if(window.event)
	   key=window.event.keyCode;
	else if(e)
	   key=e.which;
	else
	   return true;
	keychar=String.fromCharCode(key);
	if((key==null)||(key==0)||(key==8)||(key==9)||(key==13)||(key==27))
	   return true;
	else if((("0123456789").indexOf(keychar)>-1))
	   return true;
	else if(decimal&&(keychar==".")) 
	  return true;
	else
	   return false;
}

/* function to validate the form and submit the data for processing via AJAX */
function processDonationForm() {
	if ($('#anonymousDonation').prop('checked')=='true') {
		$('#annualReportName').val('');
	}
	if ( $('#donation_form_id').valid() ) {
		$('#btnSubmit').attr('disabled','disabled').css('opacity','0.5');
		$('#memLoader img').center();
		$('#ccApiErrors').hide();
		$.ajax({
			type		: 'post',
			data		: $('#donation_form_id').serialize(),
			url			: '[[S551:CRDonationAPI]]',
			success		: function(response) {
				$('#btnSubmit').removeAttr('disabled').css('opacity','1');
				$('#memLoader').hide();
				window.location = '[[S6]]?pagename=donate_thanks';
				//window.location = 'https://secure2.convio.net/cpc/site/SPageNavigator/donate_thanks.html';
			},
			error		: function(response) {
				$('#btnSubmit').removeAttr('disabled').css('opacity','1');
				$('#memLoader').hide();
				var errorMessage = '';
				if ($(response.responseText).find('fieldError').length > 0 && $(response.responseText).find('fieldError').html() != '') {
					errorMessage = $(response.responseText).find('fieldError').html()+addlErrorText;
				} else if ($(response.responseText).find('pageError').length > 0 && $(response.responseText).find('pageError').html() != '') {
					errorMessage = $(response.responseText).find('pageError').html()+addlErrorText;
				} else {
					errorMessage = 'An unexpected error occurred.'+addlErrorText;
				}
				$('#ccApiErrors').show().html(errorMessage);
			}
		});
	} else {
		window.scrollBy(0,-50);
	}
};

/* onload */
(function($) {
	$(function() {
	
		//Other Mary/Bo edits
		$('.anonymous').show();

	//monthly giving and other amount values for persistent lightbox test 2015
    if (window.location.href.indexOf("&monthly_gift") > -1) {
      $('#level_autorepeat').prop("checked", true);
    }

    if (window.location.href.indexOf("&other_amount") > -1) {
      var myOtherAmount = window.location.href.split("-", 2);
      var finalAmount = myOtherAmount[1];
      $('#other_amount').focus();
      $('#other_amount').blur();
      $('#otherAmount').attr('value', finalAmount);
      $('#other_amount').val(finalAmount);

    }

		//show staff-"selected" State when page loads CPC (Mary/Bo edits)
		function clickLevel(thisLabel) {
			$('.level').removeClass('level_selected');
			 // $('#level_id_6').prop('checked', false);
			$(thisLabel).addClass('level_selected');
			var benefits = '#' + $(thisLabel).find('input[type="radio"]').val();
			$('.level-description > div').hide();
			$(benefits).show();
		}
		
		function preSelect(myParameter) {
			var myLevel = (myParameter - 1).toString();
			var myLabel = $('#label_id_' + myLevel).get(0);
			var myInput = '#level_id_' + myLevel;
			$(myInput).prop("checked",true);
			clickLevel(myLabel);
		}

		
		//show the "selected" State when clicking on a donation amount
		$('.level').click(function(e){
      		$('#other_amount').val(" ");
			clickLevel(this);
			e.stopPropagation();

		});

    //other amount 
    $('#other_amount').keyup(function() { 
      $('.level').removeClass('level_selected'); 
      // $('#level_id_6').prop('checked', true);
    });
		
		/* static and some dynamic validation rules for the donation form
		   only handling front-end validation, no back-end validation such as credit card authorization */
		$('#donation_form_id').validate({
			rules: {
				'level_id'					: 'required',
				'billing.name.first'		: { 'required' : true, 'maxlength' : 50 },
				'billing.name.last'			: { 'required' : true, 'maxlength' : 50 },
				'billing.address.street1'	: { 'required' : true, 'maxlength' : 50 },
				'billing.address.street2'	: { 'maxlength' : 50 },
				'billing.address.city'		: { 'required' : true, 'maxlength' : 50 },
				'billing.address.state'		: 'required',
				'billing.address.zip'		: 'required',
				'donor.email'				: { 'required': true, 'email': true, 'maxlength' : 50 },
				'card_number'				: 'required',
				'card_cvv'					: 'required',
				'card_exp_date_month'		: 'required',
				'card_exp_date_year'		: 'required'
			},
			messages: {
				'level_id'					: '* required',
				'billing.name.title'		: '* required',
				'billing.name.first'		:  { 'required':	'* required',
												'maxlength':	'* maximum length 50 characters' },
				'billing.name.last'			: { 'required':		'* required',
												'maxlength':	'* maximum length 50 characters' },
				'billing.address.street1'	: { 'required':		'* required',
												'maxlength':	'* maximum length 50 characters' },
				'billing.address.street2'	: { 'maxlength':	'* maximum length 50 characters' },
				'billing.address.city'		: { 'required':		'* required',
												'maxlength':	'* maximum length 50 characters' },
				'billing.address.state'		: '* required',
				'billing.address.zip'		: '* required',
				'donor.email'				: { required: '* required', email: '* please enter a valid email', 'maxlength':	'* maximum length 50 characters' },
				'card_number'				: '* required',
				'card_cvv'					: '* required',
				'card_exp_date_month'		: '* required',
				'card_exp_date_year'		: '* required'
			}
		});

		$('#cardNumber').numericOnly();

				
		/* STARTUP */
				
		/* override the HTML form submission so the user remains on the page while the AJAX processing can occur */
		$('#donation_form_id').submit(function() {
			processDonationForm();
			return false;
		});
		
		
		$('#donation_form_id').attr('action', 'javascript:void(0);');
		
		/* Initialize rules and values on page load */
		//$('ul.levels input:checked').click();
		//$('ul.levels input:checked').mouseover().mouseout(); //change to this as the click handler wasn't behaving with code edits

		//preselect level here
		[[?xxnullx::x[[S334:levelID]]x::preSelect();::preSelect([[S334:levelID]]);]]
		
	});
	
})(jQuery);
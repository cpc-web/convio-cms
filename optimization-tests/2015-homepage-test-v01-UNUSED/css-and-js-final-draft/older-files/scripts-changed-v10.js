
$.preloadImages = function() {
  for (var i = 0; i < arguments.length; i++) {
    $("<http://www.centralparknyc.org/assets/images/2015/images/images/>").attr("src", arguments[i]);
  }
}

$.preloadImages("mid-cta-01-hover.jpg","mid-cta-03-hover.jpg", "feature-01-hover.jpg", "feature-01-hover.jpg");


(function( $ ) {
  if (window.matchMedia("only screen and (min-width: 767px)").matches) {
    function ctaOver() {
      $('.cta-interaction').mouseover(function() {
        var arr = $(this).attr('id').split('-');
        var x = arr[1];
        activeOn(x);   
      });
    }

    function ctaOff() {
      $('.cta-interaction').mouseout(function() {
        var arr = $(this).attr('id').split('-');
        var y = arr[1];
        activeOff(y);   
      });
    }

    function activeOn(x) {
     	$('.cta-middle-' + x).removeClass('cta-' + x).addClass('cta-' + x + '-active');
      $('.inner-header-' + x).removeClass('inner-content-header').addClass('inner-content-header-active');
      $('.inner-sub-' + x).removeClass('inner-content-sub').addClass('inner-content-sub-active');
    }

    function activeOff(z){
  		$('.cta-middle-' + z).addClass('cta-' + z).removeClass('cta-' + z + '-active');
  		$('.inner-header-' + z).addClass('inner-content-header').removeClass('inner-content-header-active');
  		$('.inner-sub-' + z).addClass('inner-content-sub').removeClass('inner-content-sub-active');
    }

    $(ctaOver);
    $(ctaOff);
  }

})(jQuery); 

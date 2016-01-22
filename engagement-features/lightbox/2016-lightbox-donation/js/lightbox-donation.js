
(function($){
  $(function() {
    // REGISTER MODAL SCRIPTS
    var cookieValue = readCookie('cpc-2016');
    var submittedFlag = false;
    if (cookieValue == 'success' || cookieValue == 'close') {
      console.log('cookie: ', cookieValue); // cookie exists
    } else {
      $('#captureModal').modal('show').on('hidden.bs.modal', function () {
        if (!submittedFlag) {
          console.log('fired close function form NOT submitted...');
          setCookie("cpc-2016", "close", 30);
        } else {
          console.log('fired close function WITH form submitted...');
        }
      });
    }
    var urlFull = document.location.href;
    $('.closeModal').click(function() {
      $('#captureModal').modal('hide');
    });
  });
})(jQuery);

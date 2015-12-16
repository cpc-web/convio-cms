(function($){
  $(function() { 
    var cookieValue = readCookie('2015cpcEOYPersistentLB');
    if (cookieValue == 'success') {
      ("#per-menu").toggleClass("active");
    }
    else {
      $("#per-menu").addClass("active");
    }
  });

  $(".menu-sidebar").click(function(){
    $("#per-menu").toggleClass("active");
  });
})(jQuery);




(function($){
  $(function() {
    // REGISTER MODAL SCRIPTS
    var cookieValue = readCookie('2015cpcEOYPersistentLB');
    var submittedFlag = false;
    if (cookieValue == 'success') {
      console.log('cookie: ', cookieValue); // cookie exists
    } else {
      $('#captureModal').modal('show').on('hidden.bs.modal', function () {
        if (!submittedFlag) {
          console.log('show persistent lightbox - no cookie');
          setCookie("2015cpcCaptModal_cky", "close", 1);
        } else {
          console.log('do not show persistent lightbox - cookie');
        }
      });
    }
  });  
})(jQuery);    



$(".menu-sidebar").click(function(){
  $("#per-menu").toggleClass("active");
});




//assign button value to link on donate cta
(function($){
   $(function() {

    var myLink;

    var otherAmount;

    var originalLink = "https://secure2.convio.net/cpc/site/SPageServer?pagename=donate_eoycampaign_2015_persistent_lb";
    
    function linkUrl () {
      $(".donateCta").attr("href", originalLink);
      var ctaLink = $(".donateCta").attr("href") + myLink;
      $(".donateCta").attr("href", ctaLink);
        console.log(ctaLink);
    }

    function otherAmountURL () { ;
      $(".donateCta").attr("href", originalLink);
      otherAmount = $(".donateCta").attr("href") + "&" + $('#other_amount').val();
      $(".donateCta").attr("href", otherAmount);
        console.log(otherAmount);
    }


    $(".btn-plb").click(function () {
      // get number at end of id and assign to new variable
      $('#other_amount').val("");
      var buttonId = $(this).attr("id").charAt(5);
      function donateAmount () {
        // create var with number at end 
        myLink = "&levelID=" + buttonId;
          console.log(myLink); 
      }
      donateAmount();
    }); 

    $('#other_amount').keyup(function() {
      myLink = null;
      console.log(myLink);
      otherAmount = $(this).val();
      console.log(otherAmount);
    });

    
    $(".btn-cta").click(function () {     
      if (myLink){
        linkUrl();
        console.log("linkURL function running")    
      }
      if (otherAmount) {
        otherAmountURL();
        console.log("otherAmount function running")
      }
    });
    
  });  

console.log('buttonid necessary?' );

})(jQuery);      










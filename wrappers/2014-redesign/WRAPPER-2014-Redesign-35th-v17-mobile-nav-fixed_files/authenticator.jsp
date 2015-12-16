

(function() {
  var hostID = 60753771;

  // Initialize the authenticator.
  YAHOO.convio.authenticator.init({
    checkUrl: '/components/authenticator/check-signin.jsp?format=json',
    doAuthenticate : function(o) {
      CmsXBrowser.showDialog({
        url: '/components/authenticator/signin.jsp?hostID=' + hostID,
        width: 700,
        height: 500,
        inline: true
      });
    },
    doForbidden: function(o) {
      CmsXBrowser.showDialog({
        url: '/components/authenticator/permission-denied.jsp',
        inline: true
      });
    }
  });
})();

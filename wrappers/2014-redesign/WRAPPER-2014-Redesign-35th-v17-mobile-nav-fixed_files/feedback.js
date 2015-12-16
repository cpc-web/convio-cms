/**
 * $Source$
 * $Author$
 * $Revision$
 * $Date$
 *
 * Feedback form hooks.
 **/

YAHOO.namespace("convio.feedback");
YAHOO.convio.feedback = {

  /**
   * Shows the feedback form dialog.
   *
   * @param hostID The host ID.
   * @param tag    A tag identifying the content area.
   * @param blurb  A short blurb
   */
  showForm: function(hostID, tag, blurb) {
    if (! hostID) {
      alert("hostID is required for the feedback form.");
      return;
    }

    if (! tag) {
      alert("Tag is required for the feedback form.");
      return;
    }

    blurb = blurb || 'Please let us know what you think about this feature.';

    var url = "/admin/components/feedback/dialog.jsp";
    url += "?hostID=" + encodeURIComponent(hostID);
    url += "&tag=" + encodeURIComponent(tag);

    var listeners = {
      argument: {blurb: blurb},
      process: function(o) {
        if (typeof(MenuBar) != 'undefined') {
          MenuBar.showMessage("Thank you for your feedback!", true);
        }
      },
      authenticate: false
    };

    YAHOO.convio.dialog.open(url, listeners);
  }

};

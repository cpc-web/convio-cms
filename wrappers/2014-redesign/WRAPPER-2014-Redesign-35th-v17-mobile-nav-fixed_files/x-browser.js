/**
 * $Source$
 * $Author$
 * $Revision$
 * $Date$
 *
 * X-browser methods.
 *
 **/ 

var CmsXBrowser = {

  /**
   * Clones a node and its children.
   */
  cloneNode : function(element) {
    if (! element) { return; }

    var copy = element.cloneNode(true);

    // Workaround for IE6 bug: http://support.microsoft.com/kb/829907
    // Preserve selectedIndex when cloning <select></select> elements.
    var originalSelects = element.getElementsByTagName('SELECT');
    var clonedSelects = copy.getElementsByTagName('SELECT');
    for (var i = 0; i < originalSelects.length; i++) {
      clonedSelects[i].selectedIndex = originalSelects[i].selectedIndex;
    }

    return copy;
  },

  /**
   * Opens a dialog window.
   *
   * @param windowProperties
   * @param dialogParams  optional parameters to pass into the dialog.
   *
   * e.g., var result = CmsXBrowser.showDialog({
   *                       url : 'http://www.google.com',
   *                       width : 400,
   *                       height : 400
   *                       inline : true
   *                    }, {
   *                       foo : 'bar'
   *                    });
   *
   */
  showDialog : function(windowProperties, dialogParams) {
    if (! windowProperties) { return; }

    var url = windowProperties.url;
    if (! url) { return; }

    var width = (windowProperties.width ? windowProperties.width : 480);
    var height = (windowProperties.height ? windowProperties.height : 300);
    var isResizable = (windowProperties.resizable ? windowProperties.resizable : true);
    var scroll = (windowProperties.scroll ? windowProperties.scroll : true);
    var toolbar = (windowProperties.toolbar ? windowProperties.toolbar : true);
    var isInline = (windowProperties.inline ? windowProperties.inline : false);

    // Add a nocache query parameter to prevent browser caching.
    var now = new Date();
    var millis = Date.parse(now);
    url += url.match(/\?/) ? "&" : "?";
    url += "nocache=" + millis;

    
    // Mac version of firefox do not handle the interactions between more than two levels of modal dialogs well.  
    // If the user is coming from FF on a mac, let just skip the modal dialog entirely. (see bz 53569)
    var isMacFF = (CmsXBrowser.isMac() && CmsXBrowser.isFireFox()); 
    
    if (isInline && !isMacFF) {
      // Modal dialog.

      if (window.showModalDialog) {
        return window.showModalDialog(url, dialogParams,
                                      "dialogHeight: " + height + "px; dialogWidth: " + width +
                                      "px; dialogTop: px; " +
                                      "dialogLeft: px; edge: Raised; center: Yes; help: No; " +
                                      "resizable: " + (isResizable ? "Yes" : "No") + "; status: No;");

      } else {
        return window.open(url, dialogParams,
                           'height=' + height + ',width=' + width + 
                           ',toolbar=' + (toolbar ? "yes" : "no") + 
                           ',directories=no,status=no,menubar=no' + 
                           ',scrollbars=' + (scroll ? "yes" : "no") +
                           ',resizable=' + (isResizable ? "yes" : "no") + ',modal=yes');
      }
    } else {
      // Non-modal dialog.
      return window.open(url, dialogParams,
                         'height=' + height + ',width=' + width + 
                         ',toolbar=' + (toolbar ? "yes" : "no") + 
                         ',directories=no,status=no,menubar=no' + 
                         ',scrollbars=' + (scroll ? "yes" : "no") + 
                         ',resizable=' + (isResizable ? "yes" : "no") + ',modal=no');
    }
  },
  
  _checkForInnerTextFeature : function() {
    return (document.getElementsByTagName("body")[0].innerText != undefined) ? true : false;
  },
      
  innerText : function(link) {
    return (CmsXBrowser._checkForInnerTextFeature())?link.innerText:link.textContent;
  },          
      
  setInnerText : function(link, newText) {
    if (CmsXBrowser._checkForInnerTextFeature()) {
      link.innerText = newText; 
    } else {
      link.textContent = newText;
    }
  },
  
  srcElement : function(event) {
    if (event.srcElement) {
      return event.srcElement;   
    } else {
      return event.target;
    }
  },
  
  removeNode : function(node, removeChildren) {
    if (node.removeNode) {
      node.removeNode(removeChildren);
    } else {
      //Function doesn't exist on firefox:
      node.parentNode.removeChild(node, removeChildren);
    }
  },

  outerHTML : function(node) {
    if (! node) {
      return null;
    }

    if (typeof(node.outerHTML) != 'undefined') {
      return node.outerHTML;
    } else {
      var parent = document.createElement('div');
      parent.appendChild(node);
      return parent.innerHTML;
    }
  },

  getSelection : function() {
    var userSelection;
    if (window.getSelection) {
      userSelection = window.getSelection();
    } else if (document.selection) { // should come last; Opera!
      userSelection = document.selection.createRange();
    } else {
      alert("Unable to get the user selection!");
    }

    return userSelection;
  },

  /**
   * Clears all options from a select list.
   *
   * @param selector The selector node
   */
  clearOptions : function(selector) {
    selector.length = 0;
  },

  /**
   * Removes a specific option from a select list.
   *
   * @param selector The selector node
   * @param option   The option node
   */
  removeOption : function(selector, option) {
    selector.removeChild(option);
  },

  /**
   * Appends an option to the end of the select list.
   *
   * @param selector The selector node
   * @param label The text label
   * @param value The option value
   * @param defaultSelected Indicates whether the option is selected by default
   * @param isSelected Indicates whether the option is currently selected
   * @return the appended Option object
   */
  appendOption : function(selector, label, value, defaultSelected, isSelected) {
    var option = new Option(label, value, defaultSelected, isSelected);
    selector.options[selector.length] = option;
    return option;
  },
  
  isIE : function() {
    return (YAHOO.env.ua.ie > 0);
  },
  
  isFireFox : function() {
    return (YAHOO.env.ua.gecko > 0);
  },
  
  isWindows : function() {
    return (YAHOO.env.ua.os != null && YAHOO.env.ua.os.toLowerCase() == 'windows');
  },
  
  isMac : function() {
    return (YAHOO.env.ua.os != null && YAHOO.env.ua.os.toLowerCase() == 'macintosh');
  },
  
  /**
   * Firefox doesn't support the "innerText" function.  It supports textContent instead.
   */
  innerText : function(el) {
    if (CmsXBrowser.isIE()) { 
      return el.innerText; 
    } else { 
      return el.textContent; 
    }
  },
  
  setInnerText : function(el, value) {
    if (CmsXBrowser.isIE()) {
      el.innerText = value;
    } else {
      el.textContent = value;
    }
  },
  
  replaceNode : function(oldNode, newNode) {
    if (CmsXBrowser.isIE()) {
      oldNode.replaceNode(newNode);
    } else {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }
  },

  createButton: function(document) {
      var button = null;
      if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9) {
          button = document.createElement("<INPUT TYPE=BUTTON>");
      } else {
          button = document.createElement("INPUT");
          button.type = "BUTTON";
      }
      return button;
  }

};

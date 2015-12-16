if (! window.attachEvent && window.addEventListener) {
  window.attachEvent = function(eventID, handler) {
    eventID = eventID.replace(/^on/, "");
    window.addEventListener(eventID, handler, false);
  }
}

var DialogTools = new Object();
DialogTools.width = null;
DialogTools.height = null;

function sizeDialog() {

  var bodyContainer = document.getElementById("bodyContainer");
  if (! bodyContainer) {
    return;
  }

  if (! DialogTools.width) {
    var width = bodyContainer.offsetWidth + 34;
    if (width > 1024) {
      width = 1024;
    }
    setDialogWidth(width + "px");
  } else {
    setDialogWidth(DialogTools.width);
  }

  sizeDialogHeight();
}

function setDialogWidth(width) {
  if (window.dialogWidth) {
    window.dialogWidth = width;
  } else {
    var re = /(\d+)/;
    var arr = re.exec(width);
    winWidth = RegExp.$1;
    window.resizeTo(winWidth, window.innerHeight);
  }
}

function sizeDialogHeight() {

  if (! DialogTools.height) {

    var bodyContainer = document.getElementById("bodyContainer");
    if (! bodyContainer) {
      return;
    }

    var re = /(\d+)/;
    var winHeight = 
      window.dialogHeight ? window.dialogHeight : window.outerHeight;
    var arr = re.exec(winHeight);
    winHeight = RegExp.$1;

    var heightDiff = winHeight - DialogTools.getHeight() + 30;

    var height = bodyContainer.offsetHeight + heightDiff;

    setDialogHeight(height + "px");

  } else {
    setDialogHeight(DialogTools.height);
  }
}

function setDialogHeight(height) {
  if (window.dialogHeight) {
    window.dialogHeight = height;
  } else {
    var re = /(\d+)/;
    var arr = re.exec(height);
    winHeight = RegExp.$1;
    window.resizeTo(window.innerWidth, winHeight);
  }
}

window.attachEvent("onload", sizeDialog);

// truncates the string "s" to a maximum of "maxLength" characters
// if "cleanBreak" is not false, the break occurs between words (at a ' ' at least)
// "trailer" is appended to the truncated string
function truncate(s, maxLength, cleanBreak, trailer) {

  if (!trailer) {
    var trailer = "..."; 
  }

  if (s == null) return "";
  if (cleanBreak) {
    return (s.length < maxLength) ? s : 
      s.substring(0, s.substring(0,maxLength).lastIndexOf(' ')) + trailer;
  } else {
    return (s.length < maxLength) ? s : 
      s.substring(0, maxLength - 3) + trailer;
  }
}

function showDialog(path, arguments, width, height, modeless) {

  var now = new Date();
  var millis = Date.parse(now);

  path += path.match(/\?/) ? "&" : "?";
  path += "nocache=" + millis;

  var resizable = "Yes";

  if (! width) width = "";
  if (! height) height = "";

  if (modeless) {
    if (window.showModelessDialog) {
      window.showModelessDialog(
        path, arguments,
        "dialogHeight: " + height + "px; dialogWidth: " + width + 
        "px; dialogTop: px; " +
        "dialogLeft: px; edge: Raised; center: Yes; help: No; " +
        "resizable: " + resizable + "; status: No;");
    } 
  } else {
    if (window.showModalDialog) {
      return window.showModalDialog(
        path, arguments,
        "dialogHeight: " + height + "px; dialogWidth: " + width + 
        "px; dialogTop: px; " +
        "dialogLeft: px; edge: Raised; center: Yes; help: No; " +
        "resizable: " + resizable + "; status: No;");
    } else {
      window.dialogArguments = arguments;
      window.dialogReturnValue = null;
      var dialog = window.open(path, "dialog",
        "width=300,height=300,status=no,dialog=yes,modal=yes");
      return window.dialogReturnValue;
    }
  }
}

var isFirstLoad = true;

function doSubmitNotify(returnValue) {

  if (isFirstLoad) {
    isFirstLoad = false;
    return;
  }

  try {

    var submitDoc = getFrameDocument('submitFrame');

    if (getResultCode(submitDoc)) {

      if (returnValue && returnValue instanceof Function) {
        returnValue = returnValue(submitDoc);
      }

      window.returnValue = returnValue ? returnValue : true;
      window.close();
    }

    return true;

  } catch (e) {

    alert("The server seems to be unavailable.  Please check your network " +
	  "connection and try again.  If the problem persists, contact " +
	  "the system administrator for help.");

    return false;
  }
}

function handleResultCode(resultCode) {
  return false;
}

function getResultCode(resultDoc) {

  var innerHTML = (document.getElementsByTagName("body")[0].innerHTML != "undefined");

  var codeElement = resultDoc.getElementById('resultCode');
  var resultCode = (codeElement) ? (innerHTML ? codeElement.innerHTML : codeElement.textContent) : "error";
  
  if (handleResultCode(resultCode, resultDoc)) {
    return false;
  }
  
  if (resultCode == "nouser") {
    alert("Your session has expired.  Please close this window, sign in " +
          "and try again.");
    return false;
  }

  if (resultCode == "noauth") {
    alert("You do not have permission to make these changes.  Please check " +
          "with an administrator.");
    return false;
  }

  if (resultCode == "error") {
    var args = {};

    var detailElement = resultDoc.getElementById('resultDetail');
    if (detailElement) {
      args.details = (innerHTML ? detailElement.innerHTML : detailElement.textContent);
    } else {
      args.details = resultDoc.body.innerHTML;
    }

    var messageElement = resultDoc.getElementById('resultMessage');
    if (messageElement) {
      args.message = (innerHTML ? messageElement.innerHTML : messageElement.textContent);
    }

    showDialog("/components/dialog/error.html", args);

    return false;
  }

  return true;
}

function getFrameDocument(id) {

  var frame = 
    document.all ? document.frames(id) : document.getElementById(id);

  if (! frame) {
    alert("No frame found with ID '" + id + "'");
  }

  var doc = 
    frame.contentDocument ? frame.contentDocument : frame.document;

  return doc;
}

DialogTools.getWidth = function() {

  var myWidth = 0;
  if( typeof(window.innerWidth) == 'number') {
    //Non-IE
    myWidth = window.innerWidth;
  } else if (document.documentElement && 
	     (document.documentElement.clientWidth || 
	      document.documentElement.clientHeight)) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
  } else if (document.body && 
	     (document.body.clientWidth || document.body.clientHeight)) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
  }

  return myWidth;
}

DialogTools.getHeight = function() {

  var myHeight = 0;
  if( typeof(window.innerHeight) == 'number') {
    //Non-IE
    myHeight = window.innerHeight;
  } else if (document.documentElement && 
	     (document.documentElement.clientWidth || 
	      document.documentElement.clientHeight)) {
    //IE 6+ in 'standards compliant mode'
    myHeight = document.documentElement.clientHeight;
  } else if (document.body && 
	     (document.body.clientWidth || document.body.clientHeight)) {
    //IE 4 compatible
    myHeight = document.body.clientHeight;
  }

  return myHeight;
}

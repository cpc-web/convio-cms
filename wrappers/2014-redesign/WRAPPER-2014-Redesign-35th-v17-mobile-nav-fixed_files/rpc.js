var RPCHandler = new Object();

RPCHandler.isLoading = true;
RPCHandler.FRAME_ID = "rpc";
RPCHandler.EMPTY_RESULT_CODE = null;

RPCHandler.setResponseListener = function(responseListener) {
  RPCHandler.responseListener = responseListener;
}

RPCHandler.setErrorListener = function(errorListener) {
  RPCHandler.errorListener = errorListener;
}

RPCHandler.submit = function(url) {

  var now = new Date();
  var millis = Date.parse(now);

  window.status = "Please wait...";

  url += (url.indexOf("?") == -1) ? "?" : "&";
  url += "nocache=" + millis;
  url += "&nologin=true";

  var frame = document.getElementById(RPCHandler.FRAME_ID);
  if (! frame) { 
    alert("Frame " + RPCHandler.FRAME_ID + " not found."); 
    return; 
  }
  
  frame.contentWindow.document.location.replace(url);
}

RPCHandler.getDocument = function() {
  var frame = null;

  if (document.all) {
    try {
      frame = document.frames(RPCHandler.FRAME_ID);
    } catch (e) {}
  }

  if (! frame) {
    frame = document.getElementById(RPCHandler.FRAME_ID);
  }

  if (! frame) { 
    alert("Frame " + RPCHandler.FRAME_ID + " not found."); 
    return; 
  }

  try {
    doc = frame.contentWindow ? frame.contentWindow.document : 
      frame.contentDocument ? frame.contentDocument : frame.document;
    return doc;
  } catch (e) {
    if (RPCHandler.errorListener) {
      RPCHandler.errorListener(e);
    }
    return;
  }
}

RPCHandler.notify = function() {
  if (RPCHandler.isLoading) { 
    RPCHandler.isLoading = false;
    return; 
  }

  window.status = "Done";

  var doc = RPCHandler.getDocument();

  if (! doc) { 
    // alert("Document for frame " + RPCHandler.FRAME_ID + " not found."); 
    return; 
  }

  var resultCode = null;

  var trimmedHTML = doc.body.innerHTML.replace(/^\s+|\s+$/g,"");
  if (trimmedHTML == "") {
    if (! RPCHandler.EMPTY_RESULT_CODE) { return; }
    resultCode = RPCHandler.EMPTY_RESULT_CODE;
  } else {
    resultCode = RPCHandler.getResultCode(doc);
  }

  if (resultCode && RPCHandler.handlers[resultCode]) {
    RPCHandler.handlers[resultCode](doc);
  } else {
    RPCHandler.defaultHandler(doc);
  }

  if (RPCHandler.responseListener) {
    RPCHandler.responseListener(doc);
  }
}

RPCHandler.getResultCode = function(doc) {

  var resultCode = RPCHandler.getText(doc, "resultCode");
  if (! resultCode) { resultCode = "error"; }

  return resultCode;
}

RPCHandler.getText = function(doc, id) {

  if (! doc) { return null; }

  var element = doc.getElementById(id);
  if (! element) { return null; }

  return element.firstChild.nodeValue;
}

RPCHandler.setResponseHandler = function(resultCode, handler) {

  RPCHandler.handlers[resultCode] = handler;
}

RPCHandler.showDialog = function(path, arguments, width, height) {

  var now = new Date();
  var millis = Date.parse(now);

  path += path.match(/\?/) ? "&" : "?";

  var resizable = "Yes";

  if (! width) width = "";
  if (! height) height = "";

  if (window.showModalDialog) {
    return window.showModalDialog(path + "nocache=" + millis, arguments,
      "dialogHeight: " + height + "px; dialogWidth: " + width + 
      "px; dialogTop: px; " +
      "dialogLeft: px; edge: Raised; center: Yes; help: No; " +
      "resizable: " + resizable + "; status: No;");
  } else {
    window.dialogArguments = arguments;
    var dialog = window.open(path + "nocache=" + millis, "dialog",
      "width=300,height=300,status=no,dialog=yes,modal=yes");
  }
}

RPCHandler.defaultHandler = function(doc) {
  var message = RPCHandler.getText(doc, "resultMessage");
  if (message) {
    alert(message);
  } 
}

RPCHandler.defaultErrorHandler = function(doc) {

  var args = new Object();

  args.details = RPCHandler.getText(doc, "resultDetail");
  if (! args.details) {
    args.details = doc.body.innerHTML;
  }
  args.message = RPCHandler.getText(doc, "resultMessage");
  
  RPCHandler.showDialog("/components/dialog/error.html", args);
}

RPCHandler.handlers = new Array();

RPCHandler.handlers["error"] = RPCHandler.defaultErrorHandler;

RPCHandler.showAlert = function(doc, type) {

  if (! type) { 
    type = "alert";
  }

  var key = RPCHandler.getText(doc, "resultDetail");

  var args = new Object();

  var headingElement = doc.getElementById(key + ".heading");
  if (! headingElement) {
    headingElement = document.getElementById(key + ".heading");
  }

  args.heading = headingElement ? headingElement.innerHTML : 
    "Missing message key " + key + ".heading";

  var messageElement = doc.getElementById(key + ".message");
  if (! messageElement) {
    messageElement = document.getElementById(key + ".message");
  }

  args.message = messageElement ? messageElement.innerHTML : 
    "Missing message key " + key + ".message";

  return showDialog("/components/dialog/" + type + ".html", args);
}

RPCHandler.showConfirm = function(doc) {

  return RPCHandler.showAlert(doc, "confirm");
}

RPCHandler.fillOptions = function(doc, elementID, selector, defaultValue, 
				  nullLabel) {
  
  var data = doc.getElementById(elementID);
  if (data == null) {
    alert("fillOptions: No data retrieved for menu " + selector.name);
    return;
  }

  selector.innerHTML = "";
  var divs = data.getElementsByTagName("DIV");
  var hasData = (divs.length == 0) ? false : true;

  if (! hasData || nullLabel) {
    var option = document.createElement("OPTION");
    option.value = "";
    option.innerHTML = (! hasData) ? "None available" : nullLabel;
    selector.appendChild(option);
  }

  selector.disabled = (! hasData);
 
  if (divs.length == 0) {
    return;  
  }

  for (var i = 0; i < divs.length; i++) {
    var div = divs[i];
    var option = document.createElement("OPTION");
    option.value = div.id;
    if (option.value == defaultValue) {
      option.selected = true;
    }
    option.innerHTML = div.innerHTML;
    selector.appendChild(option);
  }
}


RPCHandler.init = function(hostgroupID) {

  RPCHandler.setResponseHandler("permission_denied", function() {
    showDialog("/components/authenticator/permission-denied.jsp")
    });

  if (hostgroupID) {
  	RPCHandler.hostgroupID = hostgroupID;
  	RPCHandler.setResponseHandler("not_authenticated", function() {
      if (showDialog("/components/authenticator/signin.jsp?hostgroupID=" +
          hostgroupID) && RPCHandler.handlers["authenticated"]) {
        RPCHandler.handlers["authenticated"]();
      }
     });  	
  }

  if (! document.getElementById("rpc")) {
    document.write("<iframe id='rpc' name='rpc' " +
		 "src='/system/blank.html' onload='RPCHandler.notify()' " +
		 "style='border:0 none;width:1px;height:1px;display:none;'></iframe>");
  }
}

/**
 $Source$
 $Author$
 $Revision$
 $Date$
*/

YAHOO.namespace("convio.widget");

/**
 * Widget for selecting the time of day.
 *
 * @param id The ID of the textfield element
 * @param o  (optional) config
 *        o.model (optional) true to make the chooser a modal dialog
 */
YAHOO.convio.widget.Time = function(id, o) {

  var TIME_HELP_TEXT = "Enter a time in the form HH:MM AM";

  var HOURS = [12,1,2,3,4,5,6,7,8,9,10,11];
  var MINUTES = ['00','15','30','45'];
  var AMPM = ['AM','PM'];

  var Event = YAHOO.util.Event,
      Dom = YAHOO.util.Dom;

  var dialog;
  var _isEnabled = true;

  // selected time options.
  var _meridian = null;
  var _hour = null;
  var _minutes = null;

  o = o || {};

  // Validate element.
  if (! id ) {
    alert("id is required");
    return;
  }
  var element = Dom.get(id);
  if (! element) {
    alert("id was not valid: " + id);
    return;
  }

  this.id = id.replace(/\./g, "_");
  this.name = Dom.getAttribute(element, "name") || this.id;
  this.element = element;
  this.modal = o.modal || false;

  /**
   * Validates a time string and returns its pieces as a time object.
   */
  this._parseTime = function(timeString) {
    // Clean time format before parsing.
    timeString = timeString || "";
    timeString = timeString.toUpperCase();
    timeString = timeString.replace(/^\s+/,"").replace(/\s+$/,""); // trim
    timeString = timeString.replace(/\s+/g, " ");    // eliminate extra whitespace
    timeString = timeString.replace(/(\S)(AM|PM)/gi, "$1 $2"); // make sure there's a space before AM/PM

    if (timeString == "") {
      return {
        hour: 12,
        minutes: '00',
        meridian: 'AM'
      };
    }

    var millis;
    try {
      millis = Date.parse("1/1/2001 " + timeString);
    } catch (e) {
      alert("\"" + timeString + "\" is not a valid time.  " +
            "Please enter a time in the form HH:MM AM.");
      this.textfield.value = '';
      this.textfield.focus();
      return;
    }

    if (isNaN(millis)) {
      alert("\"" + timeString + "\" is not a valid time.  " +
            "Please enter a time in the form HH:MM AM.");
      this.textfield.value = '';
      this.textfield.focus();
      return;
    }

    var date = new Date(millis);
    var hour = date.getHours();
    var meridian;
    if (hour < 12) {
      meridian = "AM";
    } else {
      meridian = "PM";
      hour = hour - 12;
    }
    if (hour == 0) { hour = 12; }
    var minutes = date.getMinutes();
    if (minutes < 10) { 
      minutes = "0" + minutes; 
    }

    return {
      hour: hour,
      minutes: minutes,
      meridian: meridian
    };
  };

  /**
   * Updates the chooser with the value from the textfield.
   */
  this.updateChooserValue = function() {
    if (! this.textfield.value || this.textfield.value == "") {
      this.setMeridian(); // Default to "12:00 AM"
      return;
    }

    var timeObj = this._parseTime(this.textfield.value);
    if (! timeObj) {
      return;
    }

    // Update text field if parsed time is formatted differently.
    // Do this before rounding.
    var newTimeString = timeObj.hour + ":" + timeObj.minutes + " " + timeObj.meridian;
    if (this.textfield.value !== newTimeString) {
      this.textfield.value = newTimeString;
    }

    var minutes = timeObj.minutes;
    var minutesEl = Dom.get("minutes" + minutes + this.id);
    if (! minutesEl) {
      // The time may be in between. Round to the nearest 15-min interval.
      if (minutes % 15 !== 0) {
        minutes = Math.round(minutes / 15) * 15;
      }
      minutesEl = Dom.get("minutes" + minutes + this.id);
    }

    this.setMinutes(minutesEl);
    this.setHour(Dom.get("hour" + timeObj.hour + this.id));
    this.setMeridian(Dom.get("meridian" + timeObj.meridian + this.id));
  };

  /**
   * Updates the textfield with the value from the chooser.
   */
  this.updateInputValue = function() {

    // Ensure that a full time is selected.
    if (! _meridian) {
      this.setMeridian();
    }
    if (! _hour) {
      this.setHour();
    }
    if (! _minutes) {
      this.setMinutes();
    }

    var timeString = _hour.innerHTML + ":" + _minutes.innerHTML + " " + _meridian.innerHTML;
    this.textfield.value = timeString;

    dialog.hide();
  };

  /**
   * Event handler for chooser changes.
   */
  this.onChange = function(e) {
    if (! _isEnabled) {
      e.returnValue = false;
      return false;
    }

    var el = Event.getTarget(e);

    if (Dom.hasClass(el, "meridian")) {
      this.setMeridian(el);
    } else if (Dom.hasClass(el, "hour")) {
      this.setHour(el);
    } else if (Dom.hasClass(el, "minutes")) {
      this.setMinutes(el);
    }
  };

  /**
   * Sets the selected meridian.
   */
  this.setMeridian = function(el) {
    el = el || Dom.getFirstChild(Dom.get("meridianContainer" + this.id));

    if (_meridian != el) {
      // A new meridian was chosen. Update selection.

      if (_meridian) {
        Dom.addClass(_meridian, 'timeChoice');
        Dom.removeClass(_meridian, 'timeChoiceSelected');
      }

      _meridian = el;
      Dom.addClass(_meridian, 'timeChoiceSelected');
      Dom.removeClass(_meridian, 'timeChoice');

      // Indent sub-options.
      var hoursContainer = Dom.get("hoursContainer" + this.id);
      var offset = Dom.getAttribute(_meridian, "index") || 0;
      var indent = (el.offsetWidth + 1) * offset; // +1 for margin
      Dom.setStyle(hoursContainer, 'margin-left', indent + 'px');

      if (! _hour) {
        this.setHour();
      }
    }
  };

  /**
   * Sets the selected hour.
   */
  this.setHour = function(el) {
    el = el || Dom.getFirstChild(Dom.get("hoursContainer" + this.id));

    if (_hour != el) {
      // A new hour was chosen. Update selection.

      if (_hour) {
        Dom.addClass(_hour, 'timeChoice');
        Dom.removeClass(_hour, 'timeChoiceSelected');
      }

      _hour = el;
      Dom.addClass(_hour, 'timeChoiceSelected');
      Dom.removeClass(_hour, 'timeChoice');

      // Indent sub-options.
      var minutesContainer = Dom.get("minutesContainer" + this.id);
      var offset = Dom.getAttribute(_hour, "index") || 0;
      var indent = (el.offsetWidth + 1) * offset; // +1 for margin
     
      Dom.setStyle(minutesContainer, 'margin-left', indent + 'px');
      

      if (! _minutes) {
        this.setMinutes();
      }
    }
  };

  /**
   * Sets the selected minutes.
   */
  this.setMinutes = function(el) {
    el = el || Dom.getFirstChild(Dom.get("minutesContainer" + this.id));

    if (_minutes != el) {
      // A new minutes was chosen. Update selection.

      if (_minutes) {
        Dom.addClass(_minutes, 'timeChoice');
        Dom.removeClass(_minutes, 'timeChoiceSelected');
      }

      _minutes = el;
      Dom.addClass(_minutes, 'timeChoiceSelected');
      Dom.removeClass(_minutes, 'timeChoice');
    }
  };

  this._makeTimeInput = function() {
    var defaultValue = this.element.innerHTML;
    this.element.innerHTML = "";

    var span = document.createElement("SPAN");
    span.innerHTML = Dom.getAttribute(this.element, "title") || "";
    this.element.appendChild(span);
          
    var textfield = document.createElement("input");
    textfield.id = this.id + "_input";
    Dom.setAttribute(textfield, "type", "text");
    Dom.addClass(textfield, "timeChooserInput");
    Dom.setAttribute(textfield, "name", this.name);
    Dom.setAttribute(textfield, "maxlength", "10");
    Dom.setAttribute(textfield, "title", TIME_HELP_TEXT);
    if (defaultValue) {
      textfield.value = defaultValue.replace(/\s/g, "");
    }
    this.element.appendChild(textfield);
    this.textfield = textfield;
  };

  this._makeDialog = function() {
    var th = this;

    // Hide dialog if we click anywhere in the document other than the dialog.
    Event.on(document, "click", function(e) {
      var el = Event.getTarget(e);
      if (el != th.element && ! Dom.isAncestor(th.element, el)
          && el != dialog.element && ! Dom.isAncestor(dialog.element, el)) {
        dialog.hide();
      }
    });

    var dialogID = "_" + th.id + "_container";
    var dialogConfig = {
      visible: false,
      // topleft, bottomright
      context: [this.id, "tl", "br"],
      draggable: false,
      constraintoviewport: true,
      close: true
    };
    if (th.modal) {
      dialogConfig.model = true;
    }

    dialog = new YAHOO.widget.Dialog(dialogID, dialogConfig);
    dialog.setHeader('Pick A Time');
    dialog.setBody("");
    this._makeTimeChooser();

    dialog.render(document.body);

    dialog.showEvent.subscribe(function() {
      if (YAHOO.env.ua.ie) {
        // Since we're hiding the table using yui-overlay-hidden, we 
        // want to let the dialog know that the content size has changed, when
        // shown
        dialog.fireEvent("changeContent");
      }
    });
  };

  /**
   * Creates the time chooser controls.
   */
  this._makeTimeChooser = function() {
    var bd = dialog.body;

    var timeChooser = document.createElement('div');
    timeChooser.id = 'timeChooserContainer' + this.id;
    Dom.addClass(timeChooser, 'timeChooserContainer');
    bd.appendChild(timeChooser);

    var meridianContainer = document.createElement('div');
    meridianContainer.id = "meridianContainer" + this.id;
    Dom.addClass(meridianContainer, 'meridianContainer');
    for (var i=0; i<AMPM.length; i++) {
      var div = document.createElement('div');
      div.id = 'meridian' + AMPM[i] + this.id;
      Dom.setAttribute(div, "index", i);
      div.innerHTML = AMPM[i];
      Dom.addClass(div, 'timeChoice');
      Dom.addClass(div, 'meridian');

      // In IE7, inline-block doesn't quite work as expected, so
      // we use a combination of CSS and DOM/style to align the time options.
      if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 8) {
        Dom.setStyle(div, "display", "inline");
      }
      meridianContainer.appendChild(div);

      Event.on(div.id, "mouseover", this.onChange, this, this);
      Event.on(div.id, "click", this.updateInputValue, this, this);
    }
    timeChooser.appendChild(meridianContainer);

    var hoursContainer = document.createElement('div');
    hoursContainer.id = 'hoursContainer' + this.id;
    Dom.addClass(hoursContainer, 'hoursContainer');
    for (var i=0; i<HOURS.length; i++) {
      var div = document.createElement('div');
      div.id = 'hour' + HOURS[i] + this.id;
      Dom.setAttribute(div, "index", i);
      div.innerHTML = HOURS[i];
      Dom.addClass(div, 'timeChoice');
      Dom.addClass(div, 'hour');

      // In IE7, inline-block doesn't quite work as expected, so
      // we use a combination of CSS and DOM/style to align the time options.
      if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 8) {
        Dom.setStyle(div, "display", "inline");
      }
      hoursContainer.appendChild(div);      

      Event.on(div.id, "mouseover", this.onChange, this, this);
      Event.on(div.id, "click", this.updateInputValue, this, this);
    }
    meridianContainer.appendChild(hoursContainer);

    var minutesContainer = document.createElement('div');
    minutesContainer.id = 'minutesContainer' + this.id;
    Dom.addClass(minutesContainer, 'minutesContainer');
    for (var i=0; i<MINUTES.length; i++) {
      var div = document.createElement('div');
      div.id = 'minutes' + MINUTES[i] + this.id;
      Dom.setAttribute(div, "index", i);
      div.innerHTML = MINUTES[i];
      Dom.addClass(div, 'timeChoice');
      Dom.addClass(div, 'minutes');

      // In IE7, inline-block doesn't quite work as expected, so
      // we use a combination of CSS and DOM/style to align the time options.
      if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 8) {
        Dom.setStyle(div, "display", "inline");
      }
      minutesContainer.appendChild(div);      

      Event.on(div.id, "mouseover", this.onChange, this, this);
      Event.on(div.id, "click", this.updateInputValue, this, this);
    }
    hoursContainer.appendChild(minutesContainer);
  };

  this._makeTimeInput();

  // Normalize the input.
  if (this.textfield.value) {
    this.setValue(this.textfield.value);
  }

  var th = this;
  Event.on(this.textfield, "click", function() {
    // Lazy Dialog Creation - Wait to create the Dialog, and setup document click listeners, 
    // until the first time the button is clicked.
    if (! dialog) {
      th._makeDialog();
    }

    // Initialize value.
    th.updateChooserValue();

    dialog.show();
  });

};

/**
 * Enables/disables the time chooser.
 *
 * @param isEnabled true to enable the chooser, otherwise false
 */
YAHOO.convio.widget.Time.prototype.setEnabled = function(isEnabled) {
  _isEnabled = isEnabled;
  this.textfield.disabled = (! isEnabled);
};

/**
 * Gets the value of the time chooser.
 *
 * @return the time in the format HH:MM AM
 */
YAHOO.convio.widget.Time.prototype.getValue = function() {
  return this.textfield.value;
};

/**
 * Sets the value of the time chooser.
 *
 * @param timeString the time in the format HH:MM AM
 */
YAHOO.convio.widget.Time.prototype.setValue = function(timeString) {
  var timeObj = this._parseTime(timeString);
  if (! timeObj) {
    return;
  }
  this.textfield.value = timeObj.hour + ":" + timeObj.minutes + " " + timeObj.meridian;
};

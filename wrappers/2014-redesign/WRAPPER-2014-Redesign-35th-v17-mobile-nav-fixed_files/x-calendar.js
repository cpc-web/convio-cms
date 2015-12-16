/**
   $Source$
   $Author$
   $Revision$
   $Date$
**/

YAHOO.namespace("convio.widget");

/**
 * Creates a calendar widget.
 * 
 * @param id The ID of the widget
 * @param o  (optional) config
 *        o.modal  If true, makes the calendar dialog modal
 */
YAHOO.convio.widget.Calendar = function(id, o) {

  var DATE_PATTERN = /\d{1,2}\/\d{1,2}\/(\d\d\d\d|\d\d)/;
  var CALENDAR_HELP_TEXT = "Enter a date in the form MM/DD/YYYY";

  var Event = YAHOO.util.Event,
      Dom = YAHOO.util.Dom;

  var dialog;
  var _isEnabled = true;

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

  this.id = element.id.replace(/\./g, "_");
  this.name = Dom.getAttribute(element, "name") || this.id;
  this.element = element;
  this.modal = o.modal || false;


  /**
   * Validates a date string and returns a date object.
   */
  this._parseDate = function(dateString) {
    // Clean time format before parsing.
    dateString = dateString || "";
    dateString = dateString.replace(/\s/g,"");    // eliminate all whitespace

    if (dateString == "") {
      return new Date();
    }

    if (! DATE_PATTERN.exec(dateString)) {
      alert("Could not parse date \"" + dateString + ".\"  " +
            "Please enter a date in the form MM/DD/YYYY.");
      this.textfield.value = '';
      this.textfield.focus();
      return;
    }

    var millis;
    try {
      millis = Date.parse(dateString);
    } catch (e) {
      alert("Could not parse date \"" + dateString + ".\"  " +
            "Please enter a date in the form MM/DD/YYYY.");
      this.textfield.value = '';
      this.textfield.focus();
      return;
    }

    if (isNaN(millis)) {
      alert("Could not parse date \"" + dateString + ".\"  " +
            "Please enter a date in the form MM/DD/YYYY.");
      this.textfield.value = '';
      this.textfield.focus();
      return;
    }

    return new Date(millis);
  };

  /**
   * Updates the calendar with the value from the textfield.
   */
  this.updateCalendarValue = function() {
    if (! this.textfield.value || this.textfield.value == "") {
      this.calendar.clear();
      this.calendar.render();
      return;
    }

    var date = this._parseDate(this.textfield.value);

    if (! date) {
      return;
    }

    this.calendar.setMonth(date.getMonth());
    this.calendar.setYear(date.getFullYear());
    this.calendar.select(date);
    this.calendar.render();
  };

  /**
   * Updates the textfield with the value from the calendar.
   */
  this.updateInputValue = function() {
    if (this.calendar.getSelectedDates().length > 0) {

      var selDate = this.calendar.getSelectedDates()[0];
      var dStr = selDate.getDate();
      var mStr = selDate.getMonth() + 1;
      var yStr = selDate.getFullYear();

      this.textfield.value =  mStr + "/" + dStr + "/" + yStr;
    } else {
      this.textfield.value = "";
    }
  };


  this._makeCalendarInput = function() {
    var defaultValue = this.element.innerHTML;
    this.element.innerHTML = "";

    var span = document.createElement("SPAN");
    span.innerHTML = Dom.getAttribute(this.element, "title") || "";
    this.element.appendChild(span);
          
    var textfield = document.createElement("input");
    textfield.id = this.id + "_input";
    Dom.setAttribute(textfield, "name", this.name);
    Dom.setAttribute(textfield, "type", "text");
    Dom.setAttribute(textfield, "size", "10");
    Dom.setAttribute(textfield, "title", CALENDAR_HELP_TEXT);
    Dom.setAttribute(textfield, "style", 'width:8em;vertical-align:middle');
    if (defaultValue) {
      textfield.value = defaultValue.replace(/\s/g, "");
    }
    this.element.appendChild(textfield);
    this.textfield = textfield;

    var calendarButton = document.createElement("img");
    calendarButton.id = "calendarButton_" + this.id;
    Dom.setAttribute(calendarButton, "src", "/system/components/date-chooser/calicon.png");
    Dom.setAttribute(calendarButton, "class", "calendarButton");  
    Dom.setAttribute(calendarButton, "align", "absmiddle");  

    this.element.appendChild(calendarButton);
    this.calendarButton = calendarButton;
  };

  this._makeDialog = function() {
    var th = this;

    // Hide Calendar if we click anywhere in the document other than the calendar
    // or the calendar button.
    Event.on(document, "click", function(e) {
        var el = Event.getTarget(e);
        var dialogEl = dialog.element;
        if (el != dialogEl && !Dom.isAncestor(dialogEl, el) 
            && el != th.calendarButton && !Dom.isAncestor(th.calendarButton, el)) {
          dialog.hide();
        }
      });

    var config = {
      width: '200px',
      visible: false,
      // topleft, bottomleft
      context: [this.calendarButton.id, "tl", "bl"],
      draggable: false,
      constraintoviewport: true,
      close: true
    };
    if (this.modal === true) {
      config.modal = true;
    }


    dialog = new YAHOO.widget.Dialog("container_" + this.id, config);
    Dom.addClass(dialog.element, 'calendarDialog');
    dialog.setHeader('Pick A Date');
    dialog.setBody('<div id="cal_' + this.id + '" class="calendarContainer"></div>');

    var context = document.body;
    var d = YAHOO.convio.dialog._getDialog();
    if (d) {
      context = d.element;
    }
    dialog.render(context);

    dialog.showEvent.subscribe(function() {
        if (YAHOO.env.ua.ie) {
          // Since we're hiding the table using yui-overlay-hidden, we 
          // want to let the dialog know that the content size has changed, when
          // shown
          dialog.fireEvent("changeContent");
        }
      });
  };

  this._makeCalendar = function() {
    this.calendar = new YAHOO.widget.Calendar("cal_" + this.id, {
        iframe:false,          // Turn iframe off, since container has iframe support.
        hide_blank_weeks:true  // Enable, to demonstrate how we handle changing height, using changeContent
      });
    this.calendar.render();

    // Updates the textfield with the value from the calendar.
    var th = this;
    this.calendar.selectEvent.subscribe(function() {
        th.updateInputValue();
        dialog.hide();
      });

    this.calendar.renderEvent.subscribe(function() {
        // Tell Dialog it's contents have changed, which allows 
        // container to redraw the underlay (for IE6/Safari2)
        dialog.fireEvent("changeContent");
      });
  };

  this._makeCalendarInput();

  var th = this;
  Event.on(this.calendarButton, "click", function() {
      if (_isEnabled) {
        // Lazy Dialog and Calendar Creation.
        if (! dialog) {
          th._makeDialog();
          th._makeCalendar();
        }

        // Initialize value.
        th.updateCalendarValue();

        dialog.show();
      }
    });
};


/**
 * Enables/disables the Calendar.
 *
 * @param isEnabled true to enable the chooser, otherwise false
 */
YAHOO.convio.widget.Calendar.prototype.setEnabled = function(isEnabled) {
  _isEnabled = isEnabled;
  this.textfield.disabled = (! isEnabled);
};

/**
 * Gets the value of the Calendar.
 *
 * @return the date in the format MM/DD/YYYY
 */
YAHOO.convio.widget.Calendar.prototype.getValue = function() {
  return this.textfield.value;
};

/**
 * Sets the value of the Calendar.
 *
 * @param dateString the date in the format MM/DD/YYYY
 */
YAHOO.convio.widget.Calendar.prototype.setValue = function(dateString) {
  if (! dateString || dateString == "") { 
    if (this.textfield) {
      this.textfield.value = "";
    }
    // Reset calendar to the current date.
    if (this.calendar) {
      this.calendar.clear();
      this.calendar.render();
    }

    return; 
  }

  var date = this._parseDate(dateString);
  if (! date) {
    event.returnValue = false;
    return;
  }

  this.textfield.value = dateString;

  // Update the calendar selected date.
  if (this.calendar) {
    this.calendar.setMonth(date.getMonth());
    this.calendar.setYear(date.getFullYear());
    this.calendar.select(date);
    this.calendar.render();
  }
};

/**
 * $Source$
 * $Author$
 * $Revision$
 * $Date$
 *
 * Five-star rating widget.
 **/

YAHOO.namespace("convio.rating");

YAHOO.convio.rating.StarRating = function(o) {

  this.config = _initConfig(o);
  this.id = this.config.id;
  this.defaultValue = this.config.defaultValue;

  var _submitted = false;

  /**
   * Sanity check required configuration. Also sets default config values.
   */
  function _initConfig(cfg) {
    cfg = cfg || {};

    if (! cfg.id) {
      alert("id is required");
      return;
    }

    cfg.defaultValue = cfg.defaultValue || [0,0];

    return cfg;
  };

  /**
   * Replaces the rating select widget with the star images.
   */
  this.make_stardiv = function() {

    var container = YAHOO.util.Dom.get(this.id + "Container");
    if (! container) {
      alert("Invalid container ID: " + this.id + "Container");
      return;
    }

    // Hide the selector.
    YAHOO.util.Dom.setStyle(this.id + "Selector", 'display', 'none');

    // Create the stars.
    var starDiv = document.createElement('div');
    YAHOO.util.Dom.addClass(starDiv, 'rating');
    for (var i=1; i<=5; i++) {
      // first, make a div and then an a-element in it
      var star = document.createElement('div');
      star.id = this.id + 'Star' + i;
      var a = document.createElement('a');
      a.href = '#' + i;
      a.innerHTML = i;
      YAHOO.util.Dom.addClass(star, 'star');
      star.appendChild(a);
      starDiv.appendChild(star);

      // add needed listeners to every star
      YAHOO.util.Event.addListener(star, 'mouseover', this.hover_star, i, this);
      YAHOO.util.Event.addListener(star, 'mouseout', this.reset_stars, null, this);
      YAHOO.util.Event.addListener(star, 'click', this.setValue, i, this);
    }        
    container.appendChild(starDiv);

    // show the average
    this.reset_stars();
  };
    
  /**
   * hovers the selected star plus every star before it
   */
  this.hover_star = function(e, which_star) {
    for (var i=1; i<=which_star; i++) {
      var star = YAHOO.util.Dom.get(this.id + 'Star' + i);
      var a = star.firstChild;
      YAHOO.util.Dom.addClass(star, 'hover');
      YAHOO.util.Dom.setStyle(a, 'width', '100%');
    }
  };

  /**
   * Resets the status of each star.
   */
  this.reset_stars = function() {
    // if form is not submitted, the number of stars on depends on the 
    // given average value
    if (_submitted == false) {
      this.defaultValue = this.defaultValue || [0,0];

      var stars_on = this.defaultValue[0];

      if (this.defaultValue[1] >= 0) {
        stars_on = parseInt(this.defaultValue[0]) + 1;
      }

      var last_star_width = this.defaultValue[1] + '0%';
    } else {
      // if the form is submitted, then submitted number stays on
      var stars_on = _submitted;
      var last_star_width = '100%';
    }

    // cycle trought 1..5 stars
    for (var i=1; i<=5; i++) {
      var star = YAHOO.util.Dom.get(this.id + 'Star' + i);
      var a = star.firstChild;
          
      // first, reset all stars
      YAHOO.util.Dom.removeClass(star, 'hover');
      YAHOO.util.Dom.removeClass(star, 'on');

      // for every star that should be on, turn them on
      if (i<=stars_on && !YAHOO.util.Dom.hasClass(star, 'on')) {
        YAHOO.util.Dom.addClass(star, 'on');
      }

      // and for the last one, set width if needed
      if (i == stars_on) {
        YAHOO.util.Dom.setStyle(a, 'width', last_star_width);
      }
    }
  };
    
  this.setValue = function(e, num) {
    _submitted = num;

    // Update the selected # of stars.
    this.defaultValue = [num, 0];

    // change the rating-value
    var selector = YAHOO.util.Dom.get(this.id + "Selector");
    selector.value = num;
  };

  this.make_stardiv();
};

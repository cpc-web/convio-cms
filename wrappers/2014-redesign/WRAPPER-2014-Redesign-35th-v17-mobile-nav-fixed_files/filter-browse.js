/**
 * @author Mami Nomura (mnomura@convio.com)
 * @version $Id$
 *
 * Filter browse dialog
 * This script is used by integration/web/admin/components/filter/x-filter-browse.jsp
 */

YAHOO.namespace("convio");
YAHOO.convio.FilterBrowse = {
		
  _isLoading : false,
  _isAdmin : false,
  _filterID : null,
  _folderID : null,
    
  gSelectedFilter : null,  
  
  
  /**
   * initialize Filter Browse object
   * object must contain folderID,filterID,isAdmin,subsiteID,typeID,queryName
   */
  init : function(o) {
	YAHOO.convio.FilterBrowse._folderID = o.folderID;
	YAHOO.convio.FilterBrowse._filterID = o.filterID;
	YAHOO.convio.FilterBrowse._isAdmin = o.isAdmin;
	
    if (! this._isLoading) {
    	this._isLoading = true;
    	YAHOO.convio.FilterBrowse._load();
    }
    this.doFilterLoad(o.subsiteID, o.typeID, o.queryName);    
    YAHOO.util.Event.on("editButton", "click", this.editFilter);
    YAHOO.util.Event.on("deleteButton", "click", this.deleteFilter);
    YAHOO.util.Event.on("newFilterButton", "click", this.doNewFilter);
  },
  setIsLoading : function (isLoading) {
	this._isLoading = isLoading;  
  },

  
  _load : function() {
	    var loader = new YAHOO.util.YUILoader({ 
	        base: "/system/components/yui/", 
	        require : ["filter-browse-css", "form", "x-browser"],
	        loadOptional : true, 
	        combine : false,
	        timeout : 10000,
	        onSuccess : function() {	            
	            YAHOO.convio.FilterBrowse._isLoading = false;
	          },
	        onFailure : function(msg, xhrobj) {
	            YAHOO.convio.FilterBrowse._isLoading = false;
	          }
	      });
	    loader.addModule({
	        name : "x-browser",
	          type : "js",
	          fullpath : "/components/x-browser.js",
	          requires : []
	          });
	    loader.addModule({
	        name : "filter-browse-css",
	          type : "css",
	          fullpath : "/admin/components/filter/filter-browse.css",
	          requires : []
	          });
	    loader.addModule({
	        name : "form",
	          type : "js",
	          fullpath : "/components/form/form.js",
	          requires : []
	          });
	    loader.insert();
  },

  doFilterLoad : function(subsiteID, typeID, queryName) {
		var b = YAHOO.convio.FilterBrowse;
	    url = "/admin/components/filter/x-filter-list-retrieve.jsp?subsiteID=" + subsiteID + "&queryName=" + queryName;
	    if (typeID != null) {
	    	url += "&typeID=" + typeID;
	    }
	    cb = {
	    	    success : function(o) {
	    	      var response = YAHOO.lang.JSON.parse(o.responseText);
	    	      b.doCreateFilterList(response);
	    	    },
	    	    failure : function(o) {    	      
	    	      // do nothing
	    	    },
	    	    cache : false
	    	  };
	    
	    YAHOO.util.Connect.asyncRequest('GET', url, cb);
	    
  },
  doLoad : function() {
	var b = YAHOO.convio.FilterBrowse;
    if (! b._filterID) { return; }

    var colDiv = document.getElementById(b._filterID);
    if (colDiv) {    	
		  b.selectFilter(colDiv);
    }
    b._filterID = null;
  },

  doSelectFilter : function (event) {
	  var b = YAHOO.convio.FilterBrowse;
	  colDiv = YAHOO.util.Event.getTarget(event);
	  b.selectFilter(colDiv);
  },
  selectFilter: function (colDiv) {	
	var b = YAHOO.convio.FilterBrowse;
    if (b.gSelectedFilter) {
      b.gSelectedFilter.className = "unselected";
      document.getElementById("properties").innerHTML = "";      
    }
    
    b.gSelectedFilter = colDiv;
    colDiv.className = "selected";

    var now = new Date();
    var millis = Date.parse(now);
    var filterID = colDiv.id;

    var url = "/admin/components/filter/x-filter-retrieve.jsp?filterID=" + filterID + "&nocache=" + millis; 
    var cb = {
    	    success : function(o) {
    	      var response = YAHOO.lang.JSON.parse(o.responseText);
    	      b.doRetrieveNotify(response);
    	    },
    	    failure : function(o) {    	      
    	      // do nothing
    	    },
    	    cache : false
    	  };
    
    YAHOO.util.Connect.asyncRequest('GET', url, cb);
    
  },

  doNewFilter : function() {
	  var b = YAHOO.convio.FilterBrowse;
	 var url = "/admin/components/filter/x-filter-dialog.jsp?folderID=" + b._folderID;
	    var listeners = {    
	      process: function(o) {
	        var fdata = YAHOO.convio.dialog.getFormData();        
	        if (fdata.filterID) {             	    		
	    		   var filters = document.getElementById("filters");
	    		    var filter = document.createElement("DIV");
	    		    filter.id = fdata.filterID;
	    		    filter.setAttribute('typeID', fdata.typeID ? fdata.typeID : "null");
	    		    CmsXBrowser.setInnerText(filter, fdata.label);
	    		    //filter.onclick = new Function("selectFilter(this)");
	    		    YAHOO.util.Event.on(filter, "click", b.doSelectFilter);
	    		    filters.appendChild(filter);
	    		    b.selectFilter(filter);  	          
	        }        
	      },
	       authenticate: true
	    };
	  YAHOO.convio.dialog.open(url,listeners);
 
  },

  editFilter : function() {
	  
	     var b = YAHOO.convio.FilterBrowse;
	     
		 var url = "/admin/components/filter/x-filter-dialog.jsp?folderID=" + b._folderID + "&filterID="+ b.gSelectedFilter.id;
		    var listeners = {    
		      process: function(o) {
		        var fdata = YAHOO.convio.dialog.getFormData();        
		        if (fdata.filterID) {
		        	filter = document.getElementById(fdata.filterID);
		            filter.setAttribute('typeID', fdata.typeID ? fdata.typeID : "null");
		            CmsXBrowser.setInnerText(filter, fdata.label);
		            b.selectFilter(filter); 	          
		        }        
		      },
		       authenticate: true
		    };
		  YAHOO.convio.dialog.open(url,listeners);

  },


  doCreateFilterList : function( response ) {
	var b = YAHOO.convio.FilterBrowse;
	 var filters = document.getElementById("filters");
	 for (var i = 0 ; i < response.filters.length ; i ++) {
		 var f = response.filters[i];	 
		 var filter = document.createElement("DIV");
		 filter.id = f.id;
		 filter.setAttribute('typeID', f.typeID ? f.typeID : "null");
		 CmsXBrowser.setInnerText(filter, f.label);
		 YAHOO.util.Event.on(filter, "click", b.doSelectFilter);
		 filters.appendChild(filter);
	 }
	 b.doLoad();
  },
  doRetrieveNotify: function (response) {

    if (! response.result) {
      return;
    }
    
    var properties = document.getElementById("properties");
    var filterLabel = document.createElement("DIV");
        
    YAHOO.util.Dom.setStyle(filterLabel, 'font-weight', 'bold');     	
    YAHOO.util.Dom.setStyle(filterLabel, 'padding-bottom', '12px');     	
    filterLabel.innerHTML = response.filterLabel;
    properties.appendChild(filterLabel);
    
    var typeLabel = document.createElement("DIV");
    typeLabel.innerHTML = response.typeLabel;
    properties.appendChild(typeLabel);
    
    if (response.folders.length > 0) {
    	var folders = document.createElement("DIV");
    	folders.id = "folders";
    	d = document.createElement("DIV");
    	YAHOO.util.Dom.setStyle(d, 'margin-top', '8px');     	
    	d.innerHTML = "in the folder(s):";
    	folders.appendChild(d);
    	 for (var i = 0 ; i < response.folders.length ; i ++) {
    		 folder = response.folders[i];    		     		 
    		 f = document.createElement("DIV"); 
    		 YAHOO.util.Dom.setStyle(f, 'margin-top', '8px');     	
    		 YAHOO.util.Dom.setStyle(f, 'margin-left', '16px');     	
    		 f.innerHTML = "<img align=\"absmiddle\" src=\"/assets/icons/16x16/folder.gif\">" + folder.navigationTrail;
    		 folders.appendChild(f);
    	 }
    	properties.appendChild(folders);
    }
    for (var i = 0 ; i < response.categoryColumns.length ; i ++) {    
    	cc = response.categoryColumns[i];    		     		 
    	var categories = document.createElement("DIV");
    	categories.id = "categories";
    	c = document.createElement("DIV");    	
    	YAHOO.util.Dom.setStyle(c, 'margin-top', '8px');     	
    	c.innerHTML = "where " + cc.label + ' is:';
    	categories.appendChild(c);
    	 for (var j = 0 ; j < cc.categories.length ; j ++) {
    		 category = cc.categories[j];    		     		 
    		 cat = document.createElement("DIV");     		 
    		 YAHOO.util.Dom.setStyle(cat, 'margin-top', '8px');     	
    		 YAHOO.util.Dom.setStyle(cat, 'margin-left', '16px');     	
    		 cat.innerHTML = "<img align=\"absmiddle\" src=\"/assets/icons/16x16/folder.gif\">" + category.categoryLabel;
    		 categories.appendChild(cat);
    	 }
    	properties.appendChild(categories);
    }
    for (var i = 0 ; i < response.itemColumns.length ; i ++) { 
    	ic = response.itemColumns[i];    		     		 
    	var items = document.createElement("DIV");
    	items.id = "items";
    	it = document.createElement("DIV");
    	YAHOO.util.Dom.setStyle(it, 'margin-top', '8px');     	    	
    	it.innerHTML = "where " + ic.label + ' is:';
    	items.appendChild(it);
    	 for (var j = 0 ; j < ic.items.length ; j++) {
    		 itm = ic.items[j];    		     		 
    		 d = document.createElement("DIV");     		 
    		 YAHOO.util.Dom.setStyle(d, 'margin-top', '8px');     	    	
    		 YAHOO.util.Dom.setStyle(d, 'margin-left', '16px');     	    	

    		 d.innerHTML = "<img align=\"absmiddle\" src=\"/assets/icons/16x16/page.gif\">" + itm.itemLabel;
    		 items.appendChild(d);
    	 }
    	properties.appendChild(items);
    }
    if (response.dateType != "") {
    	var dt = document.createElement("DIV");
    
    	if (response.dateType == "FixedDateRange") {
    		if (response.startDate != "") {
    			var sd = document.createElement("DIV");
    			YAHOO.util.Dom.setStyle(sd, 'margin-top', '12px');     	    	    			
    			sd.innerHTML = "<b>" + response.dateLabel + "</b> is <b>on or after</b> " + response.startDateRange;
    			dt.appendChild(sd);
    		}
    		if (response.endDate != "") {
    			var ed = document.createElement("DIV");
    			YAHOO.util.Dom.setStyle(ed, 'margin-top', '12px');     	    	    			    			
    			ed.innerHTML = "<b>" + response.dateLabel + "</b> is <b>on or before</b> " + response.endDateRange;
    			dt.appendChild(ed);
    		}
    	}
    	if (response.dateType == "RelativeDateRange") {
    		var rd = document.createElement("DIV");    		
    		YAHOO.util.Dom.setStyle(rd, 'margin-top', '12px');     	    	    			    			
    		rd.innerHTML = "<b>" + response.dateLabel + "</b> is in the " + response.isFuture + "<b>" + response.timeFrame + "</b>";
    		dt.appendChild(rd);
    	}
    	properties.appendChild(dt);
    }
    if (this._isAdmin) { 
    document.getElementById("editButton").style.visibility = "visible";
    document.getElementById("deleteButton").style.visibility = "visible";
    }
  },

  deleteFilter : function() {
	var b = YAHOO.convio.FilterBrowse;
    if (! b.gSelectedFilter) {
    	return;
    }

    var now = new Date();
    var millis = Date.parse(now);
    var filterID = b.gSelectedFilter.id;
    
    var url = "/admin/components/filter/x-filter-delete.jsp?filterID=" + filterID + "&nocache=" + millis;
    var cb = {
    	    success : function(o) {
    	      var response = YAHOO.lang.JSON.parse(o.responseText);
    	      b.doDeleteNotify(response);
    	    },
    	    failure : function(o) {    	      
    	      // do nothing
    	    },
    	    cache : false
    	  };
    
    YAHOO.util.Connect.asyncRequest('GET', url, cb);
    

  },

  doDeleteNotify : function(response) {
	var b = YAHOO.convio.FilterBrowse;

    var filterID = response.filterID; 
    if (b.gSelectedFilter && b.gSelectedFilter.id == filterID) {
      b.gSelectedFilter = null;
      document.getElementById("properties").innerHTML = "";
      document.getElementById("deleteButton").style.visibility = "hidden";
    }

    var filterDiv = document.getElementById(filterID);
    if (filterDiv) {      
      filterDiv.parentNode.removeChild(filterDiv);      
    }



  }
}

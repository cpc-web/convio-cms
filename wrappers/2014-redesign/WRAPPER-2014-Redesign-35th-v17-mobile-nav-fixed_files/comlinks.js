/**
 * @author Michael Arick (marick@convio.com)
 * @version $Id$
 *
 * The javascript and YUI code for the Browse Tab of the Chooser dialog
 */

YAHOO.namespace("convio.itemchooser");
YAHOO.convio.itemchooser.COMLinksTab = {
  providerID : null,
  hostID : null,
  COMLinksTabProviderListID :  'ItemChooserCOMLinksTabProvidersListDiv',
  gridView : null,
  setupCOMLinkProvidersList : function() {
    var t = YAHOO.convio.itemchooser.COMLinksTab;
    var callback = {
      success: function(o) {
        //Parse the response from JSON into a javascript object
        var response = YAHOO.lang.JSON.parse(o.responseText);
        //Get the ImageTemplate pare of the response:
        
        var divInternals = "<UL id='providerList'>";
        var idArray = new Array(response.results.length);
        
        for (var i = 0 ; i < response.results.length ; i ++) {
          divInternals += "<LI id='provider-" + response.results[i].id + "'>" + response.results[i].label + "</LI>";
          idArray[i] = "provider-" + response.results[i].id;
        }
        divInternals += '</UL>';
        var divID = t.COMLinksTabProviderListID;
        //Load the list:
        var div = document.getElementById(divID);
        div.innerHTML = divInternals;
        function fnCallback(e) {
          var evt = window.event || e;
          if (!evt.target) {
            evt.target = evt.srcElement;
          }
          t.selectLinkProvider(evt.target.id);
        }         
        YAHOO.util.Event.addListener(idArray, "click", fnCallback);
        t.selectLinkProvider(idArray[0]);
      },
      failure: function(o) {
        //This should never happen, but if it does, we want to know.
        window.alert("Failed to load Other Convio Items.  Please refresh page and try again."); 
      }
    };
    var url = "/components/x-dialog/chooser/comlinks/link-providers-retrieve.jsp?hostID=" + t.hostID;
    
    var divID = t.COMLinksTabProviderListID;
    //Make it show "loading..."
    var div = document.getElementById(divID);
    div.innerHTML = "<p>&nbsp;Loading...</p>";
    YAHOO.util.Connect.asyncRequest('POST', url, callback);
  },
  
  selectLinkProviderRow : function(rowID) {
    var t = YAHOO.convio.itemchooser.COMLinksTab;
    var dom = YAHOO.util.Dom;
    var ul =  document.getElementById('providerList');
    var children = dom.getChildren(ul);
    for (var i = 0 ; i < children.length ; i ++) {
      if (dom.hasClass(children[i], "selected")) {
        dom.removeClass(children[i], "selected");
      }
    }
    var li = document.getElementById(rowID);
    YAHOO.util.Dom.addClass(li, "selected");
  
  },
  
  selectLinkProvider : function(rowID) {
   var t = YAHOO.convio.itemchooser.COMLinksTab;
   //OK, make sure the row looks selected:
   t.selectLinkProviderRow(rowID);
   //And load it into the link table:
   t.loadProviderIntoTable(t.getProviderID(rowID));
  },
  
  //We want to be able to get the provider ID from the row ID (which is provider-<ID>):
  getProviderID : function(rowID) {
    return rowID.substring("provider-".length);
  },
  
  loadProviderIntoTable : function(providerID) {
    var t = YAHOO.convio.itemchooser.COMLinksTab;
    t.providerID = providerID;
    var oState = {
      pagination: {
        recordOffset: 0,
        rowsPerPage: t.gridView.paginator.getRowsPerPage()
      }
    };
    t.gridView.sendRequest(t.gridView.generateRequest(oState));
  },
  
  setupCOMLinksTable : function() {
    var t = YAHOO.convio.itemchooser.COMLinksTab;
    
    var gridViewConfig = {
      id : "ItemChooserCOMLinksTabLinkChoicesTableDiv",
      url : "/components/x-dialog/chooser/comlinks/links-retrieve.jsp?",    
      columns : [ {key:"label", label:"Label", parser:"string", sortable:true}, 
                {key:"description", label:"Description", parser:"string", sortable:true} ],
      metaFields : ["ID", "url", "altPages"],
      selectionMode : 'single',
      initialLoad : false,
      MSG_EMPTY : ' ',  //'' was ignored, but ' ' seems to work.
      height : '400px',
      paginatorTemplate: '<div class="pageLinks">{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink}</div><div class="pageSizeChooser">Results per page: {RowsPerPageDropdown}</div>'
    };
    
    t.gridView = new YAHOO.convio.datatable.GridView(gridViewConfig);
    
    t.gridView.generateRequest = function(oState, oSelf) {
      var t = YAHOO.convio.itemchooser.COMLinksTab;
      
      //If oState is valid (passed in by YUI), use its pagination and sortedBy.  Otherwise, set them to null.
      oState = oState || {pagination : null, sortedBy : null};
      //If the pagination value isn't null, it has a recordOffset (starting at 0)
	  var startIndex = (oState.pagination) ? oState.pagination.recordOffset : 0;
	  //If the pagination value isn't null, it has a rowsPerPage
	  var results = (oState.pagination) ? oState.pagination.rowsPerPage : 20;
	  //If the sortedBy value isn't null, it has a sorting key
	  var sort = (oState.sortedBy) ? oState.sortedBy.key : "label"; 
	  //This next line is the YUI way of defining Ascending vs. Descending
	  var dir = (oState.sortedBy && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC) ? "false" : "true";
      //So create the query string.  This is appended to the table data source's URL above.
      var request = YAHOO.convio.datatable.generateRequest(oState, oSelf);
      request += "hostID=" + t.hostID + 
                   "&providerID=" + t.providerID + 
	               "&pageStart=" + (startIndex + 1) + //We start indexing at 1, not at 0
	               "&pageEnd=" + (startIndex + results) +
	               "&sortProperty=" + sort + "&sortAscending=" + dir; 
      return request;
    };
    t.gridView.render();
    t.gridView.onSelectionChange = t.linkSelected;
    
  },
  
  
  
  linkSelected : function() {
    var t = YAHOO.convio.itemchooser.COMLinksTab;
    var record = t.gridView.getSelectedRecord();
    var URL = record.getData("url");
    var label = record.getData("label");
    var altPages = record.getData("altPages");
    YAHOO.convio.itemchooser.ChooserUtil.selectCOMLink(URL, label, altPages);
  },
  
  launchOptionsDialog : function(item, callback) {
        
    var listeners = {
      argument : {
        returnValue : item,
        callbackFn : callback
      }
    };

    var configuration = {
      width: '650px'
    };

    var t = YAHOO.convio.itemchooser.COMLinksTab;
    var state = YAHOO.util.Cookie.get("showAdvancedCOMLinkOptions");
    if (state != "Never") {
      YAHOO.convio.dialog.open("/components/x-dialog/chooser/comlinks/comlink-options.jsp?hostID=" + t.hostID + "&providerID=" + t.providerID, listeners, configuration);
    } else {
      callback(item);
    }
  }
}

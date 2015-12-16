/**
 * $Source$
 * $Author$
 * $Revision$
 * $Date$
 *
 * Admin menubar.
 **/

// TODO: convert to namespace
YAHOO.namespace("convio.menubar");


var Event = YAHOO.util.Event;
var Dom = YAHOO.util.Dom;

var MenuBar = { loaded:false };

MenuBar.load = function(o) {
  var navMenu = new YAHOO.widget.MenuBar("navmenu", {
    hidedelay: 1000,
    showdelay: 150,
    lazyload: true
  });

  var response = YAHOO.lang.JSON.parse(o.responseText);
  navMenu.addItems(response.itemdata);

  navMenu.render("cmsMenubar");
  Event.on('menuLabelFolders', 'click', MenuBar.loadFoldersMenu);
  Event.on('menuLabelFolders', 'mouseover', MenuBar.loadFoldersMenu);
  
  // Show the Add to Favorites button if applicable. A page can be added as
  // a favorite if it defines the MenuBar.shortcut global object.
  if (MenuBar.shortcut) {
    MenuBar.showShortcut();
  }
  RPCHandler.setResponseHandler("shortcut", MenuBar.updateFavorites);
  RPCHandler.setResponseHandler("TooManyShortcuts", MenuBar.errorFavorites);

  MenuBar.loaded = true;
}

MenuBar.showShortcut = function() {
  Dom.setStyle("shortcutLink", "display", "");
}

/**
 * Adds the new "favorite" item to the menubar.
 * Response handler for addFavorites AJAX call.
 */
MenuBar.errorFavorites = function(doc) {
  var message = CmsXBrowser.innerText(doc.getElementById("message"));
  alert(message);
}

/**
 * Adds the new "favorite" item to the menubar.
 * Response handler for addFavorites AJAX call.
 */
MenuBar.updateFavorites = function(doc) {
  var key = doc.getElementById("key").innerHTML;
  var hostID = doc.getElementById("hostID").innerHTML;
  var url = doc.getElementById("url").innerHTML;
  var label = doc.getElementById("label").innerHTML;

  var menuShortcuts = YAHOO.widget.MenuManager.getMenu('favoritesMenu');
  var menuData = menuShortcuts.itemData;
  
  if (menuData[1].id == 'no-favorites') {
    // Remove 'No favorites' from menu
    menuData.pop();
  } else {
    for (i=0; i<menuData.length; i++) {
      if (menuData[i].url == url) {
        // Remove duplicate from menu
        menuData.splice(i, 1);
        break;
      }
    }
  }

  var newShortcut = {
    id: 'favorite-' + key,
    hostID: hostID,
    text: label,
    url: url
  };
  
  // Add new shortcut to 2nd-from-top of menu. (Top is "manage").
  menuData.splice(1,0,newShortcut);
  menuShortcuts.clearContent();
  menuShortcuts.init('menuLabelShortcuts');
  
  MenuBar.showMessage("Favorite Added", true);
}

/**
 * Displays a status message in menu toolbar. Optional fading.
 */
MenuBar.showMessage = function(msg, doFade) {
  var msgContainer = Dom.get("cmsMessageContainer");
  if (! msgContainer) {
    return;
  }

  msgContainer.innerHTML = msg;
  Dom.setStyle(msgContainer, "display", "");
  Dom.setStyle(msgContainer, "opacity", "1");

  if (doFade) {
    setTimeout("MenuBar._fadeMessage()", 2000);
  }
}

MenuBar._fadeMessage = function() {
  var fade = new YAHOO.util.Anim(
    'cmsMessageContainer',
    { opacity: { to: 0 } }
  );
  
  fade.animate();
};


MenuBar.removeFavorite = function(favId) {
  var menuShortcuts = YAHOO.widget.MenuManager.getMenu('favoritesMenu');
  var menuData = menuShortcuts.itemData;
  var favId = 'favorite-' + favId;
  
  for (i = 0; i < menuData.length; i++) {
    if (menuData[i].id == favId) {
      // Remove duplicate from menu
      menuData.splice(i, 1);
      break;
    }
  }
  
  // if there are no shortcuts, append "No favorites" to the menu
  if (menuData.length == 0) {
    menuData.push({
      id: 'no-favorites',
      text: 'No Favorites',
      classname: 'inactive'
    });
  }
  
  menuShortcuts.clearContent();
  menuShortcuts.init('menuLabelShortcuts');
}

/**
 * AJAX call to add a new "favorite" item to the DB.
 */
MenuBar.addShortcut = function() {
  var shortcut = MenuBar.shortcut;
  var url = "/admin/components/header/shortcut-add.jsp";
  url += "?key=" + encodeURIComponent(shortcut.key);
  url += "&hostID=" + encodeURIComponent(shortcut.hostID);
  url += "&url=" + encodeURIComponent(shortcut.url);
  url += "&label=" + encodeURIComponent(shortcut.label);
  url += "&type=" + encodeURIComponent(shortcut.type);
  url += "&sortOrder=0";
  RPCHandler.submit(url);
}

MenuBar.loadFoldersMenu = function() {
  if (!Dom.hasClass('menuLabelFolders', 'loaded')) {
    Event.onContentReady('foldersMenu', function() {
      MenuBar.populateFolders('menuLabelFolders');
    });
    Dom.addClass('menuLabelFolders', 'loaded');
  }
  Event.removeListener('menuLabelFolders');
}

MenuBar.populateFolders = function(folders_id) {
  var folders = YAHOO.util.Selector.query("li.yuimenuitem-hassubmenu", folders_id);
  
  Event.on(folders, 'mouseover', function() {
    if (!Dom.hasClass(this, 'loaded')) {

      var folder_id = this.id.substring(this.id.lastIndexOf('-')+1);
      var isFeatured = (this.id.indexOf('featured-') >= 0);
      var prefix = isFeatured ? 'featured-' : '';

      var url = '/admin/components/header/folder-load.jsp?folderID=' + folder_id;
      if (isFeatured) {
        url += '&prefix=' + prefix;
      }
      
      var foldersCallback = {
        cache: false,
        success: function(o) {
          var folder = YAHOO.widget.MenuManager.getMenu(prefix + 'folder-menu-' + folder_id);

          var menuItems = YAHOO.lang.JSON.parse(o.responseText).itemData;

          folder.clearContent();
          folder.addItems(menuItems);
          folder.render(prefix + 'folder-' + folder_id);
          MenuBar.populateFolders(prefix + 'folder-' + folder_id);
        }
      };
      
      var transaction = YAHOO.util.Connect.asyncRequest('GET', url, foldersCallback, null); 
      Dom.addClass(this, 'loaded');
    }
  });
}

function log(msg) {
  if (window.console) {
    console.log(msg);
  }
}


YAHOO.convio.menubar = {

  init: function(o) {
    o = o || {};

    if (! o.hostID) {
      alert("hostID is required");
      return;
    }
    MenuBar.hostID = o.hostID;

    if (! o.hostgroup) {
      alert("hostgroup info is required");
      return;
    }
    MenuBar.hostgroup = o.hostgroup;

    MenuBar.folderID = (o.folderID != null) ? o.folderID : null;
    MenuBar.typeID = (o.typeID != null) ? o.typeID : null;

    MenuBar.isFLA = o.isFLA || false;
    MenuBar.isWSA = o.isWSA || false;

    MenuBar.nWebsites = o.nWebsites || 0;
    MenuBar.category = MenuBar.category || o.category || null;
    MenuBar.products = o.products || null;

    Event.onContentReady('cmsMenubar', function() {
      var url = '/admin/components/header/menu-json.jsp';
      url += '?menuHostID=' + encodeURIComponent(MenuBar.hostID);
      if (MenuBar.folderID != null) {
        url += '&menuFolderID=' + encodeURIComponent(MenuBar.folderID);
      }
      if (MenuBar.typeID != null) {
        url += '&menuTypeID=' + encodeURIComponent(MenuBar.typeID);
      }

      var callback = {
        cache: false,
        success: MenuBar.load
      };

      YAHOO.util.Connect.asyncRequest('POST', url, callback);
    });

    this._initCreateContentButton();
    this._initAddToFavoritesButton();
    this._initWebsiteSwitcher();
    this._initProductSwitcher();
    this._initUserMenu();
    this._initHelpMenu();

    this._markMenu();
  },

  _initCreateContentButton: function() {
    // Register create-content button listener.
    if (MenuBar.isFLA) {
      Event.on('createContentButton', 'click', function(ev) {
        Event.preventDefault(ev);
        var url = "/admin/portal/create-content.jsp?hostID=" + encodeURIComponent(MenuBar.hostID);
        YAHOO.convio.dialog.open(url, {});
      });
    }
  },

  _initAddToFavoritesButton: function() {
    // Register add-to-favorites button listener.
    Event.on('shortcutLink', 'click', function(ev) {
      Event.preventDefault(ev);
      MenuBar.addShortcut();
    });
  },

  _initWebsiteSwitcher: function() {
    if (MenuBar.nWebsites <= 1) {
      return;
    }

    var oWebsiteMenu = null;
    Event.on("cmsWebsiteLink", "click", function(ev) {
      Event.preventDefault(ev);
      if (! oWebsiteMenu) {
        oWebsiteMenu = new YAHOO.widget.Menu("websiteChooserMenu", {
          context: ['cmsWebsiteLink','tr','br', ['beforeShow','windowResize'], [0,5]],
          constraintoviewport: true,
          clicktohide: true
        });
        oWebsiteMenu.render();
      }
      oWebsiteMenu.hide();
      oWebsiteMenu.show();
    });


    // Hide the website chooser menu when clicking anywhere else in the document.
    Event.on(document, "click", function(ev) {
      if (! oWebsiteMenu) {
        return;
      }

      var target = ev.target || ev.srcElement;
      if (target.nodeType == 3) { // defeat Safari bug
        target = target.parentNode;
      }

      // Don't hide the menu if clicking in the menu/link/button.
      if (target != null && target.id != "websiteChooserMenu" &&
          ! Dom.isAncestor("websiteChooserMenu", target)) {
        if (target.id != "cmsWebsiteLink" && ! Dom.isAncestor("cmsWebsiteLink", target)) {
          if (target.id != "websiteChooserButton" && ! Dom.isAncestor("websiteChooserButton", target)) {
            oWebsiteMenu.hide();
          }
        }
      }
    });

    // Register click listener for the "More Websites" link.
    Event.on("moreWebsitesLink", "click", function() {
      var panel = new YAHOO.widget.Panel("websiteChooserPanel", {
        fixedcenter: true,
        constraintoviewport: true,
        underlay: 'shadow',
        visible: true,
        draggable: false,
        modal: true,
        width: '680px'
      });
      Dom.setStyle("websiteChooserPanel", "display", "");
      panel.render();
    });
  },

  _initProductSwitcher: function() {
    var cloURL = MenuBar.hostgroup.crmURLBase + '/AdminHomePage';
    var productData = [{text:'Luminate Online', url:cloURL}];
    if (MenuBar.products != null) {
      for (var i=0; i<MenuBar.products.length; i++) {
        var p = MenuBar.products[i];
        if (p.text && p.url) {
          productData.push(p);
        }
      }
    }

    Event.onDOMReady(function() {
      var oMenuButton = new YAHOO.widget.Button("productSwitcherButton", {
        type: "menu", 
        label: "Luminate CMS",
        menu: productData,
        container: "cmsProductSwitcher"
      });
    });
  },

  _initUserMenu: function() {
    // User menu URLs.
    var gPreferencesURL = '/admin/portal/preferences.jsp?hostID=' + MenuBar.hostID;
    var gLogoutURL = '/signout.jsp?hostgroupID=' + MenuBar.hostgroup.id;

    var oUserMenu;
    Event.on("cmsUserLink", "click", function(ev) {
      Event.preventDefault(ev);
      if (! oUserMenu) {
        oUserMenu = new YAHOO.widget.Menu("userMenu", {
          classname: 'nav-context-menu',
          context: ['cmsUserLink','tr','br'],
          constraintoviewport: true,
          itemdata: [{id:'menuitem-preference', text:"Preferences", url:gPreferencesURL},
                     {id:'menuitem-logout', text:"Log Out", url:gLogoutURL}]
        });
        oUserMenu.render("cmsMasthead");
      }
      oUserMenu.show();
    });
  },

  _initHelpMenu: function() {
    // Help menu URLs.
    var gHelpURL = 'https://www.blackbaud.com/files/support/helpfiles/luminate-online/help/luminateonline.html#../Subsystems/Luminate_CMS/Content/Concepts/Admin_CMS_Luminate.html';
    var gSupportURL = 'https://www.blackbaud.com/support/support.aspx';
    var gAboutURL = MenuBar.hostgroup.crmURLBase + '/AdminHomePage?pagename=adminabout&mfc_popup=true';

    var doPopup = function(url, width, height) {
      CmsXBrowser.showDialog({url:url, width:width, height:height, scroll:true, toolbar:true});
    };

    var oHelpMenu;
    Event.on("cmsHelpLink", "click", function(ev) {
      Event.preventDefault(ev);
      if (! oHelpMenu) {
        oHelpMenu = new YAHOO.widget.Menu("helpMenu", {
          classname: 'nav-context-menu',
          context: ['cmsHelpLink','tr','br'],
          constraintoviewport: true,
          itemdata: [{id:'menuitem-help', text:"Help", url:gHelpURL, target:'help'},
                     {id:'menuitem-support', text:"Support", 
                      onclick:{fn:function() { doPopup(gSupportURL, 800, 600); }}},
                     {id:'menuitem-about', text:"About", 
                      onclick:{fn:function() { doPopup(gAboutURL, 800, 300); }}}]
        });
        oHelpMenu.render("cmsMasthead");
      }
      oHelpMenu.show();
    });
  },

  _markMenu: function() {
    if (! MenuBar.category) {
      return;
    }

    Event.onContentReady("menuLabelItems", function() {

      var id = null;
      switch (MenuBar.category) {
      case 'cms':
      case 'workspace':
        id = 'menuLabelHome';
        break;
      case 'explorer':
      case 'folders':
        id = 'menuLabelFolders';
        break;
      case 'types':
        id = 'menuLabelTypes';
        break;
      case 'reports':
      case 'tools':
        id = 'menuLabelTools';
        break;
      default:
        id = null;
      }

      if (id != null) {
        var mi = YAHOO.widget.MenuManager.getMenuItem(id);
        if (mi) {
          Dom.addClass(mi.element, "cmsmenubaritem-active");
        }
      }
    });

  }
};

function showHelp(helpURL) {
  var helpWindow = window.open(helpURL, "help");
  helpWindow.focus();
}

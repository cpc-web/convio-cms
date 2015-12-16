    function getModules(base, skin, secure) {
      return {
        'jquery': {
          fullpath: base + 'jquery/jquery-1.7.1.min.js'
        },
        'jquery-noconflict': {
          fullpath: base + 'jquery/jquery-noconflict.js',
          requires: ['jquery']
        },
        'jquery-ui-theme-base': {
          fullpath: base + 'jquery/plugins/ui/themes/base/jquery.ui.all.css',
          requires: ['jquery'],
          type: 'css'
        },
        'jquery-ui': {
          fullpath: base + 'jquery/plugins/ui/jquery-ui-1.8.17.custom.min.js',
          requires: ['jquery-ui-theme-base', 'jquery-noconflict']
        },
        'yui2-animation': {
          fullpath: base + 'yui/animation/animation-min.js',
          requires: ['yui2-yde']
        },
        'yui2-button': {
          fullpath: base + 'yui/button/button-min.js',
          requires: ['yui2-element', 'yui2-button-core-css', 'yui2-button-skin-css']
        },
        'yui2-button-core-css': {
          fullpath: base + 'yui/button/assets/button-core.css',
          type: 'css'
        },
        'yui2-button-skin-css': {
          fullpath: base + 'yui/button/assets/skins/' + skin + '/button-skin.css',
          type: 'css'
        },
        'yui2-calendar': {
          fullpath: base + 'yui/calendar/calendar-min.js',
          requires: ['yui2-yde', 'yui2-calendar-core-css', 'yui2-calendar-skin-css']
        },
        'yui2-calendar-core-css': {
          fullpath: base + 'yui/calendar/assets/calendar-core.css',
          type: 'css'
        },
        'yui2-calendar-skin-css': {
          fullpath: base + 'yui/calendar/assets/skins/' + skin + '/calendar-skin.css',
          type: 'css'
        },
        'yui2-connection': {
          fullpath: base + 'yui/connection/connection-min.js',
          requires: ['yui2-yde']
        },
        'yui2-container': {
          fullpath: base + 'yui/container/container-min.js',
          requires: ['yui2-yde', 'yui2-container-core-css', 'yui2-container-skin-css']
        },
        'yui2-container-core-css': {
          fullpath: base + 'yui/container/assets/container-core.css',
          type: 'css'
        },
        'yui2-container-skin-css': {
          fullpath: base + 'yui/container/assets/skins/' + skin + '/container-skin.css',
          type: 'css'
        },
        'yui2-cookie': {
          fullpath: base + 'yui/cookie/cookie-min.js',
          requires: ['yui2-yde']
        },
        'yui2-datasource': {
          fullpath: base + 'yui/datasource/datasource-min.js',
          requires: ['yui2-yde']
        },
        'yui2-datatable': {
          fullpath: base + 'yui/datatable/datatable-min.js',
          requires: ['yui2-element', 'yui2-datasource', 'yui2-datatable-core-css', 'yui2-datatable-skin-css']
        },
        'yui2-datatable-core-css': {
          fullpath: base + 'yui/datatable/assets/datatable-core.css',
           type: 'css'
        },
        'yui2-datatable-skin-css': {
          fullpath: base + 'yui/datatable/assets/skins/' + skin + '/datatable-skin.css',
          type: 'css'
        },
        'yui2-dragdrop': {
          fullpath: base + 'yui/dragdrop/dragdrop-min.js',
          requires: ['yui2-yde']
        },
        'yui2-element': {
          fullpath: base + 'yui/element/element-min.js',
          requires: ['yui2-yde']
        },
        'yui2-json': {
          fullpath: base + 'yui/json/json-min.js',
          requires: ['yui2-yde']
        },
        'yui2-menu': {
          fullpath: base + 'yui/menu/menu-min.js',
          requires: ['yui2-container', 'yui2-menu-core-css', 'yui2-menu-skin-css']
        },
        'yui2-menu-core-css': {
          fullpath:  base + 'yui/menu/assets/menu-core.css',
          type: 'css'
        },
        'yui2-menu-skin-css': {
          fullpath:  base + 'yui/menu/assets/skins/' + skin + '/menu-skin.css',
          type: 'css'
        },
        'yui2-paginator': {
          fullpath: base + 'yui/paginator/paginator-min.js',
          requires: ['yui2-element', 'yui2-container', 'yui2-paginator-core-css', 'yui2-paginator-skin-css']
        },
        'yui2-paginator-core-css': {
          fullpath:  base + 'yui/paginator/assets/paginator-core.css',
          type: 'css'
        },
        'yui2-paginator-skin-css': {
          fullpath:  base + 'yui/paginator/assets/skins/' + skin + '/paginator-skin.css',
          type: 'css'
        },
        'yui2-tabview': {
          fullpath: base + 'yui/tabview/tabview-min.js',
          requires: ['yui2-element', 'yui2-tabview-core-css', 'yui2-tabview-skin-css']
        },
        'yui2-tabview-core-css': {
          fullpath: base + 'yui/tabview/assets/tabview-core.css',
          type: 'css'
        },
        'yui2-tabview-skin-css': {
          fullpath: base + 'yui/tabview/assets/skins/' + skin + '/tabview-skin.css',
          type: 'css'
        },
        'yui2-yde': {
          fullpath: base + 'yui/yahoo-dom-event/yahoo-dom-event.js'
        }
      };
    }

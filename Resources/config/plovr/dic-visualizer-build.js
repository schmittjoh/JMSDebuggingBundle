{
      "id": "dic-visualizer",
      "paths": ["@JMSDebuggingBundle/Resources/js/", "%kernel.root_dir%/../src-js/"],
      "mode": "ADVANCED",
      "level": "VERBOSE",
      "inputs": "@JMSDebuggingBundle/Resources/js/dic_visualizer_init.js",
      
      "define": {
    	  "goog.DEBUG": false
      },
      
      "externs": ["//google_analytics_api.js", "//webkit_console.js"],
      
      "output-file": "@JMSDebuggingBundle/Resources/public/javascript/dic-visualizer.js",
      
      "output-wrapper": "/**\n * Portions of this code are from the Google Closure Library,\n * received from the Closure Authors under the Apache 2.0 license.\n *\n * All other code is (C) 2011 Johannes M. Schmitt <schmittjoh@gmail.com>\n * All rights reserved.\n */\n(function() {%output%})();", 	  
      
      "debug": false
}
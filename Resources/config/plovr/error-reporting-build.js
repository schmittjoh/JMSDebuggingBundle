{
      "id": "error-reporting",
      "paths": ["@JMSDebuggingBundle/Resources/public/javascript/"],
      "mode": "ADVANCED",
      "level": "VERBOSE",
      "inputs": "@JMSDebuggingBundle/Resources/public/javascript/error_reporting_init.js",
            
      "define": {
    	  "goog.DEBUG": false,
    	  "jms.app.ErrorReporting.CLIENT_VERSION": "PR1"
      },
      
      "type-prefixes-to-strip": ["goog.debug", "goog.asserts", "goog.assert"],
      "name-suffixes-to-strip": ["logger", "logger_"],
      
      "output-file": "@JMSDebuggingBundle/Resources/public/javascript/build/error-reporting.js",
      
      "output-wrapper": "/**\n * Portions of this code are from the Google Closure Library,\n * received from the Closure Authors under the Apache 2.0 license.\n *\n * All other code is (C) 2011 Johannes M. Schmitt <schmittjoh@gmail.com>\n * All rights reserved.\n */\n(function() {%output%})();", 	  
      
      "pretty-print": false,
      "debug": false
}
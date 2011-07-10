{
      "id": "error-reporting",
      "paths": ["@JMSDebuggingBundle/Resources/js/", "%kernel.root_dir%/src-js/"],
      "mode": "ADVANCED",
      "level": "VERBOSE",
      "inputs": "@JMSDebuggingBundle/Resources/js/error_reporting_init.js",
      
      "define": {
    	  "jms.app.ErrorReporting.CLIENT_VERSION": "PR2"
      },
      
      "pretty-print": true,
      "debug": true
}
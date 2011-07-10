/*
 * Copyright 2011 Johannes M. Schmitt <schmittjoh@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.require('jms.app.ErrorReporting');
goog.require('goog.dom');

/**
 * @fileoverview This is the entry point into the ErrorReporting application
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */

/**
 * @type {jms.app.ErrorReporting}
 * @private
 */
jms.app.ErrorReporting.instance_;

/**
 * @param {string} data a json-encoded object
 * @param {string} yamlData a yaml-encoded object
 * @param {boolean} autoHelp
 */
jms.app.ErrorReporting.install = function(data, yamlData, autoHelp) {
    var dom = goog.dom.getDomHelper();
    var app = new jms.app.ErrorReporting(data, yamlData, dom);
    
    var stackTrace = dom.getNextElementSibling((dom.getElementsByTagNameAndClass('div', 'block_exception'))[0]);
    app.renderBefore(stackTrace);
    jms.app.ErrorReporting.instance_ = app;
    
    if (autoHelp) {
        app.sendReport(false);
    }
};

/**
 * @param {Element} elem
 * @param {string} resourceId
 */
jms.app.ErrorReporting.resourceMouseDownCallback = function(elem, resourceId) {
    jms.app.ErrorReporting.instance_.onResourceMouseDown(elem, resourceId);
};

/**
 * @return {!jms.app.ErrorReporting}
 */
jms.app.ErrorReporting.getApp = function() {
	return jms.app.ErrorReporting.instance_;
};

// api
goog.exportSymbol('jms_install_error_reporting', jms.app.ErrorReporting.install);
goog.exportSymbol('jms_url', jms.app.ErrorReporting.resourceMouseDownCallback);
goog.exportSymbol('jms_get_app', jms.app.ErrorReporting.getApp);
goog.exportProperty(jms.app.ErrorReporting.prototype, 'getHelpContentElement', jms.app.ErrorReporting.prototype.getHelpContentElement);
goog.exportProperty(jms.app.ErrorReporting.prototype, 'getDomHelper', jms.app.ErrorReporting.prototype.getDomHelper);
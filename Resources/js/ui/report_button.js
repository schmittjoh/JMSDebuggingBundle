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

goog.provide('jms.ui.ReportButton');

goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.dom.DomHelper');
goog.require('goog.style');

/**
 * @constructor
 * @param {string} content
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Control}
 */
jms.ui.ReportButton = function(content, opt_domHelper) {
    goog.base(this, content, goog.ui.ControlRenderer.getCustomRenderer(goog.ui.ControlRenderer, jms.ui.ReportButton.CSS_CLASS), opt_domHelper);
};
goog.inherits(jms.ui.ReportButton, goog.ui.Control);

/**
 * @define {string}
 */
jms.ui.ReportButton.CSS_CLASS = 'jms-ui-report-button';


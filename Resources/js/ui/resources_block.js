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

goog.provide('jms.ui.ResourcesBlock');

goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('soy');
goog.require('jms.templates.help_resources');
goog.require('jms.ui.ResourceCounter');

/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Component}
 */
jms.ui.ResourcesBlock = function(opt_domHelper) {
    goog.base(this, opt_domHelper);

    this.zippy_ = null;
    
    var searchLink = new goog.ui.Button('search', goog.ui.Css3ButtonRenderer.getInstance(), opt_domHelper);
    searchLink.setId('search-button');
    this.addChild(searchLink, false);

    var resourceCounter = new jms.ui.ResourceCounter(opt_domHelper);
    resourceCounter.setId('counter');
    this.addChild(resourceCounter, false);

    var headerButton = new goog.ui.Control(
        'Help Resources', 
        goog.ui.ControlRenderer.getCustomRenderer(goog.ui.ControlRenderer, 'jms-ui-help-resources-header-button'), 
        opt_domHelper
    );
    headerButton.setId('button');
    this.addChild(headerButton, false);
};
goog.inherits(jms.ui.ResourcesBlock, goog.ui.Component);

/**
 * @return {goog.ui.Zippy}
 */
jms.ui.ResourcesBlock.prototype.getZippy = function() {
    return this.zippy_;
};

/**
 * @override
 */
jms.ui.ResourcesBlock.prototype.createDom = function() {
    var dom = this.getDomHelper();
    var elem = /** @type {Element} */ (soy.renderAsFragment(jms.templates.help_resources.block));
    this.setElementInternal(elem);
};

jms.ui.ResourcesBlock.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    var dom = this.getDomHelper();
    var elem = dom.getElement('jms-ui-help-resources-count');
    this.getChild('counter').render(elem);
    this.getChild('search-button').render(elem);
    
    var button = this.getChild('button');
    button.render(dom.getElement('jms-ui-help-resources-header'));
    
    this.zippy_ = new goog.ui.Zippy(button.getElement(), dom.getElement('jms-ui-help-resources'), false, undefined, dom);
};

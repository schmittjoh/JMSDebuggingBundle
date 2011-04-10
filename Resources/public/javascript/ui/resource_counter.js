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

goog.provide('jms.ui.ResourceCounter');

goog.require('goog.ui.Component');

/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Component}
 */
jms.ui.ResourceCounter = function(opt_domHelper) {
    goog.base(this, opt_domHelper);
    
    this.loading_ = false;
    
    var dom = this.getDomHelper();
    this.loadingImage_ = dom.createDom('img', {
        'src': jms.ui.ResourceCounter.LOADING_IMAGE,
        'alt': 'Loading...',
        'class': 'jms-ui-report-button-loading-image'
    });
    dom.getDocument().body.appendChild(this.loadingImage_);
    this.updateLoadingImage_();
    
    this.resourceCount_ = '???';
};
goog.inherits(jms.ui.ResourceCounter, goog.ui.Component);

/**
 * @define {string}
 */
jms.ui.ResourceCounter.LOADING_IMAGE = 'data:image/gif;base64,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';

jms.ui.ResourceCounter.prototype.setResourceCount = function(count) {
    this.resourceCount_ = count;
    
    if (this.isInDocument()) {
        this.getDomHelper().setTextContent(this.getElement(), this.getText_());
    }
};

jms.ui.ResourceCounter.prototype.createDom = function() {
    var dom = this.getDomHelper();
    var elem = dom.createDom('span', undefined, this.getText_());
    this.setElementInternal(elem);
};

/**
 * @param {boolean} bool
 */
jms.ui.ResourceCounter.prototype.setLoading = function(bool) {
    this.loading_ = bool;
    
    if (this.isInDocument()) {
        this.updateLoadingImage_();
    }
};

/**
 * @override
 */
jms.ui.ResourceCounter.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');

    this.updateLoadingImage_();
};

/**
 * @private
 */
jms.ui.ResourceCounter.prototype.updateLoadingImage_ = function() {
    if (!this.loading_) {
        goog.style.setPosition(this.loadingImage_, -1000, -1000);
    } else {
        var rect = goog.style.getBounds(this.getElement());
        goog.style.setPosition(this.loadingImage_, rect.left + rect.width + 10, rect.top);
    }
};

/**
 * @private
 * @return {string}
 */
jms.ui.ResourceCounter.prototype.getText_ = function() {
    if (goog.isNumber(this.resourceCount_)) {
        if (0 === this.resourceCount_) {
            return 'no resources found';
        }
        if (1 === this.resourceCount_) {
            return 'one resource found';
        }
        
        return this.resourceCount_ + ' resources found';
    }
    
    return this.resourceCount_ + ' resources';
};

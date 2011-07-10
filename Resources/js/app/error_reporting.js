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

goog.provide('jms.app.ErrorReporting');

goog.require('goog.date.Date');
goog.require('goog.events.EventHandler');
goog.require('goog.json');
goog.require('goog.net.CrossDomainRpc');
goog.require('goog.net.Cookies');
goog.require('goog.ui.Component');
goog.require('goog.ui.Zippy');
goog.require('goog.ui.Dialog');
goog.require('goog.uri.utils');
goog.require('jms.templates.error_dialog');
goog.require('jms.ui.ResourcesBlock');
goog.require('jms.ui.ReportButton');
goog.require('soy');

/**
 * @constructor
 * @param {string} data
 * @param {string} yamlData
 * @param {goog.dom.DomHelper} domHelper
 * @extends {goog.ui.Component}
 */
jms.app.ErrorReporting = function(data, yamlData, domHelper) {
    goog.base(this, domHelper);
    
    this.setModel(goog.json.unsafeParse(data));
    
    this.encodedData_ = data;
    this.yamlData_ = yamlData;
    this.handler_ = new goog.events.EventHandler(this);
    this.cookies_ = new goog.net.Cookies(domHelper.getDocument());
    this.reportId_ = null;
    this.zippy_ = null;
    
    this.dialog_ = new goog.ui.Dialog();
    this.dialog_.setDraggable(false);
    this.handler_.listen(this.dialog_, goog.ui.Dialog.EventType.SELECT, this.onDialogSelect);
    
    var reportButton = new jms.ui.ReportButton('Show Error Report', domHelper);
    reportButton.setId('report-button');
    this.addChild(reportButton, true);
    
    // add help resources block
    var resourcesBlock = new jms.ui.ResourcesBlock(domHelper);
    resourcesBlock.setId('resources');
    this.addChild(resourcesBlock, false);
    this.handler_.listen(resourcesBlock.getChild('search-button'), goog.ui.Component.EventType.ACTION, this.sendReport);
};
goog.inherits(jms.app.ErrorReporting, goog.ui.Component);

/**
 * @define {string}
 */
jms.app.ErrorReporting.REPORT_URL = 'http://sfdebug.jmsyst.com/api/report/submit';

/**
 * @define {string}
 */
jms.app.ErrorReporting.FEEDBACK_URL = 'http://sfdebug.jmsyst.com/api/report/feedback';

/**
 * @define {string}
 */
jms.app.ErrorReporting.REDIRECT_URL = 'http://sfdebug.jmsyst.com/api/resource/redirect';

/**
 * @define {string}
 */
jms.app.ErrorReporting.CLIENT_VERSION = '';

/**
 * @override
 */
jms.app.ErrorReporting.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    this.getElement().id = 'jms-debugging-error-reporting';
    
    var dom = this.getDomHelper();
    this.zippy_ = new goog.ui.Zippy(this.getChild('report-button').getElement(), goog.bind(function() {
        var elem = soy.renderAsFragment(jms.templates.error_dialog.index, {
            'data': this.yamlData_
        });
        
        dom.append(this.getElement(), elem);
        
        return elem;
    }, this), false, undefined, this.getDomHelper());
    
    this.getChild('resources').renderBefore(this.getDomHelper().getNextElementSibling(this.getElement()));
    
    this.handler_.listen(dom.getElement('jms-ui-help-feedback-link'), goog.events.EventType.CLICK, function(e) {
        e.preventDefault();
        this.showFeedbackDialog();
    });
};

jms.app.ErrorReporting.prototype.showFeedbackDialog = function() {
    this.dialog_.setTitle("Give us Feedback");
    this.dialog_.setContent(jms.templates.help_resources.feedback_dialog());
    
    var buttonSet = new goog.ui.Dialog.ButtonSet(this.getDomHelper());
    buttonSet.addButton({key: 'send_feedback', caption: 'Send Feedback'}, true, false);
    buttonSet.addButton({key: 'cancel', caption: 'Cancel'}, false, true);
    this.dialog_.setButtonSet(buttonSet);
    
    this.dialog_.setVisible(true);
};

jms.app.ErrorReporting.prototype.onDialogSelect = function(e) {
    if ('send_feedback' === e.key) {
        var feedbackInput = this.getDomHelper().getElement('jms-ui-help-resources-feedback');
        if ('' === feedbackInput.value) {
            goog.style.setStyle(feedbackInput, 'border', '1px #ff0000 solid');
            e.preventDefault();
            return;
        }
        
        this.sendFeedback(feedbackInput.value);
    }
};

jms.app.ErrorReporting.prototype.sendFeedback = function(text) {
    var data = {
        'text': text,
        'report_id': this.reportId_
    };
    var headers = {'client_version': jms.app.ErrorReporting.CLIENT_VERSION};
    
    goog.net.CrossDomainRpc.send(jms.app.ErrorReporting.FEEDBACK_URL, undefined, undefined, data, headers);
};

/**
 * @param {boolean=} opt_expandHelp
 */
jms.app.ErrorReporting.prototype.sendReport = function(opt_expandHelp) {
    if (null !== this.reportId_) {
        return;
    }
    
    var expandHelp = goog.isDef(opt_expandHelp) ? opt_expandHelp : true;
    
    this.getChild('resources').getChild('search-button').setEnabled(false);
    this.showLoadingIcons_();
    
    var data = {};
    data['error_data'] = this.encodedData_;
    
    var headers = {};
    headers['client_version'] = jms.app.ErrorReporting.CLIENT_VERSION;
    
    goog.net.CrossDomainRpc.send(jms.app.ErrorReporting.REPORT_URL, goog.bind(this.onSendComplete, this, expandHelp), undefined, data, headers);
};

/**
 * @param {boolean} expandHelp
 * @param {goog.events.Event} e
 */
jms.app.ErrorReporting.prototype.onSendComplete = function(expandHelp, e) {
    this.hideLoadingIcons_();
    
    if (expandHelp) {
    	this.getChild('resources').getZippy().setExpanded(true);
    }
    
    // handle errors
    if (200 !== e.target.status || false === e.target.responseTextIsJson_) {
        this.getChild('resources').getChild('search-button').setEnabled(true);
        
        var error;
        if (false === e.target.responseTextIsJson_) {
            error = e.target.responseText;
        } else {
            error = 'Sorry, an error occurred while retrieving help resources, please try again later.';
        }
        
        soy.renderElement(
            this.getDomHelper().getElement('jms-ui-help-resources'),
            jms.templates.help_resources.server_error,
            {
                error: error
            }
        );

        return;
    }
    
    // remove send button
    this.getChild('resources').getChild('search-button').dispose();
    
    // use safe parse here, just to be sure
    var data = goog.json.parse(e.target.responseText);
    this.reportId_ = data['id'];
    
    // check if this is a rich-client solution
    if ('rich_client_js' in data) {
        this.renderRichClientHelp_(data['rich_client_js']);
        return;
    }
    
    this.renderStandardHelpResources_(data);
};

/**
 * @private
 * @param {string} jsUrl
 */
jms.app.ErrorReporting.prototype.renderRichClientHelp_ = function(jsUrl) {
	var dom = this.getDomHelper();
	var script = dom.createDom('script', {
		'src': jsUrl,
		'type': 'text/javascript',
		'language': 'javascript'
	});
	dom.getDocument().body.appendChild(script);
};

/**
 * @private
 * @param {!Object} data
 */
jms.app.ErrorReporting.prototype.renderStandardHelpResources_ = function(data) {
    // convert data to local format (this is necessary because the sending, and
    // the receiving script cannot be compiled using the same mapping files when
    // compiling with plovr, we would have to use GCC directly for that)
    var convertedData = [];
    for (var i=0,c=data['resources'].length; i<c; i++) {
        convertedData[i] = {
            title: data['resources'][i]['title'],
            content: data['resources'][i]['content'],
            uri: data['resources'][i]['uri'],
            id: data['resources'][i]['id']
        };
    }

    // generate template
    this.getChild('resources').getChild('counter').setResourceCount(c);
    soy.renderElement(
        this.getHelpContentElement(),
        jms.templates.help_resources.list, 
        {
            resources: convertedData
        }
    );
};

/**
 * @return {Element}
 */
jms.app.ErrorReporting.prototype.getHelpContentElement = function() {
	return this.getDomHelper().getElement('jms-ui-help-resources');
};

/**
 * This is used to protect the value of the "referer" header, and also to
 * record click stream data which can be used in the matching algorithm.
 * 
 * @param {Element} elem
 * @param {string} resourceId
 */
jms.app.ErrorReporting.prototype.onResourceMouseDown = function(elem, resourceId) {
    var url = goog.uri.utils.appendParams(
        jms.app.ErrorReporting.REDIRECT_URL,
        'report_id', this.reportId_,
        'resource_id', resourceId,
        'client_version', jms.app.ErrorReporting.CLIENT_VERSION,
        'url', elem.href
    );
    
    elem.href = url;
};

/**
 * This function shows the loading images in the requested places
 * @private
 */
jms.app.ErrorReporting.prototype.showLoadingIcons_ = function() {
    this.getChild('resources').getChild('counter').setLoading(true);
};

/**
 * This function hides the loading images
 * @private
 */
jms.app.ErrorReporting.prototype.hideLoadingIcons_ = function() {
    this.getChild('resources').getChild('counter').setLoading(false);
};


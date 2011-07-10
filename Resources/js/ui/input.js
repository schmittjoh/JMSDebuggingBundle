goog.provide('jms.ui.Input');

goog.require('goog.ui.Component');

/**
 * @constructor
 * @param {!goog.dom.DomHelper} dom
 * @extends {goog.ui.Component}
 */
jms.ui.Input = function(dom) {
    goog.base(this);
};
goog.inherits(jms.ui.Input, goog.ui.Component);

jms.ui.Input.prototype.createDom = function() {
    var dom = this.getDomHelper().createDom('input', {'type': 'text', 'class': 'jms-dic-searchinput'});
    this.setElementInternal(dom);
};
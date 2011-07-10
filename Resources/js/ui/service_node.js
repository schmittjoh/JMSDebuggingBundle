goog.provide('jms.ui.ServiceNode');

goog.require('jms.ui.Node');

/**
 * @constructor
 * @param {string} id
 * @param {!jms.structs.Node} model
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {jms.ui.Node}
 */
jms.ui.ServiceNode = function(id, model, opt_domHelper) {
    goog.base(this, id, undefined, opt_domHelper);
    
    this.setId(id);
    this.setModel(model);
    
    /**
     * @private
     * @type {!jms.model.Service}
     */
    this.service_ = /** @type {!jms.model.Service} */ (model.getValue());
    
    if (!this.service_.isPublic()) {
    	this.addClassName('jms-ui-service-node-private');
    }
    if (this.service_.isAlias()) {
    	this.addClassName('jms-ui-service-node-alias');
    }

    /**
     * @private
     * @type {goog.math.Size}
     */
    this.size_ = null;
};
goog.inherits(jms.ui.ServiceNode, jms.ui.Node);

/**
 * @enum {string}
 */
jms.ui.ServiceNode.EventType = {
	CONFIGURE_CONTEXTMENU: "configure_contextmenu"
};

/**
 * @inheritDoc
 */
jms.ui.ServiceNode.prototype.enterDocument = function() {
	goog.base(this, 'enterDocument');

//	if (false === this.menu_.isInDocument()) {
//		this.dispatchEvent({
//			type: jms.ui.ServiceNode.EventType.CONFIGURE_CONTEXTMENU,
//			target: this,
//			menu: this.menu_
//		});
//		this.menu_.attach(this.getElement(), undefined, undefined, true);
//		this.menu_.render(this.getDomHelper().getDocument().body);
//	}
	
	var elem = this.getElement();
	goog.events.listen(elem, goog.events.EventType.DBLCLICK, goog.bind(this.onDblClick, this));
	goog.events.listen(elem, goog.events.EventType.CONTEXTMENU, goog.bind(this.onContextMenu, this));
};

jms.ui.ServiceNode.prototype.onContextMenu = function(e) {
	e.serviceNode = this;
	this.dispatchEvent(e);
};

jms.ui.ServiceNode.prototype.onDblClick = function(e) {
	this.dispatchEvent(goog.events.EventType.DBLCLICK);
};

/**
 * @return {!jms.model.Service}
 */
jms.ui.ServiceNode.prototype.getService = function() {
	return this.service_;
};


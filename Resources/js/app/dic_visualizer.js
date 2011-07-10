goog.provide('jms.app.DicVisualizer');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.structs.Map');
goog.require('goog.ui.Component');
goog.require('goog.module.ModuleManager');
goog.require('goog.events');
goog.require('goog.graphics');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.ui.AutoComplete.Basic');
goog.require('goog.History');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.MenuItem');

goog.require('jms.ui.Input');
goog.require('jms.ui.ServiceGraph');
goog.require('jms.ui.ChoiceField');
goog.require('jms.model.Service');
goog.require('jms.routing.Router');
goog.require('jms.ui.graph.CostAwareNodePlacementStrategy');
goog.require('jms.ui.graph.ForceDirectedNodePlacementStrategy');
goog.require('jms.ui.graph.ArrowEdgeDrawingStrategy');

/**
 * @param {!goog.dom.DomHelper} dom
 * @param {!goog.structs.Map.<string, jms.model.Service>} services
 * @param {!Array.<!jms.model.LogMessage>} logMessages
 * @param {number} maxLevel
 * @constructor
 * @extends {goog.ui.Component}
 */
jms.app.DicVisualizer = function(dom, services, logMessages, maxLevel) {
    goog.base(this, dom);
  
    /**
     * @private
     * @type {number}
     */
    this.maxLevel_ = maxLevel;
    
    /**
     * @private
     * @type {!goog.structs.Map.<string, jms.model.Service>}
     */
    this.services_ = services;
    
    /**
     * @private
     * @type {!Array.<!jms.model.LogMessage>}
     */
    this.logMessages_ = logMessages;
    
    /**
     * @private
     * @type {string|null}
     */
    this.currentServiceId_ = null;
    
    /**
     * @private
     * @type {goog.dom.ViewportSizeMonitor}
     */
    this.vsm_ = new goog.dom.ViewportSizeMonitor();
    goog.events.listen(this.vsm_, goog.events.EventType.RESIZE, goog.bind(this.onViewSizeChange, this));
    var viewSize = this.calculateSize_(this.vsm_.getSize());
    
    /**
     * @private
     * @type {!jms.routing.Router}
     */
    this.router_ = new jms.routing.Router();
    this.registerRoutes_();
    
    /**
     * @private
     * @type {!jms.ui.Input}
     */
    this.searchInput_ = new jms.ui.Input(dom);
    this.addChild(this.searchInput_, true);
    
    /**
     * @private
     * @type {string}
     */
    this.direction_ = jms.app.DicVisualizer.DEPENDENCY_DIRECTION.OUT;
    
    /**
     * @private
     * @type {!jms.ui.ChoiceField}
     */
    this.directionChoiceField_ = new jms.ui.ChoiceField('direction', [{id: "out", caption: "Outgoing"}, {id: "in", caption: "Incoming"}], this.direction_);
    this.directionChoiceField_.setLabel('Dependencies:');
    this.directionChoiceField_.addEventListener(goog.events.EventType.CHANGE, goog.bind(this.onDirectionChange, this));
    this.addChild(this.directionChoiceField_, true);
    
    /**
     * @private
     * @type {jms.ui.DirectedGraph}
     */
    this.serviceGraph_ = null;
    
    /**
     * @private
     * @type {!goog.ui.PopupMenu}
     */
    this.contextMenu_ = new goog.ui.PopupMenu(dom);
    this.addChild(this.contextMenu_, false);
    this.contextMenu_.render(dom.getDocument().body);
    
    /**
     * This needs to be last as it will initiate the application
     * 
     * FIXME: Consider using goog.Html5History instead
     * 
     * @private
     * @type {!goog.History}
     */
    this.history_ = new goog.History();
    this.history_.addEventListener(goog.history.EventType.NAVIGATE, goog.bind(this.onHistoryChange, this));
    this.history_.setEnabled(true);    
};
goog.inherits(jms.app.DicVisualizer, goog.ui.Component);

/**
 * @enum {string}
 */
jms.app.DicVisualizer.DEPENDENCY_DIRECTION = {
    OUT: "out",
    IN: "in"
};

/**
 * @enum {number}
 */
jms.app.DicVisualizer.ACTIONS = {
    DISPLAY_SERVICE: 1
};

/**
 * Called when the URL hash changes
 * 
 * @param {goog.events.Event} e
 */
jms.app.DicVisualizer.prototype.onHistoryChange = function(e) {
    var hash = /** @type {string} */ (e.token);
    
    // no homepage
    if (hash == '') {
        return;
    }
    
    try {
        var params = this.router_.route(hash);
        
        if (params["action"] == jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE) {
            this.direction_ = params["direction"];
            this.directionChoiceField_.setSelectedChoice(params["direction"]);
            this.displayService(params["id"]);
        }
    } catch (ex) {
        if (goog.DEBUG) {
            alert('Routing Error: ' + ex);
        }
    }
};

/**
 * @private
 */
jms.app.DicVisualizer.prototype.registerRoutes_ = function() {
    var options = {};
    options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS] = ["/"];
    
    this.router_.registerRoute(new jms.routing.Route(
           "service/:id", { "action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE, "direction": jms.app.DicVisualizer.DEPENDENCY_DIRECTION.OUT }, undefined, options
    ));
    this.router_.registerRoute(new jms.routing.Route(
        "service/:id/:direction", { "action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE }, undefined, options
    ));
};

/**
 * @inheritDoc
 */
jms.app.DicVisualizer.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    var autocomplete = new goog.ui.AutoComplete.Basic(this.services_.getKeys(), this.searchInput_.getElement(), false, true);
    autocomplete.addEventListener(goog.ui.AutoComplete.EventType.UPDATE, goog.bind(this.onSearchInputUpdate, this));
};

/**
 * Changes the history to display the new service
 * 
 * @param {string} id
 */
jms.app.DicVisualizer.prototype.changeHistory = function(id) {
    var hash = this.router_.generate({"action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE, "id": id, "direction": this.direction_});
    if (this.history_.getToken() !== hash) {
        this.history_.setToken(hash);
    }
};

/**
 * Displays the graph around a specific service
 * 
 * @param {string} id
 * @param {number=} opt_level
 */
jms.app.DicVisualizer.prototype.displayService = function(id, opt_level) {
    this.currentServiceId_ = id;
    
    // update search input
    this.searchInput_.getElement().value = id;
    
    var maxLevel = opt_level || this.maxLevel_;
    
    if (null !== this.serviceGraph_) {
        this.serviceGraph_.dispose();
        this.serviceGraph_ = null;
    }
    
    var digraph = this.generateDigraph_(id, maxLevel);
//    var nodePlacementStrategy = new jms.ui.graph.CostAwareNodePlacementStrategy(new jms.ui.graph.ForceDirectedNodePlacementStrategy());
    var nodePlacementStrategy = undefined;
    this.serviceGraph_ = new jms.ui.ServiceGraph(this.calculateSize_(this.vsm_.getSize()), digraph, nodePlacementStrategy, undefined, new jms.ui.graph.ArrowEdgeDrawingStrategy(), this.getDomHelper());
    this.serviceGraph_.addEventListener(goog.events.EventType.DBLCLICK, goog.bind(function(e) {
        var serviceNode = /** @type {!jms.ui.ServiceNode} */ (e.target);
        
        this.changeHistory(serviceNode.getService().getId());
    }, this));
    this.serviceGraph_.addEventListener(goog.events.EventType.CONTEXTMENU, goog.bind(this.showContextmenu, this));
    this.addChild(this.serviceGraph_, true);
    
    goog.dom.classes.add(this.serviceGraph_.getUiNode(id).getElement(), 'jms-ui-node-highlight');
};

/**
 * This is called to show the context menu of nodes
 * 
 * @param {goog.events.Event} e
 */
jms.app.DicVisualizer.prototype.showContextmenu = function(e) {
    var serviceNode = /** @type {!jms.ui.ServiceNode} */ (e.serviceNode);
    var dom = this.getDomHelper();
    
    e.preventDefault();
    
    this.contextMenu_.removeChildren(true);
    
    var focusService = new goog.ui.MenuItem('Focus Service', undefined, dom);
    focusService.addEventListener(goog.ui.Component.EventType.ACTION, goog.bind(function(serviceId) {
        this.changeHistory(serviceId);
    }, this, serviceNode.getService().getId()));
    this.contextMenu_.addChild(focusService, true);
    
    this.contextMenu_.showAt(e.clientX, e.clientY);
};

/**
 * Generates the directed graph which is then displayed by the UI class
 * 
 * @private
 * @param {string} id
 * @param {number} maxLevel
 * @return {!jms.structs.DirectedGraph}
 */
jms.app.DicVisualizer.prototype.generateDigraph_ = function(id, maxLevel) {
    var digraph = new jms.structs.DirectedGraph();
    var nodeCount = 0;
    
    /**
     * @param {!jms.model.Service} service
     * @param {number} curLevel
     */
    var addDeps = function(service, curLevel) {
        /**
         * @param {boolean} isWeak
         * @param {string} dId
         */
        var forEachFunc = function(isWeak, dId) {
            if (digraph.hasNode(dId)) {
                return;
            }
            
            var dService = this.getServiceData_(dId);
            digraph.addNode(new jms.structs.Node(dId, dService));
            
            if (jms.app.DicVisualizer.DEPENDENCY_DIRECTION.OUT === this.direction_) {
                digraph.connect(service.getId(), dId, isWeak);
            } else {
                digraph.connect(dId, service.getId(), isWeak);
            }
            
            if (curLevel < maxLevel) {
                addDeps.call(this, dService, curLevel+1);
            }
        };

        var dependencies, weakDependencies;
        if (jms.app.DicVisualizer.DEPENDENCY_DIRECTION.OUT === this.direction_) {
            dependencies = service.getOutDependencies();
            weakDependencies = service.getWeakOutDependencies();
        } else {
            dependencies = service.getInDependencies();
            weakDependencies = service.getWeakInDependencies();
        }
        var toBeAdded = dependencies.length + weakDependencies.length;
        
        if (1 === curLevel || (toBeAdded < 5 && nodeCount + toBeAdded < 15)) {
            nodeCount += toBeAdded;
            goog.array.forEach(dependencies, goog.bind(forEachFunc, this, false));
            goog.array.forEach(weakDependencies, goog.bind(forEachFunc, this, true));
        }
    };
    
    var service = this.getServiceData_(id);
    digraph.addNode(new jms.structs.Node(id, service));
    addDeps.call(this, service, 1);
    
    return digraph;
};

/**
 * Returns the service data object.
 * 
 * @private
 * @param {string} id
 * @return {!jms.model.Service}
 */
jms.app.DicVisualizer.prototype.getServiceData_ = function(id) {
    if (this.services_.containsKey(id)) {
        return /** @type {!jms.model.Service} */ (this.services_.get(id));
    };
    
    var service = new jms.model.Service(id, [[], []]);
    service.setSynthetic(true);
    
    return service;
};

/**
 * Called when the search input is updated
 * 
 * @param {!goog.events.Event} e
 */
jms.app.DicVisualizer.prototype.onSearchInputUpdate = function(e) {
    var id = /** @type {string} */ (e.row);
    this.changeHistory(id);
};

/**
 * Called when the display direction of services changes
 * 
 * @param {!goog.events.Event} e
 */
jms.app.DicVisualizer.prototype.onDirectionChange = function(e) {
    this.direction_ = /** @type {string} */ (e.target.getSelectedChoice());
    
    if (null !== this.currentServiceId_) {
        this.changeHistory(this.currentServiceId_);
    }
};

/**
 * Called when the view size changes
 */
jms.app.DicVisualizer.prototype.onViewSizeChange = function() {
    if (null === this.currentServiceId_) {
        return;
    }
    
    this.displayService(this.currentServiceId_);
};

/**
 * Calculates the size available for the graphics element
 * 
 * @private
 * @param {goog.math.Size} size
 * @return {!goog.math.Size}
 */
jms.app.DicVisualizer.prototype.calculateSize_ = function(size) {
    if (null === size) {
        return new goog.math.Size(0, 0);
    }
    
    return new goog.math.Size(size.width-500, size.height-50);
};


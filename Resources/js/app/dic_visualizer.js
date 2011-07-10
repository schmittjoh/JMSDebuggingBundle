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
goog.require('goog.history.Html5History');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');

goog.require('soy');

goog.require('jms.ui.Input');
goog.require('jms.ui.ServiceGraph');
goog.require('jms.ui.ChoiceField');
goog.require('jms.ui.Navigator');
goog.require('jms.model.Service');
goog.require('jms.routing.Router');
goog.require('jms.templates.dic_visualizer');
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
     * @type {!goog.ui.Button}
     */
    this.displayServiceCreationButton_ = new goog.ui.Button('Created Services', goog.ui.LinkButtonRenderer.getInstance(), dom);
    this.displayServiceCreationButton_.addEventListener(goog.ui.Component.EventType.ACTION, goog.bind(function() {
    	this.tracker_._trackEvent("UI", "click", "Created Services");
    	this.history_.setToken(this.router_.generate({'action': jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CREATION_PATH}));
    }, this));
    this.addChild(this.displayServiceCreationButton_, true);
    
    /**
     * @private
     * @type {!goog.ui.Button}
     */
    this.displayServiceCallsButton_ = new goog.ui.Button('Service Calls', goog.ui.LinkButtonRenderer.getInstance(), dom);
    this.displayServiceCallsButton_.addEventListener(goog.ui.Component.EventType.ACTION, goog.bind(function() {
    	this.tracker_._trackEvent("UI", "click", "Service Calls");
    	this.history_.setToken(this.router_.generate({'action': jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CALLS}));
    }, this));
    this.addChild(this.displayServiceCallsButton_, true);
    
    /**
     * @private
     * @type {_ga_tracker}
     */
    this.tracker_ = null;
    goog.events.listenOnce(dom.getWindow(), goog.events.EventType.LOAD, function() {
    	this.tracker_ = /** @type {_ga_tracker} */ (dom.getWindow()['_gat']._createTracker(jms.app.DicVisualizer.GA_ACCOUNT));
    	this.tracker_._setDomainName('none');
    	this.tracker_._setAllowHash(false);
    	this.tracker_._trackPageview(this.history_.getToken());
    }, undefined, this);
    
    /**
     * @private
     * @type {jms.ui.DirectedGraph}
     */
    this.serviceGraph_ = null;
    
    /**
     * @private
     * @type {goog.ui.Component}
     */
    this.serviceCreationPath_ = null;
    
    /**
     * @private
     * @type {goog.ui.Component}
     */
    this.serviceCalls_ = null;
    
    /**
     * @private
     * @type {!goog.ui.PopupMenu}
     */
    this.contextMenu_ = new goog.ui.PopupMenu(dom);
    this.addChild(this.contextMenu_, false);
    this.contextMenu_.render(dom.getDocument().body);
    
    // initialize history (uses HTML 5 history if available)
    if (goog.history.Html5History.isSupported(dom.getWindow())) {
    	this.history_ = new goog.history.Html5History(dom.getWindow());
    	this.history_.setUseFragment(true);
    } else {
    	this.history_ = new goog.History();
    }
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
 * @type {string}
 */
jms.app.DicVisualizer.GA_ACCOUNT = 'UA-166816-9';

/**
 * @enum {number}
 */
jms.app.DicVisualizer.ACTIONS = {
    DISPLAY_SERVICE: 1,
    DISPLAY_SERVICE_CREATION_PATH: 2,
    DISPLAY_SERVICE_CALLS: 3
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
        } else if (params["action"] == jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CREATION_PATH) {
        	this.displayServiceCreationPath(parseInt(params["currentPos"], 10));
        } else if (params["action"] == jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CALLS) {
        	this.displayServiceCalls();
        }
    } catch (ex) {
    	if (ex instanceof jms.routing.Router.NoRouteFoundException) {
    		if (goog.DEBUG) {
    			alert('No route found for hash "' + hash + '".');
    		}
    	} else {
    		throw ex;
    	}
    }
};

/**
 * Registers available routes for the application.
 * 
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
    this.router_.registerRoute(new jms.routing.Route(
    	"service-calls", {"action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CALLS}
    ));
    this.router_.registerRoute(new jms.routing.Route(
    	"service-creation-path", {"action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CREATION_PATH, "currentPos": 0}
    ));
    this.router_.registerRoute(new jms.routing.Route(
        "service-creation-path/:currentPos", {"action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CREATION_PATH}, {"currentPos": "(\\d+)"}		
    ));
};

/**
 * @inheritDoc
 */
jms.app.DicVisualizer.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    var dom = this.getDomHelper();
    dom.appendChild(this.getElement(), soy.renderAsFragment(jms.templates.dic_visualizer.attribution));
    dom.appendChild(dom.getDocument().body, dom.createDom('script', {'src': 'http://www.google-analytics.com/ga.js', 'type': 'text/javascript'}));
    
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

jms.app.DicVisualizer.prototype.displayServiceCalls = function() {
	this.clearPage_();
	
	this.serviceCalls_ = new goog.ui.Component();
	this.addChild(this.serviceCalls_, true);
	this.serviceCalls_.getElement().id = 'jms-service-calls';
	
	// prepare template data
	var messages = [];
	var createdServices = 0;
	var totalTime = 0;
	for (var i=0, c=this.logMessages_.length; i<c; i++) {
		var created = this.logMessages_[i].hasException() || false === this.logMessages_[i].isCreated();
		
		if (created) {
			createdServices += 1;
		}
		
		totalTime += this.logMessages_[i].getTime();
		
		messages.push({
			id: this.logMessages_[i].getId(),
			caller: this.logMessages_[i].getCallerName(),
			created: created? 'false' : 'true',
			time: Math.round(this.logMessages_[i].getTime()*1000000)/1000
		});
	}
	
	soy.renderElement(this.serviceCalls_.getElement(), jms.templates.dic_visualizer.created_services, {
		createdServices: createdServices,
		messages: messages,
		totalTime: Math.round(totalTime*1000000)/1000
	});
};

/**
 * Displays the path for service creation.
 * 
 * @param {number} currentPos
 * @private
 */
jms.app.DicVisualizer.prototype.displayServiceCreationPath = function(currentPos) {
	if (null === this.serviceCreationPath_) {
		this.clearPage_();
		
		this.serviceCreationPath_ = new goog.ui.Component(this.getDomHelper());
		this.addChild(this.serviceCreationPath_, true);
		this.serviceCreationPath_.getElement().id = 'jms-created-services';

		var navigator = new jms.ui.Navigator(0, this.logMessages_.length - 1, 10, this.getDomHelper());
		navigator.setId('navigator');
		var updateCurrentPos = goog.bind(function() {
			this.history_.setToken(this.router_.generate({"action": jms.app.DicVisualizer.ACTIONS.DISPLAY_SERVICE_CREATION_PATH, "currentPos": navigator.getCurrentPos()}));
		}, this);
		navigator.addEventListener(jms.ui.Navigator.EventType.NEXT, updateCurrentPos);
		navigator.addEventListener(jms.ui.Navigator.EventType.PREVIOUS, updateCurrentPos);
		this.serviceCreationPath_.addChild(navigator, true);
	}

	this.serviceCreationPath_.getChild('navigator').setCurrentPos(currentPos);
	
	var uiGraph = this.serviceCreationPath_.getChild('graph');
	if (null !== uiGraph) {
		this.serviceCreationPath_.removeChild(uiGraph, true);
	}
	
	// prepare graph structure
	var graph = new jms.structs.DirectedGraph();
	for (var i=currentPos, c=Math.min(currentPos + 10, this.logMessages_.length); i<c; i++) {
		var sourceNode = graph.getOrCreateNode(this.logMessages_[i].getCaller().getRealId());
		var targetNode = graph.getOrCreateNode(this.logMessages_[i].getId());
		graph.connect(sourceNode.getId(), targetNode.getId(), false);
	}
	
	var edgeDrawingStrategy = new jms.ui.graph.ArrowEdgeDrawingStrategy();
	edgeDrawingStrategy.setAddIndex(true);
	
	uiGraph = new jms.ui.DirectedGraph(this.calculateSize_(this.vsm_.getSize()), graph, undefined, undefined, edgeDrawingStrategy, this.getDomHelper());
	uiGraph.setId('graph');
	this.serviceCreationPath_.addChild(uiGraph, true);
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
    
    this.clearPage_();
    
    var digraph = this.generateDigraph_(id, maxLevel);
//    var nodePlacementStrategy = new jms.ui.graph.CostAwareNodePlacementStrategy(new jms.ui.graph.ForceDirectedNodePlacementStrategy());
    var nodePlacementStrategy = undefined;
    this.serviceGraph_ = new jms.ui.ServiceGraph(this.calculateSize_(this.vsm_.getSize()), digraph, nodePlacementStrategy, undefined, new jms.ui.graph.ArrowEdgeDrawingStrategy(), this.getDomHelper());
    this.serviceGraph_.addEventListener(goog.events.EventType.DBLCLICK, goog.bind(function(e) {
        var serviceNode = /** @type {!jms.ui.ServiceNode} */ (e.target);
        
        this.tracker_._trackEvent("UI", "dbclick", "Service");
        
        this.changeHistory(serviceNode.getService().getId());
    }, this));
    this.serviceGraph_.addEventListener(goog.events.EventType.CONTEXTMENU, goog.bind(this.showContextmenu, this));
    this.serviceGraph_.addEventListener(goog.fx.Dragger.EventType.END, goog.bind(function() {
    	this.tracker_._trackEvent("UI", "drag", "Service");
    }, this));
    this.addChild(this.serviceGraph_, true);
    
    goog.dom.classes.add(this.serviceGraph_.getUiNode(id).getElement(), 'jms-ui-node-highlight');
};

/**
 * Clears the current page of any display elements.
 * 
 * This method does only delete elements which belong to a specific
 * action, not the general UI elements.
 * 
 * @private
 */
jms.app.DicVisualizer.prototype.clearPage_ = function() {
	if (null !== this.serviceGraph_) {
		this.serviceGraph_.dispose();
		this.serviceGraph_ = null;
	}

	if (null !== this.serviceCreationPath_) {
		this.serviceCreationPath_.dispose();
		this.serviceCreationPath_ = null;
	}
	
	if (null !== this.serviceCalls_) {
		this.serviceCalls_.dispose();
		this.serviceCalls_ = null;
	}
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
    
    this.tracker_._trackEvent("UI", "click", "Service Contextmenu");
    
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
    
    this.tracker_._trackEvent("UI", "change", "Search Input");
    
    this.changeHistory(id);
};

/**
 * Called when the display direction of services changes
 * 
 * @param {!goog.events.Event} e
 */
jms.app.DicVisualizer.prototype.onDirectionChange = function(e) {
    this.direction_ = /** @type {string} */ (e.target.getSelectedChoice());
    
    this.tracker_._trackEvent("UI", "click", "Direction Change");
    
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


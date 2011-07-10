goog.provide('jms.ui.graph.ServicePathEdgeDrawingStrategy');

goog.require('jms.ui.graph.ArrowEdgeDrawingStrategy');

/**
 * @constructor
 * @extends {jms.ui.graph.ArrowEdgeDrawingStrategy}
 */
jms.ui.graph.ServicePathEdgeDrawingStrategy = function() {
	goog.base(this);
};
goog.inherits(jms.ui.graph.ServicePathEdgeDrawingStrategy, jms.ui.graph.ArrowEdgeDrawingStrategy);

/**
 * @override
 */
jms.ui.graph.ServicePathEdgeDrawingStrategy.prototype.getColor = function(edgeValue) {
	return '#000000';
};


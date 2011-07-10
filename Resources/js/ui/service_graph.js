goog.provide('jms.ui.ServiceGraph');

goog.require('jms.ui.DirectedGraph');
goog.require('jms.ui.ServiceNode');

/**
 * @constructor
 * @param {!goog.math.Size} size
 * @param {!jms.structs.DirectedGraph} graph
 * @param {!jms.ui.graph.NodePlacementStrategy=} opt_nodePlacementStrategy
 * @param {!jms.ui.graph.ScalingStrategy=} opt_scalingStrategy
 * @param {!jms.ui.graph.EdgeDrawingStrategy=} opt_edgeDrawingStrategy
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {jms.ui.DirectedGraph}
 */
jms.ui.ServiceGraph = function(size, graph, opt_nodePlacementStrategy, opt_scalingStrategy, opt_edgeDrawingStrategy, opt_domHelper) {
    goog.base(this, size, graph, opt_nodePlacementStrategy, opt_scalingStrategy, opt_edgeDrawingStrategy, opt_domHelper);
};
goog.inherits(jms.ui.ServiceGraph, jms.ui.DirectedGraph);

/**
 * @override
 */
jms.ui.ServiceGraph.prototype.createNode = function(id, model) {
	return new jms.ui.ServiceNode(id, /** @type {!jms.structs.Node} */ (model));
};
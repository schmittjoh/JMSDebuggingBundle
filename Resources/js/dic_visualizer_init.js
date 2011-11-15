goog.require('goog.structs.Map');
goog.require('goog.dom.DomHelper');
goog.require('goog.debug.ErrorHandler');

goog.require('jms.app.DicVisualizer');
goog.require('jms.model.Service');
goog.require('jms.model.Caller');
goog.require('jms.model.LogMessage');

/**
 * @fileoverview Entry point for the DIC visualizer
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */

/**
 * @define {number}
 */
jms.app.DicVisualizer.MAX_LEVEL = 3;

/**
 * @param {string} id
 * @param {!Object} containerData
 * @param {?Array.<*>} rawLogMessages
 */
jms.app.DicVisualizer.install = function(id, containerData, rawLogMessages) {
    // convert passed data to custom type
    var services = new goog.structs.Map();
    goog.object.forEach(containerData, function(serviceData, id) {
        var service = new jms.model.Service(id, serviceData['dependencies']);
        service.setPublic(serviceData['public']);
        service.setAlias(serviceData['alias']);
        services.set(id, service);
    });
    
    var logMessages = [];
    if (null !== rawLogMessages) {
	    goog.array.forEach(rawLogMessages, function(rawMessage) {
	        var caller = null !== rawMessage['caller'] ? new jms.model.Caller(
	            rawMessage['caller']['type'] === 'service'
	            ? jms.model.Caller.Type.SERVICE : jms.model.Caller.Type.OBJECT,
	            rawMessage['caller']['type'] === 'service'
	            ? rawMessage['caller']['id'] : rawMessage['caller']['class'],
	            rawMessage['caller']['method']
	        ) : null;
	        var message = new jms.model.LogMessage(rawMessage['type'], rawMessage['id'], caller, rawMessage['time']);
	        
	        if (jms.model.LogMessage.Type.GET === rawMessage['type']) {
	            message.setCreated(rawMessage['created']);
	        }
	        
	        goog.array.insert(logMessages, message);
	    });
    }

    var dom = new goog.dom.DomHelper();
    var app = new jms.app.DicVisualizer(dom, services, logMessages, jms.app.DicVisualizer.MAX_LEVEL);
    app.render(dom.getElement(id));
};

goog.exportSymbol('jms_dic_visualizer_install', jms.app.DicVisualizer.install);
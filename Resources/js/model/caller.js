goog.provide('jms.model.Caller');

/**
 * @constructor
 * @param {number} type
 * @param {string} id
 * @param {?string} method
 */
jms.model.Caller = function(type, id, method) {
	this.type_ = type;
	this.id_ = id;
	this.method_ = method;
};

/**
 * @enum {number}
 */
jms.model.Caller.Type = {
	SERVICE: 1,
	OBJECT:  2
};

/**
 * @return {boolean}
 */
jms.model.Caller.prototype.isService = function() {
	return jms.model.Caller.Type.SERVICE === this.type_;
};

/**
 * @return {boolean}
 */
jms.model.Caller.prototype.isObject = function() {
	return jms.model.Caller.Type.OBJECT === this.type_; 
};

/**
 * This can either be a service id or a class name depending on the type.
 * 
 * @return {string}
 */
jms.model.Caller.prototype.getId = function() {
	return this.id_;
};

/**
 * @return {?string}
 */
jms.model.Caller.prototype.getMethod = function() {
	return this.method_;
};

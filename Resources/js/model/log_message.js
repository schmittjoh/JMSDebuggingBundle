goog.provide('jms.model.LogMessage');

/**
 * @constructor
 * @param {number} type
 * @param {string} id
 * @param {!jms.model.Caller} caller 
 */
jms.model.LogMessage = function(type, id, caller) {
	this.type_ = type;
	this.id_ = id;
	this.caller_ = caller;
	this.created_ = false;
};

/**
 * @enum {number}
 */
jms.model.LogMessage.TYPE = {
	EXCEPTION_ON_GET: 1,
	GET:              2
};

/**
 * @return {number}
 */
jms.model.LogMessage.prototype.getType = function() {
	return this.type_;
};

/**
 * @return {string}
 */
jms.model.LogMessage.prototype.getId = function() {
	return this.id_;
};

/**
 * @return {!jms.model.Caller}
 */
jms.model.LogMessage.prototype.getCaller = function() {
	return this.caller_;
};

/**
 * Whether the service was created, or simply looked up from an internal map.
 * 
 * @return {boolean}
 */
jms.model.LogMessage.prototype.isCreated = function() {
	return this.created_;
};

/**
 * @param {boolean} bool
 */
jms.model.LogMessage.prototype.setCreated = function(bool) {
	this.created_ = bool;
};
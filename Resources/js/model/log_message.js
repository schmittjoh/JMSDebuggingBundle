goog.provide('jms.model.LogMessage');

/**
 * @constructor
 * @param {number} type
 * @param {string} id
 * @param {jms.model.Caller} caller 
 * @param {number} time
 */
jms.model.LogMessage = function(type, id, caller, time) {
	this.type_ = type;
	this.id_ = id;
	this.caller_ = caller;
	this.time_ = time;
	this.created_ = false;
};

/**
 * @enum {number}
 */
jms.model.LogMessage.Type = {
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
 * @return {boolean}
 */
jms.model.LogMessage.prototype.hasException = function() {
	return jms.model.LogMessage.Type.EXCEPTION_ON_GET === this.type_;
};

/**
 * @return {string}
 */
jms.model.LogMessage.prototype.getId = function() {
	return this.id_;
};

/**
 * @return {jms.model.Caller}
 */
jms.model.LogMessage.prototype.getCaller = function() {
	return this.caller_;
};

/**
 * @return {string}
 */
jms.model.LogMessage.prototype.getCallerName = function() {
	if (null === this.caller_) {
		return '';
	}
	
	var callerId = this.caller_.getId();
	
	// determine the real service
	if ('service_container' === callerId) {
		return this.caller_.getRealId() + ' (during construction)';
	}
	
	return callerId + '::' + this.caller_.getMethod() + '()';
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
 * @return {number}
 */
jms.model.LogMessage.prototype.getTime = function() {
	return this.time_;
};
/**
 * @param {boolean} bool
 */
jms.model.LogMessage.prototype.setCreated = function(bool) {
	this.created_ = bool;
};

goog.provide('jms.model.Service');

/**
 * @constructor
 * @param {string} id
 * @param {Array.<[!Array.<string>, !Array.<string>]>=} opt_dependencies
 */
jms.model.Service = function(id, opt_dependencies) {
    this.id_ = id;
    this.scope_ = 'container';
    this.public_ = true;
    this.synthetic_ = false;
    this.class_ = null;
    this.alias_ = false;
    this.dependencies_ = opt_dependencies || [[], []];
};

/**
 * @return {string}
 */
jms.model.Service.prototype.getId = function() {
    return this.id_;
};

/**
 * @param {boolean} bool
 */
jms.model.Service.prototype.setSynthetic = function(bool) {
    this.synthetic_ = bool;
};

/**
 * @return {boolean}
 */
jms.model.Service.prototype.isSynthetic = function() {
    return this.synthetic_;
};

/**
 * @return {boolean}
 */
jms.model.Service.prototype.isPublic = function() {
	return this.public_;
};

/**
 * @param {boolean} bool
 */
jms.model.Service.prototype.setPublic = function(bool) {
	this.public_ = bool;
};

/**
 * @param {boolean} bool
 */
jms.model.Service.prototype.setAlias = function(bool) {
	this.alias_ = bool;
};

/**
 * @return {boolean}
 */
jms.model.Service.prototype.isAlias = function() {
	return this.alias_;
};

/**
 * @param {string} clazz
 */
jms.model.Service.prototype.setClass = function(clazz) {
    this.class_ = clazz;
};

/**
 * @return {?string}
 */
jms.model.Service.prototype.getClass = function() {
    return this.class_;
};

/**
 * @param {string} scope
 */
jms.model.Service.prototype.setScope = function(scope) {
    this.scope_ = scope;
};

/**
 * @return {string}
 */
jms.model.Service.prototype.getScope = function() {
    return this.scope_;
};

/**
 * @return {!Array.<string>}
 */
jms.model.Service.prototype.getInDependencies = function() {
    return this.dependencies_[0];
};

/**
 * @return {!Array.<string>}
 */
jms.model.Service.prototype.getWeakInDependencies = function() {
    return this.dependencies_[2];
};

/**
 * @return {!Array.<string>}
 */
jms.model.Service.prototype.getOutDependencies = function() {
    return this.dependencies_[1];
};

/**
 * @return {!Array.<string>}
 */
jms.model.Service.prototype.getWeakOutDependencies = function() {
    return this.dependencies_[3];
};

'use strict';


// Declare app level module which depends on filters, and services
angular.module('easyModel', [
  'ngRoute',
  'easyModel.data',
  'easyModel.directives',
  'easyModel.demoController',
  'easyModel.models',
  'easyModel.validators',
   'ActiveRecord'
]).
config(['$routeProvider', '$provide', function($routeProvider, $provide) {
  $routeProvider.when('/', {templateUrl: 'tmpl/main.html', controller: 'DemoController as demoCtrl'});
  //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

angular.module('easyModel.models',[]);
angular.module('easyModel.data', []);
angular.module('easyModel.validators', []);

angular.module('ActiveRecord', []).factory('ActiveRecord', ['$http', '$q', '$parse', function($http, $q, $parse) {
    'use strict';

    /**
     * If the value of the named property is a function then invoke it; otherwise, return it.
     * @param {Object} object
     * @param {String} property
     * @ignore
     */
    var _result = function (object, property) {
        if (object == null) return null;
        var value = object[property];
        return angular.isFunction(value) ? value.call(object) : value;
    };

    /**
     * Apply the filters to the properties.
     *
     * @param {Object|null} filters The $readFilters or $writeFilters.
     * @param {Object} properties
     * @ignore
     */
    var applyFilters = function (filters, properties) {
        if (filters) {
            angular.forEach(filters, function (filter, path) {
                var expression = $parse(path);
                var value = expression(properties);
                if (angular.isDefined(value)) {
                    var newValue = (angular.isFunction(filter)) ? filter(value) : $parse(path + '|' + filter)(properties);
                    expression.assign(properties, newValue);
                }
            });
        }
    };

    /**
     * @class ActiveRecord  ActiveRecord for AngularJS
     * @constructor
     * @param {Object} [properties]  Initialize the record with these property values.
     * @param {Object} [options]
     */
    var ActiveRecord = function ActiveRecord(properties, options) {
        this.$initialize.apply(this, arguments);
    };
    ActiveRecord.prototype = {

        /**
         * @property {String} $idAttribute  The default name for the JSON id attribute is "id".
         */
        $idAttribute: 'id',

        /**
         * @property {String} $urlRoot  Used by $url to generate URLs based on the model id. "[urlRoot]/id"
         */
        $urlRoot: null,

        /**
         * Constructor logic
         * (which is called by the autogenerated constructor via ActiveRecord.extend)
         * @param {Object} [properties]  Initialize the record with these property values.
         * @param {Object} [options]
         */
        $initialize: function (properties, options) {
            options = options || {};
            var defaults = _result(this, '$defaults');
            if (defaults) {
                angular.extend(this, defaults);
            }
            if (properties) {
                if (options.parse) {
                    properties = this.$parse(properties);
                }
                if (options.readFilters) {
                    applyFilters(_result(this, '$readFilters'), properties);
                }
                angular.extend(this, properties);
                this.$previousAttributes = function () {
                    return properties;
                };
            }
            if (options.url) {
                this.$url = options.url;
            }
            if (options.urlRoot) {
                this.$urlRoot = options.urlRoot;
            }
        },

        /**
         * Determine if the model has changed since the last sync (fetch/load).
         *
         * @param {String} [property] Determine if that specific property has changed.
         * @returns {Boolean}
         */
        $hasChanged: function (property) {
            var changed = this.$changedAttributes();
            if (property) {
                return property in changed;
            }
            for (var i in changed) {
                return true;
            }
            return false;
        },

        /**
         * Return an object containing all the properties that have changed.
         * Removed properties will be set to undefined.
         *
         * @param {Object} [diff] An object to diff against, determining if there would be a change.
         * @returns {Object}
         */
        $changedAttributes: function (diff) {
            var current = diff || this; // By default diff against the current values
            var changed = {};
            var previousAttributes = this.$previousAttributes();
            if (!diff) { // Skip removed properties (only compare the properties in the diff object)
                for (var property in previousAttributes) {
                    if (typeof current[property] === 'undefined') {
                        changed[property] = current[property];
                    }
                }
            }
            for (var property in current) {
                if (current.hasOwnProperty(property)) {
                    var value = current[property];
                    if (typeof value !== 'function' && angular.equals(value, previousAttributes[property]) === false) {
                        changed[property] = value;
                    }
                }
            }
            return changed;
        },

        /**
         * Get the previous value of a property.
         * @param {String} [property]
         */
        $previous: function (property) {
            var previousAttributes = this.$previousAttributes();
            if (property == null || !previousAttributes) {
                return null;
            }
            return previousAttributes[property];
        },

        /**
         * Get all of the properties of the model at the time of the previous sync (fetch/save).
         * @returns {Object}
         */
        $previousAttributes: function () {
            return {};
        },

        /**
         * (re)load data from the backend.
         * @param {Object} [options] sync options
         * @return $q.promise
         */
        $fetch: function (options) {
            var model = this;
            var deferred = $q.defer();
            this.$sync('read', this, options).then(function (response) {
                var data = model.$parse(response.data, options);
                if (angular.isObject(data)) {
                    applyFilters(_result(model, '$readFilters'), data);
                    angular.extend(model, data);
                    model.$previousAttributes = function () {
                        return data;
                    };
                    deferred.resolve(model);
                } else {
                    deferred.reject('Not a valid response type');
                }
            }, deferred.reject);
            return deferred.promise;
        },

        /**
         * Save the record to the backend.
         * @param {Object} [values] Set these values before saving the record.
         * @param {Object} [options] sync options
         * @return $q.promise
         */
        $save: function (values, options) {
            if (values) {
                if (angular.isString(values)) {
                    values = {};
                    values[arguments[0]] = options;
                    options = arguments[2];
                }
                angular.extend(this, values);
            }
            var operation = this.$isNew() ? 'create' : 'update';
            var model = this;
            options = options || {};
            var filters = _result(this, '$writeFilters');
            if (filters) {
                options.data = angular.copy(this);
                applyFilters(filters, options.data);
            } else {
                options.data = this;
            }
            return this.$sync(operation, this, options).then(function (response) {
                var data = model.$parse(response.data, options);
                if (angular.isObject(data)) {
                    applyFilters(_result(model, '$readFilters'), data);
                    angular.extend(model, data);
                    model.$previousAttributes = function () {
                        return data;
                    };
                }
                return model;
            });
        },

        /**
         * Destroy this model on the server if it was already persisted.
         * @param {Object} [options] sync options
         * @return $q.promise
         */
        $destroy: function (options) {
            var deferred = $q.defer();
            if (this.$isNew()) {
                deferred.resolve();
                return deferred.promise;
            }
            this.$sync('delete', this, options).then(function () {
                deferred.resolve();
            }, deferred.reject);
            return deferred.promise;
        },

        /**
         * Generate the url for the $save, $fetch and $destroy methods.
         * @return {String} url
         */
        $url: function() {
            var urlRoot = _result(this, '$urlRoot');
            if (typeof this[this.$idAttribute] === 'undefined') {
                return urlRoot;
            }
            if (urlRoot === null) {
                throw 'Implement this.$url() or specify this.$urlRoot';
            }
            return urlRoot + (urlRoot.charAt(urlRoot.length - 1) === '/' ? '' : '/') + encodeURIComponent(this[this.$idAttribute]);
        },

        /**
         * Process the data from the response and return the record-properties.
         * @param {Object} data  The data from the sync response.
         * @param {Object} [options] sync options
         * @return {Object}
         */
        $parse: function (data, options) {
            return data;
        },

        /**
         * Process the record-properties and return the data for the resquest. (counterpart of $parse)
         * Called automaticly by JSON.stringify: @link https://developer.mozilla.org/en-US/docs/JSON#toJSON()_method
         */
        toJSON: function() {
            return this;
        },

        /**
         * @property {Object} $readFilters
         * Preform post-processing on the properties after $parse() through angular filters.
         * These could be done in $parse(), but $readFilters enables a more reusable and declarative way.
         */
        $readFilters: null,

        /**
         * @property {Object} $writeFilters
         * Preform pre-processing on the properties before $save() through angular filters.
         * These could be done in toJSON(), but $readFilters enables a more reusable and declarative way.
         */
        $writeFilters: null,

        /**
         * A model is new if it lacks an id.
         */
        $isNew: function () {
            return this[this.$idAttribute] == null;
        },

        /**
         * By default calls ActiveRecord.sync
         * Override to change the backend implementation on a per model bases.
         * @param {String} operation  "create", "read", "update" or "delete"
         * @param {ActiveRecord} model
         * @param {Object} options
         * @return $q.promise
         */
        $sync: function (operation, model, options) {
            return ActiveRecord.sync.apply(this, arguments);
        }
    };

    /**
     * Preform a CRUD operation on the backend.
     *
     * @static
     * @param {String} operation  "create", "read", "update" or "delete"
     * @param {ActiveRecord} model
     * @param {Object} options
     * @return $q.promise
     */
    ActiveRecord.sync = function (operation, model, options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        if (!options.method) {
            var crudMapping = {
                create: 'POST',
                read: 'GET',
                update: 'PUT',
                "delete": 'DELETE'
            };
            options.method = crudMapping[operation];
        }
        if (!options.url) {
            options.url = _result(model, '$url');
        }
        return $http(options);
    };

    /**
     * Create a subclass.
     * @static
     * @param {Object} protoProps
     * @param {Object} [staticProps]
     * @return {Function} Constructor
     */
    ActiveRecord.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && typeof protoProps.$constructor === 'function') {
            child = protoProps.$constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }
        angular.extend(child, parent, staticProps);
        var Surrogate = function () { this.$constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        if (protoProps) {
            angular.extend(child.prototype, protoProps);
        }
        child.__super__ = parent.prototype;
        return child;
    };

    /**
     * Load a single record.
     *
     * @static
     * @param {Mixed} id
     * @param {Object} [options]
     * @return $q.promise
     */
    ActiveRecord.fetchOne = function (id, options) {
        var model = new this();
        model[model.$idAttribute] = id;
        return model.$fetch(options);
    };

    /**
     * Load a collection of records.
     *
     * @static
     * @param {Object} [options]
     * @return $q.promise
     */
    ActiveRecord.fetchAll = function (options) {
        var ModelType = this;
        var model = new ModelType();
        var deferred = $q.defer();
        model.$sync('read', model, options).then(function (response) {
            var data = model.$parse(response.data, options);
            if (angular.isArray(data)) {
                var models = [];
                var filters = ModelType.prototype.$readFilters;
                angular.forEach(data, function (item) {
                    applyFilters(filters, item);
                    models.push(new ModelType(item));
                });
                deferred.resolve(models);
            } else {
                deferred.reject('Not a valid response, expecting an array');
            }
        }, deferred.reject);
        return deferred.promise;
    };
    return ActiveRecord;
}]);
'use strict';


angular.module('easyModel.data').factory('Model', ['$injector', 'Validation', 'Validator', function($injector, Validation, Validator) {
    
    function Model(entity, entityName, configs){
        var field,
            data = configs.data,
            entityConstructor,
            fields,
            i,ln;

        this.entityName = entityName;
        this.entity = entity;

        this.validationChangeListeners = [];

        if(configs.fields) {
            fields = configs.fields;
            this.fields = fields;
        }

        for(i = 0, ln = fields.length; i < ln; i++) {
            field = fields[i];

            if(data[field.name]){
                if(field.reference) {
                    if($injector.has('model' + field.reference)) {
                        entityConstructor = $injector.get('model' + field.reference);

                        if(field.unique) {
                            entity[field.name] = new entityConstructor(data[field.name]);
                        }else
                        if(field.isManyToOne) {
                            entity[field.name] = [];

                            data[field.name].forEach(function(dataItem){
                                this.push(new entityConstructor(dataItem));
                            }.bind(entity[field.name]))
                        }
                    }
                }else{
                    entity[field.name] = data[field.name];
                }
            }
        }

//        if(configs.data) {
//            angular.copy(configs.data,entity);
//        }

        if(configs.validators) {
            this.validators = initValidators(configs.validators);
        }

        if(configs.data) {
            this.data = configs.data;
        }
    }

    function initValidators(validatorsCfgs) {
        var keyValidatorsCfgs,
            keyValidators,
            validators = {},
            key,
            i,ln;

        for(key in validatorsCfgs) {
            keyValidatorsCfgs = validatorsCfgs[key];

            keyValidators = [];

            if(Array.isArray(keyValidatorsCfgs)) {
                for(i = 0, ln = keyValidatorsCfgs.length; i < ln; i++) {
                    keyValidators.push(new Validator(keyValidatorsCfgs[i]));
                }
            } else {
                keyValidators.push(new Validator(keyValidatorsCfgs));
            }

            validators[key] = keyValidators;
        }

        return validators;
    }

    Model.prototype = {

        // Returns the result of validations
        getValidation : function(refresh, silent) {
            var me = this,
                ret = me.validation;


            if(!ret) {
                refresh = true;
                me.validation = ret = new Validation(me);
            }

            if(refresh) {
                ret.refresh();
            }

            if(!silent) {
                me.validationChangeListeners.forEach(function(listener) {
                    listener(ret.data);
                });
            }

            return ret;
        },
        getValidationByField: function(fieldName, silent) {
            var me = this,
                ret = me.validation,
                validation;

            if(!ret) {
                me.validation = ret = new Validation(me);
            }

            validation = ret.getValidationByField(fieldName);

            if(!silent) {
                me.validationChangeListeners.forEach(function(listener) {
                    listener(validation);
                });
            }

            return validation;
        }
    };


    return {
        create: function(entityName, configs) {
            var constructor = {};

            constructor._record = new Model(constructor, entityName, configs);

            return constructor;
        }
    }

  }]);

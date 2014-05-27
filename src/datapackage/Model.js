'use strict';


angular.module('easyModel.data', []).factory('Model', ['$injector', function($injector) {
    
    function Model(entity, entityName, configs){
        var field,
            data = configs.data,
            entityConstructor,
            fields,
            i,ln;

        this.entityName = entityName;
        this.entity = entity;

        this.validation = [];

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
            this.validators = configs.validators;
        }

        if(configs.data) {
            this.data = configs.data;
        }
    }

    Model.prototype = {
        getValidation : function(name, silent) {
            var validators = this.validators[name],
                validation = this.validation,
                i,ln;

            validation.length = 0;

            if(validators) {
                if(Array.isArray(validators)) {
                    for(i = 0, ln = validators.length; i < ln; i++){
                        validation.push(validators[i].validate(this.entity[name]));
                    }
                }else
                if(typeof validators === 'object') {
                    validation.push(validators.validate(this.entity[name]));
                }
            }

            if(!silent) {
                this.validationChangeListeners. forEach(function(listener) {
                    listener(validation);
                });
            }

            return validation;
        },
        validate: function() {
            var fields = this.fields,
                entity = this.entity,
                field,
                i,ln;

            for (i = 0, ln = fields.length; i < ln; ++i) {
                field = fields[i];

                if(field.reference) {
                    if(field.unique) {
                        entity[field.name]._record.validate();
                    }else
                    if(field.isManyToOne){
                        entity[field.name].forEach(function(item){
                            item._record.validate();
                        });
                    }
                }else{
                    this.getValidation(field.name);
                }
            }
        }
    }


    return {
        create: function(entityName, configs) {
            var constructor = {};

            constructor._record = new Model(constructor, entityName, configs);

            return constructor;
        }
    }

  }]);

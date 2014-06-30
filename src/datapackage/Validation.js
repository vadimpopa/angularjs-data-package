/**
 * Created by popavadim on 6/30/14.
 */
angular.module('easyModel.data').factory('Validation', [function() {

    'use strict';

    function Validation(record){
        this.record = record;
        this.data = [];
    }

    Validation.prototype = {

        // Validate a field
        getValidationByField : function(name) {
            var record = this.record.entity,
                value = record[name],
                validation = [],
                validators,
                i,ln;

            validation.length = 0;

            if(record._record.validators) {
                validators = record._record.validators[name];
            }

            if(validators) {
                if(Array.isArray(validators)) {

                    for(i = 0, ln = validators.length; i < ln; i++){

                        // Check if there is a validate function
                        if(validators[i].validate) {
                            validation.push(validators[i].validate(value));
                        }
                    }

                } else
                if(typeof validators === 'object') {

                    if(validators.validate) {
                        validation.push(validators.validate(value));
                    }
                }
            }

            return validation;
        },

        //Validate entire model
        refresh: function() {
            var fields = this.record.fields,
                record = this.record.entity,
                validation = [],
                fieldValidation = [],
                validations,
                field,
                i,ln;

            for (i = 0, ln = fields.length; i < ln; ++i) {
                field = fields[i];

                fieldValidation.length = 0;

                if(field.reference) {
                    if(field.unique) {
                        fieldValidation = record[field.name]._record.getValidation(true).data;
                    } else
                    if(field.isManyToOne){
                        record[field.name].forEach(function(item){
                            fieldValidation = fieldValidation.concat(item._record.getValidation(true).data);
                        });
                    }
                } else {
                    validations = this.getValidationByField(field.name);

                    if(validations.length > 0) {
                        fieldValidation = fieldValidation.concat(validations);
                    }
                }

                if(fieldValidation.length) {
                    validation = validation.concat(fieldValidation);
                }
            }

            this.data = validation;

            return validation;
        }
    };

    return Validation;

}]);

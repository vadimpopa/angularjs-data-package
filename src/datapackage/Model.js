'use strict';


angular.module('easyModel.data').factory('Model', ['$injector', 'Validation', 'Validator', function ($injector, Validation, Validator) {

  function Model(configs) {
    var self = this,
        data = configs.data,
        fields = configs.fields || [],
        entityConstructor,
        entity = {},
        field,
        i, ln;

    angular.extend(self,data);

    entity.phantom = true;
    entity.validationChangeListeners = [];

    for (i = 0, ln = fields.length; i < ln; i++) {
      field = fields[i];

      if (field.reference) {
        if ($injector.has('model' + field.reference)) {
          entityConstructor = $injector.get('model' + field.reference);

          if (field.unique) {
            self[field.name] = new entityConstructor(data[field.name]);
          } else if (field.isManyToOne) {
            self[field.name] = [];

            data[field.name].forEach(function (dataItem) {
              this.push(new entityConstructor(dataItem));
            }.bind(self[field.name]))
          }
        }
      }
    }

    if (configs.validators) {
      entity.validators = initValidators(configs.validators);
    }

    self.$entity = entity;
  }

  function initValidators(configs) {
    var validatorConfigs,
        validators = {},
        temp,
        key,
        i, ln;

    for (key in configs) {
      validatorConfigs = configs[key];

      temp = [];

      if (Array.isArray(validatorConfigs)) {
        for (i = 0, ln = validatorConfigs.length; i < ln; i++) {
          temp.push(Validator.create(validatorConfigs[i]));
        }
      } else {
        temp.push(Validator.create(validatorConfigs));
      }

      validators[key] = temp;
    }

    return validators;
  }

  Model.prototype = {

    // Returns the result of validations
    getValidation: function (refresh, silent) {
      var me = this,
          ret = me.validation;


      if (!ret) {
        refresh = true;
        me.validation = ret = new Validation(me);
      }

      if (refresh) {
        ret.refresh();
      }

      if (!silent) {
        me.validationChangeListeners.forEach(function (listener) {
          listener(ret.data);
        });
      }

      return ret;
    },

    getValidationByField: function (fieldName, silent) {
      var me = this,
          ret = me.validation,
          validation;

      if (!ret) {
        me.validation = ret = new Validation(me);
      }

      validation = ret.getValidationByField(fieldName);

      if (!silent) {
        me.validationChangeListeners.forEach(function (listener) {
          listener(validation);
        });
      }

      return validation;
    },

    commit: function () {

    },

    save: function () {

    }
  };


  return {
    create: function (entityName, configs) {
      function constructor() {
        Model.call(this, configs);
      }

      constructor.prototype = Object.create(Model.prototype, {
        $entityName: {
          value: entityName,
          enumerable: false,
          configurable: false,
          writable: false
        },
        $constructor: {
          value: constructor,
          enumerable: false,
          configurable: false,
          writable: false
        },
        $defaultConfigs: {
          value: {
            validators: configs.validators
          },
          enumerable: false,
          configurable: false,
          writable: true
        }
      });

      return new constructor();
    }
  }

}]);

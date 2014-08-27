angular.module('easyModel.validators').
    factory('validatorRequired', ['Validator', function (Validator) {
      function Required(configs) {
        return Validator.create(configs);
      }

      Required.prototype = Object.create(Validator.prototype);

      Required.prototype.type = configs.type;

      delete configs.type;

      return Required;
    }]);

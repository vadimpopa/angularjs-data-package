/**
 * Created by popavadim on 6/30/14.
 */
angular.module('easyModel.validators').factory('Validator', ['$injector', function($injector) {

    'use strict';

    return {
      create: function (configs) {
        var constructor;

        function Validator(configs){
          this.isValid = true;
          this.validation = [];
          this.isError = configs.isError === true;
        }

        Validator.prototype = {
          validate: configs.validate
        };

        if(configs.type && $injector.has('validator' + configs.type)) {
          constructor = $injector.get('validator' + configs.type);

          return new constructor(configs);
        }

        return Validator
      }
    };

}]);


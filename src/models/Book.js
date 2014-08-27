angular.module('easyModel.models').
    factory('modelBook', ['Model', function (Model) {

      var validators = {
        name: [
          {
            type: "Required",
            message: "This field is required",
            isValid: true,
            isError: true,
            validate: function (value) {
              this.isValid = true;

              if (!value) {
                this.isValid = false;
              }

              return this;
            }
          }
        ]
      };

      function Book(data) {
        return Model.create("Book", {
          data: data,
          validators: validators
        });
      }

      return( Book );
    }]);

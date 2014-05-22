angular.module('easyModel.models').
  factory('modelReader', ['Model',function(Model) {

    function Reader(data){
        return Model.create("Reader",{
            data: data,
            fields: [
                {name: "id"},
                {name: "name"},
                {name: "age"},
                {name: "phone"},
                {name: "address", reference: "Address", unique: true}
            ],
            validators: {
                name: [{
                    type: "required",
                    message: "Name is required",
                    isValid: true,
                    isError: true,
                    validate: function(value) {
                        this.isValid = true;

                        if(!value) {
                            this.isValid = false;
                        }

                        return this;
                    }
                },{
                    type: "optional",
                    message: "This field is optional",
                    isValid: true,
                    isError: true,
                    validate: function() {
                        this.isValid = false;
                        return this;
                    }
                },{
                    type: "optional1",
                    message: "This field is optional1",
                    isValid: true,
                    isWarning: true,
                    validate: function() {
                        this.isValid = false;
                        return this;
                    }
                }],
                address: {
                    type: "required",
                    message: "Street is required",
                    isValid: true,
                    isError: true,
                    validate: function(value) {
                        this.isValid = true;

                        if(!value.street) {
                            this.isValid = false;
                        }

                        return this;
                    }
                }
            }
        });
    }

    return( Reader );
  }]);

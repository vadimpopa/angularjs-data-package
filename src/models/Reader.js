angular.module('easyModel.models').
  factory('modelReader', ['Model',function(Model) {
        var fields = [
            {name: "id"},
            {name: "name"},
            {name: "age"},
            {name: "phone"},
            {name: "address", reference: "Address", unique: true}
        ];

    function Reader(data){
        return Model.create("Reader",{
            data: data,
            fields: fields,
            validators: {
                name: [{
                    type: "Required",
                    message: "Name is required",
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
                    validate: function() {
                        this.isValid = false;
                        return this;
                    }
                },{
                    type: "optional1",
                    message: "This field is optional1",
                    isWarning: true,
                    validate: function() {
                        this.isValid = false;
                        return this;
                    }
                }],
                address: {
                    type: "streetrequired",
                    message: "Street is required",
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

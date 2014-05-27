angular.module('easyModel.models').
    factory('modelAddress', ['Model',function(Model) {
        function Address(data){
            return Model.create("Address",{
                data: data,
                fields: [
                    {name: "city"},
                    {name: "street"},
                    {name: "house"}
                ],
                validators: {
                    street: [{
                        type: "required",
                        message: "This field is required",
                        isValid: true,
                        isError: true,
                        validate: function(value) {
                            this.isValid = true;

                            if (!value) {
                                this.isValid = false;
                            }

                            return this;
                        }
                    }]
                }
            });
        }
        return( Address );
    }]);

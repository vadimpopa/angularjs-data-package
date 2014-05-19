angular.module('easyModel.models').
    factory('modelBook', ['Model',function(Model) {
        function Book(data){
            return Model.create("Book",{
                data: data,
                fields: [
                    {name: "name"},
                    {name: "booksCount"},
                    {name: "address"},
                    {name: "readers"}
                ],
                validators: {
                    name: [{
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
        return( Book );
    }]);

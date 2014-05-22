angular.module('easyModel.models').
    factory('modelLibrary', ['Model',function(Model) {
        function Library(data){
            return Model.create("Library",{
                data: data,
                fields: [
                    {name: "name"},
                    {name: "booksCount"},
                    {name: "address", reference: 'Address', unique: true},
                    {name: "readers", reference: 'Reader', isManyToOne: true}
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
                    }],
                    readers:{}
                }
            });
        }
        return( Library );
    }]);
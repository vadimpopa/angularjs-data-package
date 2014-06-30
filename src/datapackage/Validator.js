/**
 * Created by popavadim on 6/30/14.
 */
angular.module('easyModel.data', []).factory('Validator', [function() {

    'use strict';

    function Validator(configs){
        var me = this;

        this.isValid = true;
        this.validation = [];
        this.isError = configs.isError === true;

        angular.extend(me, configs);

    }

    return Validator;

}]);


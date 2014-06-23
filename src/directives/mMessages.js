angular.module('easyModel.directives').directive('mMessages', [ '$parse',
    function ($parse) {
        'use strict';

        return {
            restrict: 'A',
            require: '^form',
            template: function () {
                return  '<div class="validation-message" data-ng-repeat="validation in validations" ng-class="{error: validation.isError, warning: !validation.isError}">' +
                    '    <span class="pull-left" data-ng-if="iconClass">' +
                    '        <i data-ng-show="text" data-ng-class="iconClass"></i>' +
                    '    </span>' +
                    '<span class="validation-message-text">{{validation.message}}</span>' +
                    '</div>';
            },
            scope: true,
            compile: function compile(element, attrs) {
                var validatorsFn;

                if(attrs.mMessages) {
                    validatorsFn = $parse(attrs.mMessages);
                }

                return function link(scope, element, attrs, formCtrl) {
                    scope.validations = [];
                    scope.iconClass = attrs.iconClass;

                    if (!formCtrl) {
                        formCtrl = element.parent().controller('form');
                    }

                    if (!formCtrl) {
                        throw new Error('The form controller is not found. Place validation-message inside a form block.');
                    }

                    var pScope = scope.$parent,
                        formName = formCtrl.$name,
                        validators;

                    if (!formName) {
                        angular.forEach(pScope, function (value, key) {
                            if (value === formCtrl) {
                                formName = key;
                            }
                        });
                    }

                    if (!pScope[formName]) {
                        pScope = pScope.$$prevSibling;
                    }

                    if(validatorsFn) {
                        validators = validatorsFn(scope);
                        pScope.$watch('[' + formName + '.' + '$error,' + formName + '.' + '$warning]', proceedErrors.bind(scope, validators), true);
                    }

                    function proceedErrors(validators, formValidations) {
                        var i, ln,
                            validations = this.validations;

                        validations.length = 0;

                        for(i = 0, ln = validators.length; i < ln; i++) {

                            formValidations.forEach(function(validationsCollection){
                                var validation,
                                    validator,
                                    ctrl;

                                if(validationsCollection.hasOwnProperty(validators[i])) {
                                    validation = validationsCollection[validators[i]];

                                    if(validation) {
                                        ctrl = validation[0];

                                        validator = ctrl.$validators[validators[i]];

                                        if (validator.message) {
                                            validations.push({
                                                message : validator.message,
                                                isError : validator.isError
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    };
                }
            }
        };
    }
]);

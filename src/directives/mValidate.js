'use strict';


angular.module('easyModel.directives', []).
    directive('mValidate', ['mValidateInfo', function(validateInfo) {
       return {
          restrict: "A",
          require: '^ngModel',
          controller: ['$scope', '$element', '$attrs', '$parse', function($scope, $element, $attr, $parse) {

          }],
          compile: function compile(element, attrs){
              var domEl = element[0],
                  nodeName = domEl.nodeName,
                  isInput = nodeName == 'INPUT' || nodeName == 'SELECT' || nodeName == 'TEXTAREA';

              return {
                  pre: function preLink(scope, element, attrs, ngModelCtrl) {
                      var parentForm = element.inheritedData('$formController'),
                          warningCount = 0,
                          $warning;

                      $warning = ngModelCtrl.$warning = {};

                      ngModelCtrl.$setWarning = setWarning;
                      ngModelCtrl.$hasWarns = false;
                      ngModelCtrl.$validators = {};

                      function setWarning(validationWarningrKey, isValid) {
                          // Purposeful use of ! here to cast isValid to boolean in case it is undefined
                          // jshint -W018
                          if ($warning[validationWarningrKey] === !isValid) return;
                          // jshint +W018

                          if (isValid) {
                              if ($warning[validationWarningrKey]) warningCount--;
                              if (!warningCount) {
                                  //toggleValidCss(true);
                                  this.$hasWarns = false;
                              }
                          } else {
                              //toggleValidCss(false);
                              this.$hasWarns = true;
                              warningCount++;
                          }

                          $warning[validationWarningrKey] = !isValid;
                          //toggleValidCss(isValid, validationErrorKey);

                          parentForm.$setWarning(validationWarningrKey, isValid, this);
                      }
                  },
                  post: function postLink(scope, element, attrs, ngModelCtrl) {
                      //Get validation context for bound element and model property
                      var info = validateInfo.create(
                              scope,
                              attrs.ngModel,
                              attrs.mValidate
                          ),
                          record = info.getRecord();

                      if(isInput) {
                          linkForInput();
                      }

                      function valErrsChanged(newValue) {
                          var validations = newValue ? newValue : null;

                          if(Array.isArray(validations)) {
                              validations.forEach(function(v){
                                  if(v.isError) {
                                      ngModelCtrl.$setValidity(v.type, v.isValid);
                                  }else {
                                      ngModelCtrl.$setWarning(v.type, v.isValid);
                                  }

                                  ngModelCtrl.$validators[v.type] = v;
                              })
                          }
                      }


                      record.validationChangeListeners.push(function(validations){
                          valErrsChanged(validations);
                          if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                              scope.$apply();
                          }
                      });


                      function linkForInput() {
                          ngModelCtrl.$viewChangeListeners.push(function(){
                              valErrsChanged(info.getValErrs());
                          });
                      }
                  }
              }

          }
      }
    }]).
    service('mValidateInfo', function() {
        function Info(scope, modelPath, validationPath) {

            if (!modelPath && !validationPath) {
                return;
            }

            this.scope = scope;

            setEntityAndPropertyPaths(this, modelPath, validationPath);
            // this.entityPath
            // this.propertyPath

            this.getRecord = this.entityPath ? getRecordFromEntityPath(this) : getRecord(this);

            this.getValErrs = function () {
                var record = this.getRecord();

                if (record) {
                    return record.getValidation(this.propertyPath,true);
                }

                return null;
            }.bind(this);

            Info.prototype.constructor = Info;
        }

        function getRecord(info) {
            return function () {
                return info.scope.record;
            }
        }

        function getRecordFromEntityPath(info) {
            return function () {
                try {
                    return info.scope.$eval(info.entityPath)['_record'];
                }
                catch (_) {
                    return undefined;
                }
            }
        }

        function setEntityAndPropertyPaths(info, modelPath, validationPath) {

            // examples:
            //   'productId'               // property only
            //   'vm.order.delivery'       // entity path and property
            //   'vm.order["delivery"]'    // entity path and indexed property
            if (modelPath) {
                parsePath(modelPath);
            }
            // validationPath can override either entity or property path;
            // examples:
            //   'productId'               // property only
            //   'vm.order.delivery'       // entity path and property
            //   'vm.order["delivery"]'    // entity path and indexed property
            //
            // optional ','  syntax as {entity, property} path separator
            // so can separate entity path from a complex property path
            // examples:
            //   'vm.order,address.street' // entity w/ complex prop
            //   'vm.order,address[street]' // entity w/ complex indexed prop
            if (validationPath) {
                // Look for ',' syntax
                var paths = validationPath.split(',');
                var pPath = paths.pop(); // after ','
                var ePath = paths.pop(); // before ','
                if (ePath) {
                    info.entityPath = ePath.trim();
                }

                if (info.entityPath) {
                    info.propertyPath = pPath;
                } else {
                    // Didn't use ',' syntax and didn't specify entityPath in model.
                    // Therefore entire path spec must be in pPath; parse it.
                    parsePath(pPath);
                }
            }

            function parsePath(path) {
                if (path[path.length - 1] === ']') {
                    parseIndexedPaths(path);
                } else {
                    parseDottedPath(path);
                }
            }

            function parseDottedPath(path) {
                // ex: 'vm.order.delivery'
                // propertyPath should be 'delivery'
                // entityPath should be 'vm.order'
                paths = path.split('.');
                info.propertyPath = paths.pop(); // property is after last '.'
                info.entityPath = paths.join('.'); // path to entity is before last '.'
            }

            // extract paths from strings using square-bracket notation, e.g. 'vm.order[delivery]'
            function parseIndexedPaths(path) {
                var opensb = path.lastIndexOf('[');
                info.entityPath = path.substring(0, opensb);  // path to entity is before last [
                var propertyPath = path.substring(opensb + 1, path.length - 1); // property is between [ ]
                // eval it, in case it's an angular expression
                try {
                    var evalPath = info.scope.$eval(propertyPath);
                }
                catch (_) {
                }
                info.propertyPath = evalPath ? evalPath : propertyPath;
            }
        }

        return {
            create: function (scope, modelPath, validationPath) {
                return new Info(scope, modelPath, validationPath);
            }
        }
    }).directive('mForm', ['$animate',
        function ($animate) {
            return {
                restrict: 'A',
                require: 'form',
                link: {
                    pre: function preLink(scope, element, attrs, formCtrl) {
                        var warningCount = 0;
                        var warnings = formCtrl.$warning = {};
                        formCtrl.$hasWarns = false;

                        var WARN_CLASS = 'ng-warn';

                        function toggleWarnCss(isValid, warnKey) {
                            warnKey = warnKey ? '-' + snake_case(warnKey, '-') : '';

                            if (isValid) {
                                $animate.removeClass(element, WARN_CLASS + warnKey);
                            } else {
                                $animate.addClass(element, WARN_CLASS + warnKey);
                            }
                        }

                        var SNAKE_CASE_REGEXP = /[A-Z]/g;

                        function snake_case(name, separator) {
                            separator = separator || '_';

                            return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
                                return (pos ? separator : '') + letter.toLowerCase();
                            });
                        }

                        function indexOf(array, obj) {
                            if (array.indexOf) return array.indexOf(obj);

                            for (var i = 0; i < array.length; i++) {
                                if (obj === array[i]) return i;
                            }

                            return -1;
                        }

                        function arrayRemove(array, value) {
                            var index = indexOf(array, value);

                            if (index >= 0) {
                                array.splice(index, 1);
                            }

                            return value;
                        }

                        function includes(array, obj) {
                            return indexOf(array, obj) != -1;
                        }

                        function triggerParent(warnToken, isValid, control) {
                            var exFormCtrl = element.parent().controller('mForm');

                            if (exFormCtrl) {
                                exFormCtrl.$setWarning(warnToken, isValid, control);
                            }
                        }

                        var currentCtrl = element.controller('mForm');

                        currentCtrl.$setWarning = formCtrl.$setWarning = function (warnToken, isValid, control) {
                            var queue = warnings[warnToken];

                            if (isValid) {
                                if (queue) {
                                    arrayRemove(queue, control);

                                    if (!queue.length) {
                                        warningCount--;

                                        if (!warningCount) {
                                            toggleWarnCss(isValid);
                                            formCtrl.$hasWarns = false;
                                        }

                                        warnings[warnToken] = false;
                                        toggleWarnCss(true, warnToken);

                                        triggerParent(warnToken, true, formCtrl);
                                    }
                                }
                            } else {
                                if (!warningCount) {
                                    toggleWarnCss(isValid);
                                }

                                if (queue) {
                                    if (includes(queue, control)) return;
                                } else {
                                    warnings[warnToken] = queue = [];
                                    warningCount++;
                                    toggleWarnCss(false, warnToken);

                                    triggerParent(warnToken, false, formCtrl);
                                }

                                queue.push(control);

                                formCtrl.$hasWarns = true;
                            }
                        };

                        element.on('$destroy', function() {
                            for (var warnToken in warnings) {
                                triggerParent(warnToken, true, formCtrl);
                            }
                        });
                    },
                    post: function postLink(scope, element, attrs, formCtrl) {}
                },
                controller: [function () { }]
            };
        }])
    .directive('tgBindHtml', ['$parse', '$compile', '$sce',
        function ($parse, $compile, $sce) {
            'use strict';

            return {
                restrict: 'A',
                scope: false,
                link: function (scope, element, attrs) {
                    element.addClass('ng-binding').data('$binding', attrs.tgBindHtml);

                    var parsed = $parse(attrs.tgBindHtml);
                    var isCompile = (attrs.tgBindHtmlCompile) ? $parse(attrs.tgBindHtmlCompile) : function () { return false; };

                    function getStringValue() { return (parsed(scope) || '').toString(); }

                    scope.$watch(getStringValue, function ngBindHtmlWatchAction(value) {
                        var html = '';

                        if (isCompile(scope) === true) {
                            html = $compile(value)(scope);
                        } else {
                            html = $sce.getTrustedHtml(value) || '';
                        }

                        element.html(html);
                    });
                }
            };
        }
    ])
    .directive('mValidationMessage', [
        function () {
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
                    //var validation = $parse(expr)(this, locals);

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
                            validators = attrs.mValidationMessage;

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

                        if(validators) {
                            validators = scope.$eval(validators);

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
    ])
    .filter('tgTrustedHtml', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);




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

                      function setWarning(validationWarningKey, isValid) {
                          // Purposeful use of ! here to cast isValid to boolean in case it is undefined
                          // jshint -W018
                          if ($warning[validationWarningKey] === !isValid) return;
                          // jshint +W018

                          if (isValid) {
                              if ($warning[validationWarningKey]) warningCount--;
                              if (!warningCount) {
                                  //toggleValidCss(true);
                                  this.$hasWarns = false;
                              }
                          } else {
                              //toggleValidCss(false);
                              this.$hasWarns = true;
                              warningCount++;
                          }

                          $warning[validationWarningKey] = !isValid;
                          //toggleValidCss(isValid, validationErrorKey);

                          parentForm.$setWarning(validationWarningKey, isValid, this);
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
                    return record.getValidationByField(this.propertyPath,true);
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
    })
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
    .filter('tgTrustedHtml', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
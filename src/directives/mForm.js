angular.module('easyModel.directives').directive('mForm', ['$animate',
    function ($animate) {
        return {
            restrict: 'A',
            require: 'form',
            link: {
                pre: function preLink(scope, element, attrs, formCtrl) {

                    formCtrl.$warning = {};
                    formCtrl.$hasWarns = false;

                    var currentCtrl = element.controller('form'),
                        warningCount = 0,
                        warnings = formCtrl.$warning,
                        WARN_CLASS = 'ng-warn',
                        SNAKE_CASE_REGEXP = /[A-Z]/g;


                    function toggleWarnCss(isValid, warnKey) {
                        warnKey = warnKey ? '-' + snakeCase(warnKey, '-') : '';

                        if (isValid) {
                            $animate.removeClass(element, WARN_CLASS + warnKey);
                        } else {
                            $animate.addClass(element, WARN_CLASS + warnKey);
                        }
                    }

                    function snakeCase(name, separator) {
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

                    function setWarning(warnToken, isValid, control) {
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

                    currentCtrl.$setWarning = formCtrl.$setWarning = setWarning;

                    element.on('$destroy', function() {
                        for (var warnToken in warnings) {
                            triggerParent(warnToken, true, formCtrl);
                        }
                    });
                },
                post: function postLink(scope, element, attrs, formCtrl) {}
            }
        };
    }]);

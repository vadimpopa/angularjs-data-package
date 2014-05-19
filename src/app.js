'use strict';


// Declare app level module which depends on filters, and services
angular.module('easyModel', [
  'ngRoute',
  'easyModel.data',
  'easyModel.directives',
  'easyModel.demoController',
  'easyModel.models'
]).
config(['$routeProvider', '$provide', function($routeProvider, $provide) {
  $routeProvider.when('/', {templateUrl: 'tmpl/main.html', controller: 'DemoController as demoCtrl'});
  //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

angular.module('easyModel.models',[]);

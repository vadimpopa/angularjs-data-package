'use strict';

/**
 * @licence ActiveRecord for AngularJS
 * (c) 2013-2014 Bob Fanger, Jeremy Ashkenas, DocumentCloud
 * License: MIT
 */

angular.module('easyModel.demoController', []).
    factory('Task', function (ActiveRecord) {

        return ActiveRecord.extend({

            // Rest API configuration for retrieving and saving tasks.
            $urlRoot: '/api/tasks',

            // Optional defaults
            $defaults: {
                title: 'Untitled',
                estimate: ''
            },

            // optional named constructor (Shows "Task" as the type in a console.log)
            $constructor: function Task(properties) {
                this.$initialize.apply(this, arguments)
            },

            // An example method for task instances
            /**
             * Return the estimate in hours
             * @return {Number}
             */
            estimateInHours: function () {
                var value = parseFloat(this.estimate);
                if (isNaN(value)) {
                    return 0.0;
                }
                return value / 3600;
            }
        })}).
  controller('DemoController', ['$document', '$scope', 'modelLibrary', 'modelReader','Task', function($document, $scope, Library, Reader, Task) {
    $scope.models = {
      book: null
    }

    $scope.models.book = new Reader({
        id   : 'ABCD12346',
        age  : 17,
        phone: '666-555-5555',
        name: "Linda",
        address: {
            city: 'London',
            street: 'Backers'
        }
    })

    $scope.models.library = new Library({
        name: 'Oxford',
        booksCount: 6,
        address: {
            city: 'London',
            street: 'Backers'
        },
        readers: [{
            id   : 'ABCD12345',
            age  : 24,
            phone: '555-555-5555',
            name: "Mike",
            address: {
                city: "Down Oxford",
                street: "Backers",
                house: "24"
            }
        },{
            id   : 'ABCD12346',
            age  : 17,
            phone: '666-555-5555',
            name: "Paul",
            address: {
                city: "Up Oxford",
                street: "Backers",
                house: "24"
            }
        }]
    });

        $scope.onMakeStreetRequired = function() {
            $scope.models.book.address.street = "";

            $scope.models.book._record.getValidationByField("address");
        }

        $scope.onGetLibraryValidation = function() {
            console.log($scope.models.library._record.getValidation());
        }

        $scope.onGetBookValidation = function(){
            console.log($scope.models.book._record.getValidation(true));
        }
  }]);

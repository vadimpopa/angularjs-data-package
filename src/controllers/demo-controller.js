'use strict';

/* Controllers */

angular.module('easyModel.demoController', []).
  controller('DemoController', ['$document', '$scope', 'modelLibrary', 'modelReader', function($document, $scope, Library, Reader) {
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

(function() {
'use strict';

angular
    .module('gridjs-test.utils', [])
    .factory('transclude', function() {
        return transclude;
    })
    .directive('readWidth', ['$parse', readWidthDirective]);

function transclude(options) {
    return {
        templateUrl: options.templateUrl,
        transclude: true,
        scope: true,
        link: function(scope, elem, attrs) {
            options.attributes.forEach(function(attribute) {
                scope[attribute] = attrs[attribute];
                attrs.$observe(attrs[attribute], function(attribute) {
                    scope[attribute] = attribute;
                });
            });
        }
    }; 
}

function readWidthDirective($parse) {
    return {
        link: function(scope, element, attributes) {
            var prop = $parse(attributes.readWidthTo);

            var reader = function() {
                var width = element[0].clientWidth;

                if (attributes.readWidthTo) {
                    prop.assign(scope, width);
                }

                if (attributes.readWidthCallback) {
                    scope.$eval(attributes.readWidthCallback);
                }

                return width;
            };

            // When called after linking function is done
            // we will be outside digest phase, so manually force apply.
            var scopedReader = function() {
                scope.$apply(reader);
            };

            if (attributes.saveWidthReaderTo) {
                // Let the others read width whenever they want
                // - attach reading function to scope.
                $parse(attributes.saveWidthReaderTo)
                    // .assign(scope, scopedReader);
                    .assign(scope, reader);
            }

            // Initial read.
            if (attributes.readWidthTo) reader();
        }
    };
}

}());

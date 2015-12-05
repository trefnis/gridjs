(function() {
'use strict';

angular
    .module('gridjs-test.utils', [])
    .factory('transclude', function() {
        return transclude;
    })

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

}());

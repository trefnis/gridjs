(function() {
'use strict';

angular
    .module('gridjs-test', [
        'ui.bootstrap',

        'gridjs-test.config',
        'gridjs-test.routing',

        'gridjs-test.main-menu',
        'gridjs-test.editor',
        // 'gridjs-test.comparer',
    ])
    .run(['$rootScope', '$state', function($rootScope, $state) {
        $rootScope.val = 0;
        $rootScope.increment = function(step) {
            $rootScope.val = $rootScope.val + step;
        }
        $rootScope.decrement = function(step) {
            $rootScope.val = $rootScope.val - step;
        };
        $state.go('editor');
    }]);

}());
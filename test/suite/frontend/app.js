(function() {
'use strict';

angular
    .module('gridjs-test', [
        'ui.bootstrap',

        'gridjs-test.config',
        'gridjs-test.routing',

        'gridjs-test.navigation',
        
        'gridjs-test.main-menu',
        'gridjs-test.elements-editor',
        'gridjs-test.layout',
        'gridjs-test.layout-editor',
        'gridjs-test.comparison',
    ])
    .run(['$state', function($state) {
        $state.go('elementsEditor');
    }]);

}());
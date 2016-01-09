(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor', [
        'gridjs-test.utils',
        'gridjs-test.dataset',
    ])
    .directive('scopePass', function() {
        return {
            scope: {
                scopePass: '='
            },
            template: '<input ng-model="scopePass.one"></input>'
        };
    })
    .directive('elementsEditorLabelledInput', ['transclude', 
        function(transclude) {
        return transclude({
            templateUrl: 'elements-editor/labelled-input.html',
            attributes: ['label', 'classes']
        });
    }]);

}());
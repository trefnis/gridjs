(function() {
'use strict';

angular
    .module('gridjs-test.editor', [
        'gridjs-test.utils',
        'gridjs-test.dataset',
        'gridjs-test.grid-pattern',
    ])
    .directive('editorLabelledInput', ['transclude', 
        function(transclude) {
        return transclude({
            templateUrl: 'editor/labelled-input.html',
            attributes: ['label', 'classes']
        });
    }]);

}());
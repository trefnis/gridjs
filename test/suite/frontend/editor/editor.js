(function() {
'use strict';

angular
    .module('gridjs-test.editor', [
        'gridjs-test.utils',
        'gridjs-test.dataset',
    ])
    .directive('editorLabelledInput', ['transclude', 
        function(transclude) {
        return transclude({
            templateUrl: 'editor/labelled-input.html',
            attributes: ['label', 'classes']
        });
    }]);

}());
(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor', [
        'gridjs-test.utils',
        'gridjs-test.dataset',
    ])
    .directive('elementsEditorLabelledInput', ['transclude', 
        function(transclude) {
        return transclude({
            templateUrl: 'elements-editor/labelled-input.html',
            attributes: ['label', 'classes']
        });
    }]);

}());
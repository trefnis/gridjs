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
    }])
    .directive('elementsEditorMenu', function() {
        return {
            templateUrl: 'elements-editor/menu.html'
        };
    })
    .directive('elementsEditorPreview', function() {
        return {
            templateUrl: 'elements-editor/preview.html'
        };
    });

}());
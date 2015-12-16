(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .directive('elementsEditorPreview', elementsEditorPreviewDirective)
    .controller('ElementsEditorPreviewController', [
        ElementsEditorPreviewController
    ]);

function elementsEditorPreviewDirective() {
    return {
        require: '^elements-editor-menu',
        link: function(scope, element, attr, elementsEditorController) {
            debugger;
        }
    };
}

function ElementsEditorPreviewController($scope, $rootScope, datasetManager,
 availableUnits) {
}

}());
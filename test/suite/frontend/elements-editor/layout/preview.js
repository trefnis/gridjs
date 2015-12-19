(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .directive('elementsEditorPreview', elementsEditorPreviewDirective)
    .controller('ElementsEditorPreviewController', [
        '$scope',
        '$timeout',
        '$window',
        'ElementsLayout',
        ElementsEditorPreviewController
    ]);

function elementsEditorPreviewDirective() {
    return {
        templateUrl: 'elements-editor/layout/preview.html',
        scope: {
            selectElement: '=',
            elements: '=',
            selectedElementIndex: '=',
            sortBy: '=',
            reverse: '=',
            gridContainerWidth: '=',
            units: '=',
            display: '=',
        },
        link: function(scope, element, attributes, controller) {
            controller.init(scope);
        },
        controller: 'ElementsEditorPreviewController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function ElementsEditorPreviewController($scope, $timeout, $window, ElementsLayout) {
    this.actualContainerWidth = null;
    this.readWidth = null;

    this.init = this.init.bind(this, ElementsLayout);
}

ElementsEditorPreviewController.prototype.init = function(ElementsLayout, scope) {
    this.layout = new ElementsLayout({
        units: this.units,
        shouldScaleDown: true,
        getDesiredWidth: function() { return this.gridContainerWidth; }.bind(this),
        getActualWidth: this.readWidth,
    }, scope);

    scope.$on('$destroy', function() {
        if (this.layout) {
            this.layout.clear();
        }
    });
};

ElementsEditorPreviewController.prototype.getElementClass = function(element) {
    return {
        'element--floating': this.display === 'float', 
        'element--selected': element.index === this.selectedElementIndex 
    };
};

}());
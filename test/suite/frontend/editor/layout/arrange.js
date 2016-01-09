(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .directive('elementsEditorArrange', elementsEditorArrangeDirective)
    .controller('elementsEditorArrangeController', [
        '$scope',
        '$timeout',
        '$window',
        'ElementsLayout',
        elementsEditorArrangeController
    ]);

function elementsEditorArrangeDirective() {
    return {
        templateUrl: 'elements-editor/layout/preview.html',
        scope: {
            elements: '=',
            selectElement: '=',
            selectedElementIndex: '=',
            units: '=',
            display: '=',
            availableDisplays: '=',
            sortBy: '=',
            sortOrder: '=',
            availableSortOrders: '=',
            elementSortableProperties: '=',
            reverse: '=',
            sortGlyphicons: '=',
            gridContainerWidth: '=',
            shouldScaleDown: '=',
            zoom: '=',
        },
        link: function(scope, element, attributes, controller) {
            controller.init(scope);
        },
        controller: 'elementsEditorArrangeController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function elementsEditorArrangeController($scope, $timeout, $window, ElementsLayout) {
    this.actualContainerWidth = null;
    this.readWidth = null;

    this.gridContainerWidth = 700;
    this.shouldScaleDown = false;
    this.zoom = 1;

    this.init = this.init.bind(this, ElementsLayout);
}

ElementsEditorPreviewController.prototype.init = function(ElementsLayout, scope) {
    this.layout = new ElementsLayout({
        units: this.units,
        shouldScaleDown: true,
        getDesiredWidth: function() { return this.gridContainerWidth; }.bind(this),
        getActualWidth: this.readWidth,
        getElementClass: this.getElementClass.bind(this)
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

var orderReverseMap = {
    'asc': false,
    'desc': true
};

ElementsEditorPreviewController.prototype.sortOrder = function(order) {
    if (arguments.length) {
        if (order === 'reset') {
            order = 'asc';
            this.sortBy = 'index';
        }

        this._sortOrder = order;
        if (order in orderReverseMap) {
            this.reverse = orderReverseMap[order];
        } else {
            throw new Error('Invalid sort order: ' + order);
        }
    } else {
        return this._sortOrder;
    }
};

}());
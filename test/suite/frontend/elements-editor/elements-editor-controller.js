(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .controller('ElementsEditorController', [
        '$scope',
        '$rootScope',
        'datasetManager', 
        'availableUnits',
        ElementsEditorController
    ]);

function ElementsEditorController($scope, $rootScope, datasetManager,
 availableUnits) {
    this.units = availableUnits;
    this.availableUnits = availableUnits.toArray();

    this.availableDisplays = ['float', 'block'];    
    this.availableSortOrders = ['asc', 'desc', 'reset'];
    this.elementSortableProperties = [
        { label: 'index', prop: 'index' },
        { label: 'width', prop: 'element.width' },
        { label: 'height', prop: 'element.height' }
    ];
    this.sortGlyphicons = {
        'asc': 'glyphicon-sort-by-attributes',
        'desc': 'glyphicon-sort-by-attributes-alt',
        'reset': 'glyphicon-remove' 
    };

    this.init(datasetManager.currentSet);

    $rootScope.$on('newCurrentSet', function(event, newCurrentSet) {
        this.init(newCurrentSet);
    }.bind(this));

    // $scope.$watch(function() {
    //     return this.dataset.units.width;
    // }.bind(this), function(newVal) {
    //     if (newVal === this.units.percent) {
    //         this.gridContainerWidth = 100;
    //     }
    // }.bind(this));

    var stepsForUnits = {};
    stepsForUnits[availableUnits.px] = 200;
    stepsForUnits[availableUnits.percent] = 10;

    this.getStep = function(units) {
        return stepsForUnits[units];
    };

    this.recalculateWidth = this.recalculateHeight = function() {
        console.log('not implemented yet');
    };

    this.selectElement = this.selectElement.bind(this);
}

ElementsEditorController.prototype.init = function(dataset) {
    this.dataset = dataset;

    this.reverse = false;

    this.gridContainerWidth = 700;
    this.actualContainerWidth = null;
    this.readActualContainerWidth = null;
    this.shouldScaleDown = false;
    this.zoom = 1;

    // this.recalculateSizes = true;

    this.display = this.availableDisplays[0];    
    this.sortBy = this.elementSortableProperties[0].prop;
    this._sortOrder = null;
    this.sortOrder(this.availableSortOrders[0]);

    this.selectedElement = null;
    this.newElement = this.dataset.createDefaultElement();
    this.initElements();
};

ElementsEditorController.prototype.initElements = function() {
    this.elements = this.dataset.elements.map(function(el, index) {
        return {
            index: index,
            element: el
        };
    });
};

ElementsEditorController.prototype.selectElement = function(element, $event) {
    $event.stopPropagation();
    this.selectedElement = element;
};

ElementsEditorController.prototype.selectedElementIndex = function(newIndex) {
    if (arguments.length) {
        this.setSelectedElementIndex(newIndex);
        this.selectedElement.index = newIndex;
    } else {
        return this.getSelectedElementIndex();
    }
};

ElementsEditorController.prototype.getSelectedElementIndex = function() {
    return this.selectedElement ? this.selectedElement.index : null;
};

ElementsEditorController.prototype.setSelectedElementIndex = function(newIndex) {
    if (!this.selectElement || newIndex === undefined || newIndex === null) {
        return;
    }

    this.dataset.rearrangeElement(this.selectedElement.index, newIndex);
    this.initElements();
};

ElementsEditorController.prototype.addNewElement = function(element) {
    this.dataset.elements.push(element);
    this.initElements();
    this.newElement = this.dataset.createDefaultElement();
};

ElementsEditorController.prototype.removeElement = function(element) {
    this.selectedElement = null;
    this.dataset.elements.splice(element.index, 1);
    this.initElements();
};

ElementsEditorController.prototype.cloneElement = function(element) {
    var newElement = angular.copy(element.element);
    this.dataset.elements.push(newElement);
    this.initElements();
};

var orderReverseMap = {
    'asc': false,
    'desc': true
};

ElementsEditorController.prototype.sortOrder = function(order) {
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
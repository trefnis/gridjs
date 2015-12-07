(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .controller('ElementsEditorController', [
        '$scope', 
        'datasetManager', 
        'availableUnits',
        ElementsEditorController
    ]);

function ElementsEditorController($scope, datasetManager, availableUnits) {
    this.dataset = datasetManager.currentSet;

    this.gridContainerWidth = 800;
    this.actualContainerWidth = null;
    this.readActualContainerWidth = null;
    this.shouldScaleDown = false;
    this.zoom = 1;

    this.units = availableUnits;
    this.availableUnits = availableUnits.toArray();
    this.recalculateSizes = true;

    this.availableDisplays = ['float', 'block'];
    this.display = this.availableDisplays[0];
    
    this.sortBy = this.dataset.elementSortableProperties[0];
    this.availableSortOrders = ['asc', 'desc', 'reset'];
    this.sortOrder = this.availableSortOrders[0];
    this.sortGlyphicons = {
        'asc': 'glyphicon-sort-by-attributes',
        'desc': 'glyphicon-sort-by-attributes-alt',
        'reset': 'glyphicon-remove' 
    };

    this.newElement = this.dataset.createDefaultElement();
    this.selectedElement = null;
    this.selectedElementIndexWatch = angular.noop;

    $scope.$watch(function() {
        return this.dataset.units.width;
    }.bind(this), function(newVal) {
        if (newVal === this.units.percent) {
            this.gridContainerWidth = 100;
        }
    }.bind(this));

    var stepsForUnits = {};
    stepsForUnits[availableUnits.px] = 200;
    stepsForUnits[availableUnits.percent] = 10;

    this.getStep = function(units) {
        return stepsForUnits[units];
    };

    this.recalculateWidth = this.recalculateHeight = function() {
        console.log('not implemented yet');
    };

    this.addNewElement = function(element) {
        this.dataset.elements.push(element);
        this.newElement = this.dataset.createDefaultElement();
    }.bind(this);

    this.removeElement = function(element) {
        this.selectedElementIndexWatch();
        this.selectedElement = null;

        _.remove(this.dataset.elements, element);
        this.dataset.updateElementsIndexes();
    }.bind(this);

    this.cloneElement = function(element) {
        var newElement = angular.copy(element);
        newElement.index = this.dataset.elements.length;
        this.dataset.elements.push(newElement);
    }.bind(this);
    
    this.selectElement = function(element, $event) {
        $event.stopPropagation();
        this.selectedElementIndexWatch(); // Clear previous watch.

        this.selectedElement = element;

        // Adjust other indexes on change.
        if (element) {
            this.selectedElementIndexWatch = $scope.$watch(function() {
                return this.selectedElement.index;
            }.bind(this), function(newIndex, oldIndex) {
                var isIncrementing = newIndex > oldIndex;
                var insertAt = isIncrementing ? newIndex + 1 : newIndex;
                var deleteAt = isIncrementing ? oldIndex : oldIndex + 1;

                var elements = this.dataset.elements;
                elements.splice(insertAt, 0, this.selectedElement);
                elements.splice(deleteAt, 1);
                this.dataset.updateElementsIndexes();
            }.bind(this));
        }
    }.bind(this);

    this.sortElements = function(order) {
        if (order === 'reset') {
            this.sortBy = this.dataset.elementSortableProperties[0];
            this.sortOrder = order = 'asc';
        }

        this.dataset.sortElements(this.sortBy, order);
    }.bind(this);

    this.getElementCssSize = function(element) {
        var width = Math.floor(element.width * this.zoom);
        var height = Math.floor(element.height * this.zoom);

        return {
            width: width + this.dataset.units.width,
            height: height + this.dataset.units.height
        };
    }.bind(this);

    this.calculateContainerRatio = function() {
        this.zoom = this._shouldScaleDown()
            ? this.actualContainerWidth / this.gridContainerWidth
            : 1;
    }.bind(this);

    this.getContainerCssSize = function() {
        console.log(this._shouldScaleDown());
        return this._shouldScaleDown()
            ? { width: 100 + this.units.percent }
            : { 
                width: this.gridContainerWidth * this.zoom
                 + this.dataset.units.width
            };
    }.bind(this);

    this._shouldScaleDown = function() {
        return this.shouldScaleDown
            && this.actualContainerWidth < this.gridContainerWidth;
    }.bind(this)
}

}());
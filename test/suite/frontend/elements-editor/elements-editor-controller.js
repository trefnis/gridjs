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

    // Let the editor directive fill all props.
    this.editor = {};
    this.init(datasetManager);
    
    $rootScope.$on('newCurrentSet', function(event, newCurrentSet) {
        this.init(datasetManager);
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

ElementsEditorController.prototype.init = function(datasetManager) {
    this.dataset = datasetManager.currentSet;

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

}());
(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .controller('EditorController', [
        '$scope',
        '$timeout',
        '$rootScope',
        'datasetManager', 
        'availableUnits',
        EditorController
    ]);

function EditorController($scope, $timeout, $rootScope, datasetManager,
 availableUnits) {
    this.units = availableUnits;
    this.availableUnits = availableUnits.toArray();

    // Let the preview & arrange directives fill all its props.
    this.preview = {};
    this.arrange = {};

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
    this.resetNewElement = this.resetNewElement.bind(this);
    this.arrangeItem = this.arrangeItem.bind(this, $scope);
    // this.arrangeItem = this.arrangeItem.bind(this, $timeout);
}

EditorController.prototype.init = function(datasetManager) {
    this.dataset = datasetManager.currentSet;

    this.selectedElement = null;
    this.newElement = this.dataset.createDefaultElement();
    this.initElements();
};

EditorController.prototype.initElements = function() {
    this.elements = this.dataset.elements.map(function(element, index) {
        element.index = index;
        return element;
    });

    this.arrangedElements = _.filter(this.elements, { isArranged: true });
    this.notArrangedElements = _.filter(this.elements, { isArranged: false });
};

EditorController.prototype.selectElement = function(element, $event) {
    $event.stopPropagation();
    this.selectedElement = element;
};

EditorController.prototype.selectedElementIndex = function(newIndex) {
    if (arguments.length) {
        this.setSelectedElementIndex(newIndex);
        this.selectedElement.index = newIndex;
    } else {
        return this.getSelectedElementIndex();
    }
};

EditorController.prototype.getSelectedElementIndex = function() {
    return this.selectedElement ? this.selectedElement.index : null;
};

EditorController.prototype.setSelectedElementIndex = function(newIndex) {
    if (!this.selectElement || newIndex === undefined || newIndex === null) {
        return;
    }

    this.dataset.rearrangeElement(this.selectedElement.index, newIndex);
    this.initElements();
};

EditorController.prototype.addNewElement = function(element) {
    this.dataset.elements.push(element);
    this.initElements();
    this.newElement = this.dataset.createDefaultElement();
};

EditorController.prototype.resetNewElement = function() {
    this.newElement = this.dataset.createDefaultElement();
};

EditorController.prototype.removeElement = function(element) {
    this.selectedElement = null;
    this.dataset.elements.splice(element.index, 1);
    this.initElements();
};

EditorController.prototype.cloneElement = function(element) {
    var newElement = angular.copy(element);
    this.dataset.elements.push(newElement);
    this.initElements();
};

EditorController.prototype.arrangeItem = function($scope, element) {
// EditorController.prototype.arrangeItem = function($timeout, element) {
    element.isArranged = true;
    this.initElements();
    this.arrange.adjustItems(this.arrangedElements);
    // $scope.$evalAsync(this.arrange.adjustItems.bind(this.arrange));
    // $scope.$applyAsync(this.arrange.adjustItems.bind(this.arrange));
    // $timeout(this.arrange.adjustItems.bind(this.arrange));
};

EditorController.prototype.editItem = function(element) {
    element.isArranged = false;
    this.arrange.removeItem(element);
    this.initElements();
};

}());
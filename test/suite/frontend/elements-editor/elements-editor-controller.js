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

    this.availableUnits = availableUnits.toArray();
    this.availableDisplays = ['float', 'block'];
    
    this.sortBy = this.dataset.elementSortableProperties[0];
    this.availableSortOrders = ['asc', 'desc', 'reset'];
    this.sortOrder = this.availableSortOrders[0];
    this.sortGlyphicons = {
        'asc': 'glyphicon-sort-by-attributes',
        'desc': 'glyphicon-sort-by-attributes-alt',
        'reset': 'glyphicon-remove' 
    };

    this.display = this.availableDisplays[0];
    this.recalculateSizes = true;

    this.newElement = this.dataset.createDefaultElement();
    this.selectedElement = null;

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
        this.currentSet.elements.push(element);
    }.bind(this);

    this.removeElement = function(element) {
        _.remove(this.currentSet.elements, element);
    }.bind(this);
    
}

}());
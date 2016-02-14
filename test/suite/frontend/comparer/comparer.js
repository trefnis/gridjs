(function() {
'use strict';

angular
    .module('gridjs-test.comparer', ['gridjs-test.algorithm-adapter'])
    .controller('ComparerController', [
        'datasetManager',
        '$rootScope',
        'gridPattern', 
        'ElementsLayout',
        'AlgorithmAdapter',
        ComparerController
    ]);

function ComparerController(datasetManager, $rootScope, gridPattern, ElementsLayout, AlgorithmAdapter) {
    this.dataset = datasetManager.currentSet;
    this.dataset.goToOldestHistoryEntry();

    this.gridPattern = gridPattern;
    this.layout = new ElementsLayout();

    // Default value.
    this.desiredWidth = this.dataset.columnWidth * 3;

    $rootScope.$on('newCurrentSet', function(event, newCurrentSet) {
        this.dataset = newCurrentSet;
        // this.dataset.goToOldestHistoryEntry();
        this.dataset.goToMostRecent();
        this.adjustZoom();
        this.initElements();

        this.algorithmAdapter = new AlgorithmAdapter(this.dataset.elements);
        this.algorithmAdapter.arrange();
    }.bind(this));

    this.initElements();
}

ComparerController.prototype.initElements = function() {
    this.elementsByHand = _.filter(this.dataset.elements, { isArranged: true });
};

ComparerController.prototype.adjustZoom = function() {
    var zoom = this.readWidthArrangedByHand() / this.desiredWidth;
    this.zoom = zoom < 1 ? zoom : 1;
};

ComparerController.prototype.getElementsContainerCss = function(elements) {
    var sizing = this.layout.getContainerCss({
        zoom: this.zoom,
        width: this.desiredWidth,
        shouldScaleDown: true,
        elements: elements,
        units: this.dataset.units,
    });

    var gridCss = this.gridPattern.getGridCss(
        this.dataset.columnWidth * this.zoom, 
        this.dataset.rowHeight * this.zoom);

    return _.merge(gridCss, sizing);
};

ComparerController.prototype.getElementCss = function(element) {
    return this.layout.getElementCss(element, this.zoom, this.dataset.units);
};

ComparerController.prototype.goBackInHistory = function() {
    this.dataset.popHistoryEntry();
    this.algorithmAdapter.stepBack();
    this.initElements();
};

ComparerController.prototype.goForwardInHistory = function() {
    this.dataset.goForwardInHistory();
    this.algorithmAdapter.stepForward();
    this.initElements();
};

ComparerController.prototype.goToMostRecent = function() {
    this.dataset.goToMostRecent();
    this.algorithmAdapter.arrange();
    this.initElements();
};

ComparerController.prototype.goToOldestHistoryEntry = function() {
    this.dataset.goToOldestHistoryEntry();
    this.algorithmAdapter.reset();
    this.initElements();
};

}());
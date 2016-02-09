(function() {
'use strict';

angular
    .module('gridjs-test.comparer', [])
    .controller('ComparerController', [
        'datasetManager',
        '$rootScope',
        'gridPattern', 
        'ElementsLayout', 
        ComparerController
    ]);

function ComparerController(datasetManager, $rootScope, gridPattern, ElementsLayout) {
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

ComparerController.prototype.getElementsByHandContainerCss = function() {
    var sizing = this.layout.getContainerCss({
        zoom: this.zoom,
        width: this.desiredWidth,
        shouldScaleDown: true,
        elements: this.elementsByHand,
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
    this.initElements();
};

ComparerController.prototype.goForwardInHistory = function() {
    this.dataset.goForwardInHistory();
    this.initElements();
};

ComparerController.prototype.goToMostRecent = function() {
    this.dataset.goToMostRecent();
    this.initElements();
};

ComparerController.prototype.goToOldestHistoryEntry = function() {
    this.dataset.goToOldestHistoryEntry();
    this.initElements();
};
}());
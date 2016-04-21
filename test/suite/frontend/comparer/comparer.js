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
        '$timeout',
        ComparerController
    ]);

function ComparerController(datasetManager, $rootScope, gridPattern, ElementsLayout, AlgorithmAdapter, $timeout) {
    this.$timeout = $timeout;

    this.dataset = datasetManager.currentSet;
    this.gridPattern = gridPattern;
    this.layout = new ElementsLayout();

    this.desiredWidth = this.dataset.width;

    this.init(AlgorithmAdapter);

    $rootScope.$on('newCurrentSet', function(event, newCurrentSet) {
        this.dataset = newCurrentSet;
        this.init(AlgorithmAdapter);
    }.bind(this));
}

ComparerController.prototype.init = function(AlgorithmAdapter) {
    this.desiredWidth = this.dataset.width;

    this.dataset.goToMostRecent();
    this.initElements();

    this.algorithmAdapter = new AlgorithmAdapter({
        elements: this.dataset.elements,
        rowHeight: this.dataset.rowHeight,
        columnWidth: this.dataset.columnWidth,
        units: this.dataset.units,
        keepIndexOrder: this.dataset.keepIndexOrder,
        containerWidth: this.desiredWidth,
    });

    this.algorithmAdapter.arrange();

    this.adjustZoom();
};

ComparerController.prototype.initElements = function() {
    this.elementsByHand = _.filter(this.dataset.elements, { isArranged: true });
};

ComparerController.prototype.adjustZoom = function() {
    if (!this.readWidthArrangedByHand) {
        this.$timeout(function() {
            this.adjustZoom();
            this.readWidthArrangedByHand = this.readWidthArrangedByHand
                || function() { return this.desiredWidth; };
        }.bind(this), 20);
        return;
    }

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
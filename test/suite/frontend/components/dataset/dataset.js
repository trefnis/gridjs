(function() {
'use strict';

var units = { 
    px: 'px', 
    percent: '%',
    toArray: function() {
        return [this.px, this.percent];
    }
};

angular
    .module('gridjs-test.dataset', [])
    .constant('availableUnits', units)
    .factory('Dataset', [function () {
        return Dataset;
    }]);

function Dataset(dataset) {
    var defaultSet = dataset || {};

    this.name = defaultSet.name;
    this.columnWidth = defaultSet.columnWidth || 200;
    this.rowHeight = defaultSet.rowHeight || 200;
    this.units = defaultSet.units || { width: units.px, height: units.px };
    this.elements =  defaultSet.elements || [];
    this.elementsHistory = defaultSet.elementsHistory || [];
    this._currentHistoryIndex = defaultSet._currentHistoryIndex || null;
}

Dataset.prototype.rearrangeElement = function(newIndex, oldIndex) {
    var isIncrementing = newIndex > oldIndex;
    var insertAt = isIncrementing ? newIndex + 1 : newIndex;
    var deleteAt = isIncrementing ? oldIndex : oldIndex + 1;

    this.elements.splice(insertAt, 0, this.elements[oldIndex]);
    this.elements.splice(deleteAt, 1);
};

Dataset.prototype.createDefaultElement = function() {
    return {
        width: this.columnWidth,
        height: this.rowHeight,
        top: null,
        left: null,
        isArranged: false,
    };
};

Dataset.prototype.addHistoryEntry = function() {
    this.elementsHistory.push(_.cloneDeep(this.elements));
    this._currentHistoryIndex = this.elementsHistory.length - 1;
};

Dataset.prototype.resetHistory = function() {
    this._currentHistoryIndex = null;
    this.elementsHistory = [];
};

Dataset.prototype.canGoBackInHistory = function() {
    return this._currentHistoryIndex > 0;
};

Dataset.prototype.canGoForwardInHistory = function() {
    return this._currentHistoryIndex + 1 < this.elementsHistory.length;
};

Dataset.prototype.popHistoryEntry = function() {
    if (this.elementsHistory.length > 0) {
        this._currentHistoryIndex--;
        if (this._currentHistoryIndex >= 0) {
            this.elements = this.elementsHistory[this._currentHistoryIndex];
        } else {
            this._currentHistoryIndex = 0;
        }
    }
};

Dataset.prototype.goForwardInHistory = function() {
    if (this.canGoForwardInHistory()) {
        this._currentHistoryIndex++;
        this.elements = this.elementsHistory[this._currentHistoryIndex];
    }
};

Dataset.prototype.goToMostRecent = function() {
    while (this.canGoForwardInHistory()) {
        this.goForwardInHistory();
    }
};

Dataset.prototype.goToOldestHistoryEntry = function() {
    while (this.canGoBackInHistory()) {
        this.popHistoryEntry();
    }
};

}());
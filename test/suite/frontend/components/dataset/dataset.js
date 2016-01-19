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

}());
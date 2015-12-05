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
    this.elements = [];
}

Dataset.prototype.elementSortableProperties = ['index', 'width', 'height'];

Dataset.prototype.createDefaultElement = function() {
    return {
        width: this.columnWidth,
        height: this.rowHeight,
        index: this.elements.length
    };
};

Dataset.prototype.sortElements = function(sortBy, order) {
    if (!_.any(this.elementSortableProperties, sortBy)) {
        throw new Error('Incorrect "sortBy" argument: ' + sortBy + '. It has to be one of elementSortableProperties: ' + this.elementSortableProperties.join(', '));
    }

    this.elements = _.sortByOrder(this.elements, sortBy, order);
};

}());
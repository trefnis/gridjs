(function() {
'use strict';

angular
    .module('gridjs-test.dataset', [])
    .factory('Dataset', [function () {
        return Dataset;
    }]);

function Dataset(dataset) {
    var defaultSet = dataset || {};

    this.name = defaultSet.name;
    this.columnWidth = defaultSet.columnWidth || 200;
    this.rowHeight = defaultSet.rowHeight || 200;
    this.units = defaultSet.units || 'px';
    this.elements = [];
}

Dataset.prototype.elementSortableProperties = ['width', 'height', 'index'];

Dataset.prototype.createDefaultElement = function() {
    return {
        width: this.columnWidth,
        height: this.rowHeight,
        index: this.elements.length
    };
};

Dataset.prototype.createDefault = function() {
    return new Dataset({
        name: 'dataSet1'
    });
};

Dataset.prototype.sortElements = function(sortBy, order) {
    if (!_.any(this.elementSortableProperties, sortBy)) {
        throw new Error('Incorrect "sortBy" argument: ' + sortBy + '. It has to be one of elementSortableProperties: ' + this.elementSortableProperties.join(', '));
    }

    this.elements = _.sortByOrder(this.elements, sortBy, order);
};

}());
(function() {
'use strict';

angular
    .module('gridjs-test.algorithm-adapter', [])
    .factory('AlgorithmAdapter', [function () {
        return AlgorithmAdapter;
    }]);

function AlgorithmAdapter(args) {
    this.rowHeight = args.rowHeight;
    this.columnWidth = args.columnWidth;

    this.args = args;

    this.currentElements = [];
    this.packager = new jaspis.default(args);
}

AlgorithmAdapter.prototype.arrange = function() {
    this.currentElements = this.packager.pack();
};

AlgorithmAdapter.prototype.stepForward = function() {
    this.packager.stepForward();

    this.currentElements = this.packager.placedElements.map(function(element) {
        return {
            width: element.width,
            height: element.height,
            top: element.rowOffset * this.rowHeight,
            left: element.columnOffset * this.columnWidth,
            index: element.index,
            isArranged: true,
        };
    }.bind(this));
};

AlgorithmAdapter.prototype.stepBack = function() {
    console.error('Unable to step back. Not implemented in algorithm');
};

AlgorithmAdapter.prototype.reset = function() {
    this.currentElements = [];
    this.packager = new jaspis.default(this.args);
};

}());
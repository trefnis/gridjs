(function() {
'use strict';

angular
    .module('gridjs-test.algorithm-adapter', [])
    .factory('AlgorithmAdapter', [function () {
        return AlgorithmAdapter;
    }]);

function AlgorithmAdapter(elements) {
    this.allElements = elements.map(function(elem) {
        return {
            width: elem.width,
            height: elem.height,
            top: null,
            left: null,
            isArranged: false,
            index: elem.index
        };
    });

    this.currentElements = [];

    window.AlgorithmAdapter = AlgorithmAdapter.prototype;
}

AlgorithmAdapter.prototype.arrange = function() {
    var elem = this.allElements[0];
    elem.top = 0;
    elem.left = 0;
    this.currentElements.push(elem);
};
AlgorithmAdapter.prototype.stepForward = function() {};
AlgorithmAdapter.prototype.stepBack = function() {};
AlgorithmAdapter.prototype.reset = function() {};

}());
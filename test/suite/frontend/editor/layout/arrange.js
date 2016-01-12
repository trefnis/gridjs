(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .directive('editorArrange', editorArrangeDirective)
    .controller('EditorArrangeMenuController', [EditorArrangeMenuController])
    .directive('editorArrangeMenu', editorArrangeMenuDirective)
    .controller('EditorArrangeController', ['$scope', EditorArrangeController]);

function editorArrangeMenuDirective() {
    return {
        templateUrl: 'editor/layout/arrange-menu.html',
        scope: {
            dataset: '=',
            availableUnits: '=',
            getStep: '=',
            resetNewElement: '=',
            arrange: '='
        },
        controller: 'EditorArrangeMenuController',
        bindToController: true,
        controllerAs: 'menu'
    };
}

function EditorArrangeMenuController() {
    if (!this.arrange) {
        this.arrange = {};
    }
    var arrange = this.arrange;

    arrange.zoom = 1;
    arrange.width = 600;

    this.adjustZoomAfterScaleChange = function() {
        if (!arrange.shouldScaleDown) {
            arrange.zoom = 1;
        }
    };
}

function editorArrangeDirective() {
    return {
        templateUrl: 'editor/layout/arrange.html',
        scope: {
            // elements: '=',
            selectElement: '=',
            selectedElementIndex: '=',
            units: '=',
            arrange: '=',
        },
        controller: 'EditorArrangeController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function EditorArrangeController($scope) {
    this._adjustZoomThrottled = null;

    this.arrange.zoom = this.arrange.zoom || 1;

    this.elements = [
        {index: 1, width: 200, height: 200, left: 600, top: 200},
        {index: 2, width: 200, height: 600, left: 200, top: 800},
        {index: 3, width: 400, height: 300, left: 200, top: 1200},
        {index: 4, width: 600, height: 200, left: 0, top: 0},
    ];
}

EditorArrangeController.prototype.getContainerCssSize = function() {
    this.adjustZoomThrottled();

    var width = this.getContainerWidth();
    var maxWidth = this.getContainerMaxWidth();
    var height = this.getContainerHeight();

    return {
        width: width,
        'max-width': maxWidth,
        height: height,
    };
};

EditorArrangeController.prototype.getContainerWidth = function() {
    return this.arrange.shouldScaleDown ?
        '100%' :
        this.arrange.width * this.arrange.zoom + this.units.width;
};

EditorArrangeController.prototype.getContainerHeight = function() {
    var farthestElement = _.max(this.elements, distance);
    var height = Math.floor(distance(farthestElement) * this.arrange.zoom);
    return height + this.units.height;
};

EditorArrangeController.prototype.getContainerMaxWidth = function() {
    return this.arrange.shouldScaleDown ? this.arrange.width + 'px' : 'auto';
};

EditorArrangeController.prototype.adjustZoom = function() {
    if (this.arrange.shouldScaleDown) {
        var zoom = this.readWidth() / this.arrange.width;
        this.arrange.zoom = zoom < 1 ? zoom : 1;
    }
};

EditorArrangeController.prototype.adjustZoomThrottled = 
    _.throttle(EditorArrangeController.prototype.adjustZoom, 20);

EditorArrangeController.prototype.getElementClass = function(element) {
    return {
        'element--positioned': true, 
        'element--selected': element.index === this.selectedElementIndex 
    };
};

EditorArrangeController.prototype.getElementCss = function(element) {
    var width = Math.floor(element.width * this.arrange.zoom);
    var height = Math.floor(element.height * this.arrange.zoom);
    var left = Math.floor(element.left * this.arrange.zoom);
    var top = Math.floor(element.top * this.arrange.zoom);

    return {
        width: width + this.units.width,
        height: height + this.units.height,
        left: left + this.units.width,
        top: top + this.units.height,
    };
};

function distance(element) {
    return element.height + element.top;
}

}());
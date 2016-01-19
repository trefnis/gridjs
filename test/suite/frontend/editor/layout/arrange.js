(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .directive('editorArrange', editorArrangeDirective)
    .controller('EditorArrangeMenuController', [EditorArrangeMenuController])
    .directive('editorArrangeMenu', editorArrangeMenuDirective)
    .controller('EditorArrangeController', ['$scope', 'arrangedFilter', EditorArrangeController]);

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
            dataset: '=',
            elements: '=',
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

function EditorArrangeController($scope, arranged) {
    this._adjustZoomThrottled = null;

    this.arrange.zoom = this.arrange.zoom || 1;

    this.arrange.addItem = this.addItem.bind(this);
    this.arrange.removeItem = this.removeItem.bind(this);

    // this.elements = [
    //     {index: 1, width: 200, height: 200, left: 600, top: 200, isArranged: false},
    //     {index: 2, width: 200, height: 600, left: 200, top: 800, isArranged: false},
    //     {index: 3, width: 400, height: 300, left: 200, top: 1200, isArranged: false},
    //     {index: 4, width: 600, height: 200, left: 0, top: 0, isArranged: true},
    // ];

    // console.log(arranged(this.elements, false));
    // console.log(arranged(this.elements, true));
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
    if (farthestElement === -Infinity) return '0' + this.units.height;
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

EditorArrangeController.prototype.addItem = function(element) {
    var farthestElement = _.max(this.elements, function(elem) {
        return elem.element.top === null ? -Infinity : elem.element.top;
    });
    var top = farthestElement !== -Infinity && farthestElement.element.top !== null ?
        farthestElement.element.top + this.dataset.rowHeight : 0;

    element.left = 0;
    element.top = top;

    element.isArranged = true;
};

EditorArrangeController.prototype.removeItem = function(element) {
    element.left = null;
    element.top = null;

    element.isArranged = false;
};

EditorArrangeController.prototype.moveElement = function(direction, element) {
    switch (direction) {
        case 'left': element.left -= this.dataset.columnWidth; break;
        case 'top': element.top -= this.dataset.rowHeight; break;
        case 'right': element.left += this.dataset.columnWidth; break;
        case 'bottom': element.top += this.dataset.rowHeight; break;
    }
};

EditorArrangeController.prototype.canMove = function(direction, element) {
    var isEdge = false;
    var wontCollide = false;
    var moved = null;

    switch (direction) {
        case 'left': 
            isEdge = !(element.left > 0); 
            moved = {
                top: element.top,
                left: element.left - this.dataset.columnWidth,
                width: element.width,
                height: element.height,
            };
            break;
        case 'top': 
            isEdge = !(element.top > 0);
            moved = {
                top: element.top - this.dataset.rowHeight,
                left: element.left,
                width: element.width,
                height: element.height,
            };
            break;
        case 'right': 
            isEdge = !(element.left + element.width < this.arrange.width);
            moved = {
                top: element.top,
                left: element.left + this.dataset.columnWidth,
                width: element.width,
                height: element.height,
            };
            break;
        case 'bottom': 
            isEdge = false; 
            moved = {
                top: element.top + this.dataset.rowHeight,
                left: element.left,
                width: element.width,
                height: element.height,
            };
            break;
    }

    if (isEdge) return false;

    console.log(moved);
    console.log(direction);
    var elements = _.filter(this.elements, { element: { isArranged: true } });
    wontCollide = !willCollide(moved, elements)

    return wontCollide;
};

function willCollide(element, elements) {
    //TODO get out element from elements (use index), take only arranged elements
    var overlappingElems = getHeightOverlappingElements(element, elements);

    if (!overlappingElems.length) return false;
    
    overlappingElems = getWidthOverlappingElements(element, overlappingElems);

    return overlappingElems.length > 0;
}

function getHeightOverlappingElements(element, elements) {
    return _.filter(elements, function (otherElem) {
        var doesOverlap = isOverlappingVertically({
            top: element.top,
            bottom: element.top + element.height,
        }, {
            top: otherElem.element.top,
            bottom: otherElem.element.top + otherElem.element.height,
        });
        return doesOverlap;
    })
};

function getWidthOverlappingElements(element, elements) {
    return _.filter(elements, function (otherElem) {
        var doesOverlap = isOverlappingHorizontally({
            left: element.left,
            right: element.left + element.width,
        }, {
            left: otherElem.element.left,
            right: otherElem.element.left + otherElem.element.width,
        });
        return doesOverlap;
    })
};

function isOverlappingVertically(elem, otherElem) {
    var first = otherElem.top > elem.top ? elem : otherElem;
    var second = first === elem ? otherElem : elem;
    return (second.top >= first.top && second.top < first.bottom)
        || (second.bottom > first.top && second.bottom <= first.bottom)
        || (second.top < first.top && second.bottom > first.bottom);
}

function isOverlappingHorizontally(elem, otherElem) {
    var first = otherElem.left > elem.left ? elem : otherElem;
    var second = first === elem ? otherElem : elem;
    return (second.left >= first.left && second.left < first.right)
        || (second.right > first.left && second.right <= first.right)
        || (second.left < first.left && second.right > first.right);
}

EditorArrangeController.prototype.isHorizontalEdge = function(element) {
    return element.left > 0 && 
        element.left + element.width < this.arrange.width;
};

EditorArrangeController.prototype.isVerticalEdge = function(element) {
    return element.top > 0;
};

EditorArrangeController.prototype.isOnHeightAsAnyOtherElement = function(element) {

};

EditorArrangeController.prototype.isOnWidthAsAnyOtherElement = function(element) {
    
};

function distance(element) {
    return element.element.height + element.element.top;
}

}());
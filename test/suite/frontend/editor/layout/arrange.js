(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .directive('editorArrange', editorArrangeDirective)
    .controller('EditorArrangeMenuController', [EditorArrangeMenuController])
    .directive('editorArrangeMenu', editorArrangeMenuDirective)
    .controller('EditorArrangeController', [
        'gridPattern',
        'ElementsLayout',
        '$document',
        '$scope',
        EditorArrangeController]);

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
            getSelectedElement: '=',
            selectedElementIndex: '=',
            units: '=',
            arrange: '=',
            editItem: '&',
        },
        controller: 'EditorArrangeController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function EditorArrangeController(gridPattern, ElementsLayout, $document, $scope) {
    this.gridPattern = gridPattern;
    this.layout = new ElementsLayout();
    this._adjustZoomThrottled = null;
    this.arrange.zoom = this.arrange.zoom || 1;

    this.arrange.addItem = this.addItem.bind(this);
    this.arrange.removeItem = this.removeItem.bind(this);
    this.arrange.adjustItems = this.adjustItems.bind(this);

    this.attachKeyboardEvents($document, $scope);
}

EditorArrangeController.prototype.getContainerCss = function() {
    this.adjustZoomThrottled();

    var sizing = this.layout.getContainerCss({
        zoom: this.arrange.zoom,
        width: this.dataset.width,
        shouldScaleDown: this.arrange.shouldScaleDown,
        elements: this.elements,
        units: this.units,
    });

    var gridCss = this.gridPattern.getGridCss(
        this.dataset.columnWidth * this.arrange.zoom,
        this.dataset.rowHeight * this.arrange.zoom);

    return _.merge(gridCss, sizing);
};

EditorArrangeController.prototype.adjustZoom = function() {
    if (this.arrange.shouldScaleDown) {
        var zoom = this.readWidth() / this.dataset.width;
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
    return this.layout.getElementCss(element, this.arrange.zoom, this.units);
};

EditorArrangeController.prototype.adjustItems = function(elements) {
    var notPositionedElements = _.filter(elements, function(element) {
        return element.top === null;
    });
    var positionedElements = _.difference(elements, notPositionedElements);

    _.forEach(notPositionedElements, this.addItem.bind(this, positionedElements));
};

EditorArrangeController.prototype.addItem = function(existingElements, element) {
    var farthestElement = _.max(existingElements, function(element) {
        return element.top + element.height;
    });
    var rowHeight = this.dataset.rowHeight;

    var farthestElementHeight = Math.ceil(farthestElement.height / rowHeight) * rowHeight;

    var height = _.max([rowHeight, farthestElementHeight || 0]);
    var top = farthestElement !== -Infinity && farthestElement.top !== null ?
        farthestElement.top + height : 0;

    element.left = 0;
    element.top = top;
};

EditorArrangeController.prototype.removeItem = function(element) {
    element.left = null;
    element.top = null;
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
            var movedLeft = element.left - this.dataset.columnWidth;
            moved = _.merge({}, element, { left: movedLeft });
            break;
        case 'top':
            isEdge = !(element.top > 0);
            var movedTop = element.top - this.dataset.rowHeight;
            moved = _.merge({}, element, { top: movedTop });
            break;
        case 'right':
            isEdge = !(element.left + element.width < this.dataset.width);
            var movedRight = element.left + this.dataset.columnWidth;
            moved = _.merge({}, element, { left: movedRight });
            break;
        case 'bottom':
            isEdge = false;
            var movedBottom = element.top + this.dataset.rowHeight;
            moved = _.merge({}, element, { top: movedBottom });
            break;
    }

    if (isEdge) return false;

    wontCollide = !willCollide(moved, this.elements);

    return wontCollide;
};

function willCollide(element, elements) {
    var overlappingElems = getHeightOverlappingElements(element, elements);

    if (!overlappingElems.length) return false;

    overlappingElems = getWidthOverlappingElements(element, overlappingElems);

    return overlappingElems.length > 0;
}

function getHeightOverlappingElements(element, elements) {
    return _.filter(elements, function (otherElem) {
        if (element.index === otherElem.index) return false;
        var doesOverlap = isOverlappingVertically({
            top: element.top,
            bottom: element.top + element.height,
        }, {
            top: otherElem.top,
            bottom: otherElem.top + otherElem.height,
        });
        return doesOverlap;
    });
};

function getWidthOverlappingElements(element, elements) {
    return _.filter(elements, function (otherElem) {
        if (element.index === otherElem.index) return false;
        var doesOverlap = isOverlappingHorizontally({
            left: element.left,
            right: element.left + element.width,
        }, {
            left: otherElem.left,
            right: otherElem.left + otherElem.width,
        });
        return doesOverlap;
    });
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
        element.left + element.width < this.dataset.width;
};

EditorArrangeController.prototype.isVerticalEdge = function(element) {
    return element.top > 0;
};

EditorArrangeController.prototype.attachKeyboardEvents = function($document, $scope) {
    $document.on('keydown', function(event) {
        var direction;
        var selectedElement = this.getSelectedElement();

        if (selectedElement == null || !selectedElement.isArranged) return;

        switch (event.keyCode) {
            case 38: direction = 'top'; break;
            case 40: direction = 'bottom'; break;
            case 37: direction = 'left'; break;
            case 39: direction = 'right'; break;
            default: direction = null;
        }

        if (direction !== null) {
            $scope.$apply(this.moveElement.bind(this, direction, selectedElement));
        }
    }.bind(this));
};


function distance(element) {
    return element.height + element.top;
}

}());
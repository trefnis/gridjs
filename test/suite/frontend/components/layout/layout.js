(function() {
'use strict';

angular
    .module('gridjs-test.layout', [])
    .factory('ElementsLayout', [
        function() {
            return ElementsLayout;
        }
    ]);

function ElementsLayout() {}

ElementsLayout.prototype.getContainerCss = function(args) {
    var width = this.getContainerWidth(args);
    var maxWidth = this.getContainerMaxWidth(args);
    var height = this.getContainerHeight(args);

    return {
        width: width,
        'max-width': maxWidth,
        height: height,
        'min-height': '100%',
    };
};

ElementsLayout.prototype.getContainerWidth = function(args) {
    return args.shouldScaleDown ?
        '100%' :
        args.width * args.zoom + args.units.width;
};

ElementsLayout.prototype.getContainerHeight = function(args) {
    var farthestElement = _.max(args.elements, distance);
    if (farthestElement === -Infinity) return '0' + args.units.height;
    var height = Math.floor(distance(farthestElement) * args.zoom);
    return height + args.units.height;
};

ElementsLayout.prototype.getContainerMaxWidth = function(args) {
    return args.shouldScaleDown ? args.width + 'px' : 'none';
};

ElementsLayout.prototype.getElementCss = function(element, zoom, units) {
    var width = Math.floor(element.width * zoom);
    var height = Math.floor(element.height * zoom);
    var left = Math.floor(element.left * zoom);
    var top = Math.floor(element.top * zoom);

    return {
        width: width + units.width,
        height: height + units.height,
        left: left + units.width,
        top: top + units.height,
    };
};

function distance(element) {
    return element.height + element.top;
}

}());

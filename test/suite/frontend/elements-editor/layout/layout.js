(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .factory('ElementsLayout', [
        '$window',
        function($window) {
            return _.partial(ElementsLayout, $window);
        }
    ])

function ElementsLayout($window, args, scope) {
    this.units = args.units;
    this.shouldScaleDown = args.shouldScaleDown || false;
    this.getElementClass = args.getElementClass;
    
    this.getActualWidth = args.getActualWidth;
    this.getDesiredWidth = args.getDesiredWidth;

    // We can call digest on particular scope because we only need
    // its contents to be refreshed.
    this.refreshOnResize = _.throttle(scope.$digest.bind(scope), 200);

    this.attachEvents($window);
    this.clear = this.detachEvents.bind(this, $window);
}

ElementsLayout.prototype.getElementCssSize = function(element) {
    // Throttle getting zoom as this function will be called many times
    // during digest and zoom calculation will possibly make DOM calls
    // and hurt performance.
    this.throttledCalculateZoom();

    var width = Math.floor(element.width * this.zoom);
    var height = Math.floor(element.height * this.zoom);

    return {
        width: width + this.units.width,
        height: height + this.units.height
    };
};

ElementsLayout.prototype.setZoom = function(zoom) {
    this.shouldScaleDown = false;
    this.zoom = zoom;
};

ElementsLayout.prototype.calculateZoom = function() {
    this.zoom = this.shouldScaleDown 
        ? this.getActualWidth() / this.getDesiredWidth()
        : 1;
};

ElementsLayout.prototype.throttledCalculateZoom = function() {
    if (!this._throttledCalculateZoom) {
        this._throttledCalculateZoom = _.throttle(this.calculateZoom.bind(this), 20);
    }
    this._throttledCalculateZoom();
};

ElementsLayout.prototype.getContainerCssSize = function() {
    this.throttledCalculateZoom();

    return this.shouldScaleDown
        ? { width: '100' + this.units.percent }
        : { width: this.gridContainerWidth * this.zoom + this.units.width };
};

ElementsLayout.prototype.attachEvents = function($window) {
    angular.element($window).on('resize', this.refreshOnResize);
};

ElementsLayout.prototype.detachEvents = function($window) {
    angular.element($window).off('resize', this.refreshOnResize);
};

}());

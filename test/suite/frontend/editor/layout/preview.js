(function() {
'use strict';

angular
    .module('gridjs-test.editor')
    .directive('editorPreview', editorPreviewDirective)
    .controller('editorPreviewMenuController', [editorPreviewMenuController])
    .directive('editorPreviewMenu', editorPreviewMenuDirective)
    .controller('EditorPreviewController', [EditorPreviewController]);

function editorPreviewMenuDirective() {
    return {
        templateUrl: 'editor/layout/preview-menu.html',
        scope: {
            preview: '='
        },
        controller: 'editorPreviewMenuController',
        bindToController: true,
        controllerAs: 'menu'
    };
}

function editorPreviewMenuController() {
    if (!this.preview) {
        this.preview = {};
    }
    var preview = this.preview;

    preview.availableDisplays = ['float', 'block'];
    preview.availableSortOrders = ['asc', 'desc', 'reset'];
    preview.elementSortableProperties = [
        { label: 'index', prop: 'index' },
        { label: 'width', prop: 'width' },
        { label: 'height', prop: 'height' }
    ];
    preview.sortGlyphicons = {
        'asc': 'glyphicon-sort-by-attributes',
        'desc': 'glyphicon-sort-by-attributes-alt',
        'reset': 'glyphicon-remove' 
    };

    preview.display = preview.availableDisplays[0];
    preview.sortBy = preview.elementSortableProperties[0].prop;
    preview._sortOrder = preview.availableSortOrders[0];
    preview.reverse = false;
    preview.zoom = 1;

    var orderReverseMap = {
        'asc': false,
        'desc': true
    };

    this.preview.sortOrder = function(order) {
        if (arguments.length) {
            if (order === 'reset') {
                order = 'asc';
                this.sortBy = 'index';
            }

            this._sortOrder = order;
            if (order in orderReverseMap) {
                this.reverse = orderReverseMap[order];
            } else {
                throw new Error('Invalid sort order: ' + order);
            }
        } else {
            return this._sortOrder;
        }
    }.bind(this.preview);
}

function editorPreviewDirective() {
    return {
        templateUrl: 'editor/layout/preview.html',
        scope: {
            elements: '=',
            selectElement: '=',
            selectedElementIndex: '=',
            units: '=',
            preview: '=',
            arrange: '=',
        },
        controller: 'EditorPreviewController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function EditorPreviewController() {}

EditorPreviewController.prototype.getElementClass = function(element) {
    return {
        'element--floating': this.preview.display === 'float', 
        'element--selected': element.index === this.selectedElementIndex 
    };
};

EditorPreviewController.prototype.getElementCssSize = function(element) {
    var width = Math.floor(element.width * this.preview.zoom);
    var height = Math.floor(element.height * this.preview.zoom);

    return {
        width: width + this.units.width,
        height: height + this.units.height
    };
};

}());
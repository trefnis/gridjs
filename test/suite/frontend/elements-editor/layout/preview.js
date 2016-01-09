(function() {
'use strict';

angular
    .module('gridjs-test.elements-editor')
    .directive('elementsEditorPreview', elementsEditorPreviewDirective)
    .controller('ElementsEditorPreviewMenuController', [ElementsEditorPreviewMenuController])
    .directive('elementsEditorPreviewMenu', elementsEditorPreviewMenuDirective)
    .controller('ElementsEditorPreviewController', [ElementsEditorPreviewController]);

function elementsEditorPreviewMenuDirective() {
    return {
        templateUrl: 'elements-editor/layout/editors-menu.html',
        scope: {
            editor: '='
        },
        controller: 'ElementsEditorPreviewMenuController',
        bindToController: true,
        controllerAs: 'menu'
    };
}

function ElementsEditorPreviewMenuController() {
    if (!this.editor) {
        this.editor = {};
    }
    var editor = this.editor;

    editor.availableDisplays = ['float', 'block'];
    editor.availableSortOrders = ['asc', 'desc', 'reset'];
    editor.elementSortableProperties = [
        { label: 'index', prop: 'index' },
        { label: 'width', prop: 'element.width' },
        { label: 'height', prop: 'element.height' }
    ];
    editor.sortGlyphicons = {
        'asc': 'glyphicon-sort-by-attributes',
        'desc': 'glyphicon-sort-by-attributes-alt',
        'reset': 'glyphicon-remove' 
    };

    editor.display = editor.availableDisplays[0];
    editor.sortBy = editor.elementSortableProperties[0].prop;
    editor._sortOrder = editor.availableSortOrders[0];
    editor.reverse = false;
    editor.zoom = 1;

    var orderReverseMap = {
        'asc': false,
        'desc': true
    };

    this.editor.sortOrder = function(order) {
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
    }.bind(this.editor);
}

function elementsEditorPreviewDirective() {
    return {
        templateUrl: 'elements-editor/layout/preview.html',
        scope: {
            elements: '=',
            selectElement: '=',
            selectedElementIndex: '=',
            units: '=',
            editor: '=',
        },
        controller: 'ElementsEditorPreviewController',
        controllerAs: 'vm',
        bindToController: true,
    };
}

function ElementsEditorPreviewController() {}

ElementsEditorPreviewController.prototype.getElementClass = function(element) {
    return {
        'element--floating': this.editor.display === 'float', 
        'element--selected': element.index === this.selectedElementIndex 
    };
};

ElementsEditorPreviewController.prototype.getElementCssSize = function(element) {
    var width = Math.floor(element.width * this.editor.zoom);
    var height = Math.floor(element.height * this.editor.zoom);

    return {
        width: width + this.units.width,
        height: height + this.units.height
    };
};

}());
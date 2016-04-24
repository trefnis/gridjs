import { compareAscBy, compareDescBy, greater, lesser } from './comparer';
import { getColumnSpan, getRowSpan } from './sizing';
import { getInitialPlaces } from './places';
import { calculateNewPlacesAndElements } from './packager';

export default class PackingAlgorithm {
    constructor({
        elements = [],
        rowHeight = 10,
        columnWidth = 10,
        units: {
            width = 'px',
            height = 'px'
        } = {},
        containerWidth,
        keepIndexOrder = false,
        maxIndexDifference = Infinity
    } = {}) {

        this.elements = elements;
        this.width = containerWidth;
        this.columnWidth = columnWidth;
        this.rowHeight = rowHeight;
        this.columnsNumber = Math.floor(this.width / columnWidth);
        this.maxIndexDifference = keepIndexOrder ? 1 : maxIndexDifference;

        this.placedElements = [];

        this.elementsToBePlaced = this.getElementsToBePlaced(elements);

        this.possiblePlaces = getInitialPlaces(this.columnsNumber);
        this.gaps = [];
    }

    getElementsToBePlaced(elements) {
        const existingElementsCount = elements.length;
        return elements
            .map(({ width, height, index }, arrayIndex) => ({
                columnSpan: getColumnSpan(width, this.columnWidth),
                rowSpan: getRowSpan(height, this.rowHeight),
                index: index !== undefined ? index : (arrayIndex + existingElementsCount),
                width,
                height,
            }))
            .sort(compareAscBy('index', 'columnSpan', 'rowSpan'));
    }

    stepForward() {
        const newValues = calculateNewPlacesAndElements(this);

        this.elementsToBePlaced = newValues.elementsToBePlaced;
        this.possiblePlaces = newValues.possiblePlaces;
        this.gaps = newValues.gaps;
        this.placedElements = newValues.placedElements;
    }

    pack(elements = []) {
        const oldPlacedElements = this.placedElements;

        if (elements.length) {
            const newElementsToBePlaced = this.getElementsToBePlaced(elements);
            this.elementsToBePlaced = this.elementsToBePlaced.concat(newElementsToBePlaced);
        }

        while (this.elementsToBePlaced.length > 0) {
            this.stepForward();
        }

        return this.positionElements();
    }

    positionElements() {
        const elements = new Array(this.elements.length);
        return this.placedElements.reduce((elements, element) => {
            elements[element.index] = {
                top: element.rowOffset * this.rowHeight,
                left: element.columnOffset * this.columnWidth,
                width: element.width,
                height: element.height,
                index: element.index,
            };
            return elements;
        }, elements);
    }
}

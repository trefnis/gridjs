import { compareAscBy, compareDescBy, greater, lesser } from './comparer';
import { getColumnSpan, getRowSpan } from './sizing';
// import { calculateBestPossiblePlace, calculateNewPossiblePlaces, getInitialPlaces } from './places';
import { getInitialPlaces } from './places';
import { calculateNewPlacesAndElements } from './packager';

export class PackingAlgorithm {
    constructor({
        elements = [],
        rowHeight = 10,
        columnWidth = 10,
        units: {
            width = 'px',
            height = 'px'
        } = {},
        getWidth
    } = {}) {

        this.elements = elements;

        this.width = getWidth();
        this.columnWidth = columnWidth;
        this.rowHeight = rowHeight;
        this.columnsNumber = Math.floor(this.width / columnWidth);

        this.placedElements = [];

        this.elementsToBePlaced = elements
            .map(({ width, height, index }, arrayIndex) => ({
                    columnSpan: getColumnSpan(width, columnWidth),
                    rowSpan: getRowSpan(height, rowHeight),
                    index: index || arrayIndex,
                    width,
                    height,
                }))
            .sort(compareAscBy('index', 'columnSpan', 'rowSpan'));

        this.possiblePlaces = getInitialPlaces(this.columnsNumber);
        this.gaps = [];
    }

    stepForward() {
        const newValues = calculateNewPlacesAndElements(this);

        this.elementsToBePlaced = newValues.elementsToBePlaced;
        this.possiblePlaces = newValues.possiblePlaces;
        this.gaps = newValues.gaps;
        this.placedElements = newValues.placedElements;
    }

    pack() {
        while (this.elementsToBePlaced.length > 0) {
            this.stepForward();
        }

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

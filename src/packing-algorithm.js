import { compareAscBy, compareDescBy, greater, lesser } from './comparer';
import Sizing from './sizing';

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

        this.placedElements = [];
        this.width = getWidth();
        this.columnWidth = columnWidth;
        this.rowHeight = rowHeight;
        this.columnsNumber = Math.floor(this.width / columnWidth);

        this.elementsToBePlaced = elements
            .map(({ width, height, index }, arrayIndex) => ({ 
                    columnSpan: this._getColumnSpan(width),
                    rowSpan: this._getRowSpan(height),
                    index: index || arrayIndex,
                    width,
                    height,
                }))
            .sort(compareAscBy('index', 'columnSpan', 'rowSpan'));


        this.possiblePlaces = [{
            columnSpan: this.columnsNumber,
            columnOffset: 0,
            rowOffset: 0,
            rowSpan: Number.MAX_VALUE, // Guard.
        }];


        this.gaps = [];
    }

    stepForward() {
        if (this.elementsToBePlaced.length <= 0) {
            return;
        }

        // TODO: rename all those destructured indexes to be named as original index

        let { bestPossiblePlace, index: bestPossiblePlaceIndex } =
            this.calculateBestPossiblePlace(this.possiblePlaces);

        let { element: elementThatFits, index: elementThatFitsIndex } =
            this.findElementThatFits(this.elementsToBePlaced, bestPossiblePlace);

        if (elementThatFits === null) {
            // TODO: add replacement
            const gap = this.positionGapAtPlace(bestPossiblePlace, this.possiblePlaces);
            this.gaps.push(gap);

            this.possiblePlaces.splice(bestPossiblePlaceIndex, 1);
            // TODO: check if there is possibility to last with no possible places
            // and if there is a way to avoid or handle it
            return;
        }

        let positionedElement = this.positionElementAtPlace(elementThatFits, bestPossiblePlace);
        this.placedElements.push(positionedElement);
        this.elementsToBePlaced.splice(elementThatFitsIndex, 1);

        this.possiblePlaces = this.calculateNewPossiblePlaces(this.possiblePlaces, positionedElement);
    }

    pack() {
        const elementsToBePlaced = this.elementsToBePlaced;
        const placedElements = [];
        const gaps = [];
        let leaves = [];
        let possiblePlaces = this.possiblePlaces;

        while (elementsToBePlaced.length > 0) {
            let { bestPossiblePlace, index: bestPossiblePlaceIndex } =
                this.calculateBestPossiblePlace(possiblePlaces);

            let { element: elementThatFits, index: elementThatFitsIndex } =
                this.findElementThatFits(elementsToBePlaced, bestPossiblePlace);

            if (elementThatFits === null) {
                // TODO: add replacement
                const gap = this.positionGapAtPlace(bestPossiblePlace, possiblePlaces);
                gaps.push(gap);
                

                possiblePlaces.splice(bestPossiblePlaceIndex, 1);
                // TODO: check if there is possibility to last with no possible places
                // and if there is a way to avoid or handle it
                continue;
            }

            let positionedElement = this.positionElementAtPlace(elementThatFits, bestPossiblePlace);
            placedElements.push(positionedElement);
            elementsToBePlaced.splice(elementThatFitsIndex, 1);

            possiblePlaces = this.calculateNewPossiblePlaces(possiblePlaces, positionedElement);
        }

        var elements = new Array(this.elements.length);
        return placedElements.reduce((elements, element) => {
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

    calculateBestPossiblePlace(possiblePlaces) {
        if (!possiblePlaces.length) {
            throw new Error("No possiblePlaces or empty array been passed.");
        }

        if (possiblePlaces.length === 1) {
            return { bestPossiblePlace: possiblePlaces[0], index: 0 };
        }

        const guard = {
            bestPossiblePlace: {
                rowOffset: Number.MAX_VALUE,
                columnOffset: Number.MAX_VALUE,
            },
            index: null
        };

        return possiblePlaces.reduce((currentBest, candidate, i) => {
            const betterPlace = lesser(currentBest.bestPossiblePlace, candidate, 'rowOffset', 'columnOffset');
            return betterPlace === currentBest.bestPossiblePlace ?
                currentBest :
                { bestPossiblePlace: candidate, index: i };
        }, guard);
    }

    findElementThatFits(elements, place) {
        // Assume that elements are sorted by index then width
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].columnSpan <= place.columnSpan) {
                return { element: elements[i], index: i };
            }
        }

        //TODO: check if rowSpan should be checked

        // Nothing found.
        return { element: null };
    }

    positionElementAtPlace(element, place) {
        return {
            rowOffset: place.rowOffset,
            columnOffset: place.columnOffset,
            rowSpan: element.rowSpan,
            columnSpan: element.columnSpan,
            width: element.width,
            height: element.height,
            index: element.index,
        };
    }

    positionGapAtPlace(place, possiblePlaces) {
        const gap = {
            rowOffset: place.rowOffset,
            columnOffset: place.columnOffset,
            rowSpan: place.rowSpan,
            columnSpan: place.columnSpan,
        };

        //TODO: get row span based on closest other place that is below given place

        return gap;
    }

    calculateNewPossiblePlaces(places, positionedElement) {
        let currentPlaces = [];
        let placeAfterPositionedElement = this.getPlaceAfterPositionedElement(positionedElement, places);
        let isPlaceAfterPositionedElementJoined = false;

        // Handle places from most distant to closest to the top
        const newPlaces = places.reverse().reduce((newPlaces, place) => {
            let places = newPlaces.concat([]);

            const shouldBeJoined = !isPlaceAfterPositionedElementJoined && 
                place.rowOffset === placeAfterPositionedElement.rowOffset &&
                this.isColliding(place, placeAfterPositionedElement);

            // Extend to places width if it's the place that's just below 
            // (first occurence as we are iterating from top to bottom)
            const shouldBeExtended = () => !isPlaceAfterPositionedElementJoined && 
                place.rowOffset < placeAfterPositionedElement.rowOffset &&
                this.isColliding(place, placeAfterPositionedElement);

            if (shouldBeJoined) {
                isPlaceAfterPositionedElementJoined = true;
                // As we join both of the places we should return here
                // and don't let place to be yield
                return places.concat(this.joinPlaces(place, placeAfterPositionedElement));
            } else if (shouldBeExtended()) {
                placeAfterPositionedElement.columnSpan = place.columnSpan;
                placeAfterPositionedElement.columnOffset = place.columnOffset;
                places.push(placeAfterPositionedElement);
                isPlaceAfterPositionedElementJoined = true;
            }

            // TODO: check if would collide on the edge
            //  __
            // |  |
            // ;```````
            // (is this condition needed) place.rowOffset < placeAfterPositionedElement.rowOffset
            const shouldBeBroken = this.isColliding(place, positionedElement);

            if (shouldBeBroken) {
                const brokenPlaces = this.breakPlaceByPositionedElement(place, positionedElement);
                places = places.concat(brokenPlaces);
            } else {
                places = places.concat([place]);
            }

            return places;
        }, []);

        // New element is most distant, so we extend new place to a whole line
        // with container width.
        if (!isPlaceAfterPositionedElementJoined) {
            placeAfterPositionedElement.columnSpan = this.columnsNumber;
            placeAfterPositionedElement.columnOffset = 0;
            newPlaces.unshift(placeAfterPositionedElement);
            // newPlaces.push(placeAfterPositionedElement);
        }

        return newPlaces.reverse();
    }

    isColliding(element, otherElement) {
        const isBetween = (value, firstEdge, secondEdge) => 
            value > firstEdge && value < secondEdge;

        const doesContain = (x1, x2, y1, y2) => x1 <= y1 && x2 >= y2;

        const horizontalEdges = (element) => ({
            left: element.columnOffset,
            right: element.columnOffset + element.columnSpan,
        });

        const verticalEdges = (element) => ({
            top: element.rowOffset,
            bottom: element.rowOffset + element.rowSpan,
        });

        const isCollidingAtAxis = (xFirstEdge, xSecondEdge, yFirstEdge, ySecondEdge) =>
            isBetween(yFirstEdge, xFirstEdge, xSecondEdge) ||
            isBetween(ySecondEdge, xFirstEdge, xSecondEdge) ||
            doesContain(xFirstEdge, xSecondEdge, yFirstEdge, ySecondEdge) ||
            doesContain(yFirstEdge, ySecondEdge, xFirstEdge, xSecondEdge);

        const { left: leftEdge, right: rightEdge } = horizontalEdges(element);
        const { left: otherLeftEdge, right: otherRightEdge } = horizontalEdges(otherElement);
        const { top: topEdge, bottom: bottomEdge } = verticalEdges(element);
        const { top: otherTopEdge, bottom: otherBottomEdge } = verticalEdges(otherElement);

        return isCollidingAtAxis(leftEdge, rightEdge, otherLeftEdge, otherRightEdge)
            && isCollidingAtAxis(topEdge, bottomEdge, otherTopEdge, otherBottomEdge);
    }

    joinPlaces(firstPlace, secondPlace) {
        const firstPlaceRightEdge = firstPlace.columnOffset + firstPlace.columnSpan;
        const secondPlaceRightEdge = secondPlace.columnOffset + secondPlace.columnSpan;

        const leftPlace = lesser(firstPlace, secondPlace, 'columnOffset');
        const rightPlace = firstPlaceRightEdge > secondPlaceRightEdge ? firstPlace : secondPlace;

        const rowOffset = firstPlace.rowOffset; // should be same for both
        const columnOffset = leftPlace.columnOffset;
        const rowSpan = Number.MAX_VALUE;
        const columnSpan = (rightPlace.columnOffset + rightPlace.columnSpan) - leftPlace.columnOffset;

        return {
            rowOffset,
            columnOffset,
            rowSpan,
            columnSpan,
        };
    }

    breakPlaceByPositionedElement(place, positionedElement) {
        const newPlaces = [];

        const leftColumnSpan = positionedElement.columnOffset - place.columnOffset;
        if (leftColumnSpan > 0) {
            newPlaces.push({
                rowOffset: place.rowOffset,
                columnOffset: place.columnOffset,
                rowSpan: place.rowSpan,
                columnSpan: leftColumnSpan,
            });
        }

        const elementRightEdge = positionedElement.columnOffset + positionedElement.columnSpan
        const rightColumnSpan = (place.columnOffset + place.columnSpan) - elementRightEdge;
        if (rightColumnSpan) {
            newPlaces.push({
                rowOffset: place.rowOffset,
                columnOffset: elementRightEdge,
                rowSpan: place.rowSpan,
                columnSpan: rightColumnSpan,
            });
        }

        return newPlaces;
    }

    getPlaceAfterPositionedElement(element, places) {
        return {
            rowOffset: element.rowOffset + element.rowSpan,
            columnOffset: element.columnOffset,
            columnSpan: element.columnSpan,
            rowSpan: Number.MAX_VALUE,
        };
    }

    _getColumnSpan(width) {
        return Sizing.getColumnSpan(width, this.columnWidth);
    }

    _getRowSpan(height) {
        return Sizing.getRowSpan(height, this.rowHeight);
    }
}

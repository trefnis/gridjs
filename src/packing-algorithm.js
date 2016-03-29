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
    }) {

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
            .sort(compareAscBy('columnSpan', 'index', 'rowSpan'));


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
                
                // // TODO: Check if it is needed
                // leaves.push(gap);

                possiblePlaces.splice(bestPossiblePlaceIndex, 1);
                // TODO: check if there is possibility to last with no possible places
                // and if there is a way to avoid or handle it
                continue;
            }

            let positionedElement = this.positionElementAtPlace(elementThatFits, bestPossiblePlace);
            placedElements.push(positionedElement);
            elementsToBePlaced.splice(elementThatFitsIndex, 1);

            // let closedLeaves = this.getElementsClosedByPlacedElement(placedElement, leaves);
            // leaves = leaves.filter(leaf => !closedLeaves.some(closedLeaf => closedLeaf === leaf));
            // leaves.push(positionedElement);

            possiblePlaces = this.calculateNewPossiblePlaces(possiblePlaces, positionedElement);
        }
    }

    calculateBestPossiblePlace(possiblePlaces) {
        if (!possiblePlaces.length) {
            throw new Error("No possiblePlaces or empty array been passed.");
        }

        if (possiblePlaces.length === 1) {
            return { bestPossiblePlace: possiblePlaces[0], index: 0 };
        }

        return possiblePlaces.reduce((currentBest, candidate, i) => {
            const betterPlace = lesser(currentBest, candidate, 'rowOffset', 'columnOffset');
            return betterPlace === currentBest ?
                { bestPossiblePlace: currentBest, index: i - 1 } :
                { bestPossiblePlace: candidate, index: i };
        });
    }

    findElementThatFits(elements, place) {
        // Assume that elements are sorted by width, index
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].columnSpan <= place.columnSpan) {
                return { element: elements[i], index: i };
            }
        }

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
        };
    }

    positionGapAtPlace(place, possiblePlaces) {
        const gap = ({
            rowOffset,
            columnOffset,
            rowSpan,
            columnSpan 
        } = place);

        //TODO: get row span based on closest other place that is below given place

        return gap;
    }

    calculateNewPossiblePlaces(places, positionedElement) {
        let currentPlaces = [];
        let placeAfterPositionedElement = this.getPlaceAfterPositionedElement(positionedElement, places);
        let isPlaceAfterPositionedElementJoined = false;

        const newPlaces = places.reduce((newPlaces, place) => {
            let places = newPlaces.concat([]);

            if (this.isColliding(place, positionedElement)) {
                const brokenPlaces = this.breakPlaceByPositionedElement(place, positionedElement);
                places = places.concat(brokenPlaces);
            }

            if (isPlaceAfterPositionedElementJoined) {
                return places;
            }

            if (this.hasJoin(place, placeAfterPositionedElement)) {
                isPlaceAfterPositionedElementJoined = true;
                places = places.concat(this.joinPlaces(place, placeAfterPositionedElement));
            } else if (this.isColliding(place, placeAfterPositionedElement)) {
                // We assume that possible places are sorted by rowOffset ascending
                // so this is the first place before place after positioned element
                // and we can extend new place to closest but closer to begin place's width
                placeAfterPositionedElement.columnSpan = place.columnSpan;
                places.push(placeAfterPositionedElement);
                isPlaceAfterPositionedElementJoined = true;
            }

            return places;
        }, []);

        // New element is most distant, so we extend new place to a whole line
        // with container width.
        if (!isPlaceAfterPositionedElementJoined) {
            placeAfterPositionedElement.columnSpan = this.columnsNumber;
            placeAfterPositionedElement.columnOffset = 0;
            newPlaces.push(placeAfterPositionedElement);
        }

        return newPlaces;
    }

    isColliding(element, otherElement) {
        const isBetween = (value, firstEdge, secondEdge) => 
            value > firstEdge && value < secondEdge;

        const doesContain = (x1, x2, y1, y2) => y1 <= x1 && y2 >= x2;

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
            doesContain(xSecondEdge, ySecondEdge, xFirstEdge, yFirstEdge) ||
            doesContain(xFirstEdge, yFirstEdge, xSecondEdge, ySecondEdge);

        const { left: leftEdge, right: rightEdge } = horizontalEdges(element);
        const { left: otherLeftEdge, right: otherRightEdge } = horizontalEdges(otherElement);
        const { top: topEdge, bottom: bottomEdge } = verticalEdges(element);
        const { top: otherTopEdge, bottom: otherBottomEdge } = verticalEdges(otherElement);

        return isCollidingAtAxis(leftEdge, rightEdge, otherLeftEdge, otherRightEdge)
            && isCollidingAtAxis(topEdge, bottomEdge, otherTopEdge, otherBottomEdge);
    }

    hasJoin(firstPlace, secondPlace) {
        //TODO: refactor
        const isBetween = (value, firstEdge, secondEdge) => 
            value > firstEdge && value < secondEdge;

        return firstPlace.rowOffset === secondPlace.rowOffset &&
            (isBetween(firstPlace.columnOffset, secondPlace.columnOffset, secondPlace.columnOffset + secondPlace.columnSpan) ||
            isBetween(firstPlace.columnOffset + firstPlace.columnSpan, secondPlace.columnOffset, secondPlace.columnOffset + secondPlace.columnSpan))
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

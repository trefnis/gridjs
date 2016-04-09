import { calculateBestPossiblePlace, calculateNewPossiblePlaces } from './places';

export function calculateNewPlacesAndElements({ elementsToBePlaced, possiblePlaces, gaps, placedElements, columnsNumber }) {
    if (elementsToBePlaced.length <= 0) {
        return;
    }

    // TODO: rename all those destructured indexes to be named as original index

    const { bestPossiblePlace, index: bestPossiblePlaceIndex } =
        calculateBestPossiblePlace(possiblePlaces);

    const { element: elementThatFits, index: elementThatFitsIndex } =
        findElementThatFits(elementsToBePlaced, bestPossiblePlace);

    if (elementThatFits === null) {
        // TODO: add replacement
        const gap = positionGapAtPlace(bestPossiblePlace, possiblePlaces);

        possiblePlaces.splice(bestPossiblePlaceIndex, 1);
        // TODO: check if there is possibility to last with no possible places
        // and if there is a way to avoid or handle it
        return {
            placedElements,
            elementsToBePlaced,
            possiblePlaces,
            gaps: gaps.concat([gap])
        };
    }

    const positionedElement = positionElementAtPlace(elementThatFits, bestPossiblePlace);

    elementsToBePlaced.splice(elementThatFitsIndex, 1);

    const newPossiblePlaces = calculateNewPossiblePlaces(possiblePlaces, positionedElement, columnsNumber);

    return {
        possiblePlaces: newPossiblePlaces,
        elementsToBePlaced,
        gaps,
        placedElements: placedElements.concat([positionedElement]),
    };
}

export function findElementThatFits(elements, place) {
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

function positionElementAtPlace(element, place) {
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

function positionGapAtPlace(place, possiblePlaces) {
    const gap = {
        rowOffset: place.rowOffset,
        columnOffset: place.columnOffset,
        rowSpan: place.rowSpan,
        columnSpan: place.columnSpan,
    };

    //TODO: get row span based on closest other place that is below given place

    return gap;
}

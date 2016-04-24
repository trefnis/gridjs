import { calculateBestPossiblePlace, calculateNewPossiblePlaces } from './places';

export function calculateNewPlacesAndElements({
    elementsToBePlaced,
    possiblePlaces,
    gaps,
    placedElements,
    columnsNumber,
    maxIndexDifference,
}) {
    if (elementsToBePlaced.length <= 0) {
        return;
    }

    const { bestPossiblePlace, index: bestPossiblePlaceIndex } =
        calculateBestPossiblePlace(possiblePlaces);

    const { element: elementThatFits, index: elementThatFitsIndex } =
        findElementThatFits(elementsToBePlaced, bestPossiblePlace, maxIndexDifference);

    if (elementThatFits === null) {
        const gap = positionGapAtPlace(bestPossiblePlace, possiblePlaces);

        possiblePlaces.splice(bestPossiblePlaceIndex, 1);
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

export function findElementThatFits(elements, place, maxIndexDifference) {
    const candidateElements = elements.slice(0, maxIndexDifference);

    // Assume that elements are sorted by index then width
    for (let i = 0; i < candidateElements.length; i++) {
        if (candidateElements[i].columnSpan <= place.columnSpan) {
            return { element: candidateElements[i], index: i };
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

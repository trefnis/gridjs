import { isColliding } from './sizing';
import { lesser } from './comparer';

export function getInitialPlaces(columnsNumber) {
    return [{
        columnSpan: columnsNumber,
        columnOffset: 0,
        rowOffset: 0,
        rowSpan: Number.MAX_VALUE, // Guard.
    }];
}

export function calculateBestPossiblePlace(possiblePlaces) {
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

export function calculateNewPossiblePlaces(places, positionedElement, columnsNumber) {
    const placeAfterPositionedElement = getPlaceAfterPositionedElement(positionedElement, places);
    const {
        places: newPlaces,
        isPlaceAfterPositionedElementJoined
    } = calculatePlaces(places, placeAfterPositionedElement, positionedElement);

    if (!isPlaceAfterPositionedElementJoined) {
        // If not joined then new element is most distant and can be extended
        const extendedPlace = extendPlaceToWholeWidth(placeAfterPositionedElement, columnsNumber);
        newPlaces.push(extendedPlace);
    }

    return newPlaces;
}

function getPlaceAfterPositionedElement(element, places) {
    return {
        rowOffset: element.rowOffset + element.rowSpan,
        columnOffset: element.columnOffset,
        columnSpan: element.columnSpan,
        rowSpan: Number.MAX_VALUE,
    };
}

function calculatePlaces(existingPlaces, placeAfterPositionedElement, positionedElement) {
    let isPlaceAfterPositionedElementJoined = false;

    // Handle places from most distant to closest to the top
    const newPlaces = existingPlaces.reverse().reduce((newPlaces, place) => {
        let places = newPlaces.concat([]);

        if (
            shouldBeJoined(place, placeAfterPositionedElement,
                isPlaceAfterPositionedElementJoined)
        ) {
            isPlaceAfterPositionedElementJoined = true;
            // As we join both of the places we should return here
            // and don't let place to be yield
            return places.concat(joinPlaces(place, placeAfterPositionedElement));
        } else if (
            shouldBeExtended(place, placeAfterPositionedElement,
                isPlaceAfterPositionedElementJoined)
        ) {
            places.push(extendPlaceToOtherPlace(placeAfterPositionedElement, place));
            isPlaceAfterPositionedElementJoined = true;
        }

        if (isColliding(place, positionedElement)) {
            const brokenPlaces = breakPlaceByPositionedElement(place, positionedElement);
            places = places.concat(brokenPlaces);
        } else {
            places = places.concat([place]);
        }

        return places;
    }, []);

    return {
        places: newPlaces.reverse(),
        isPlaceAfterPositionedElementJoined
    };
}

function shouldBeJoined(place, placeAfterPositionedElement, dontJoin) {
    return !dontJoin &&
        place.rowOffset === placeAfterPositionedElement.rowOffset &&
        isColliding(place, placeAfterPositionedElement);
}

function shouldBeExtended(place, placeAfterPositionedElement, dontExtend) {
    return !dontExtend &&
        place.rowOffset < placeAfterPositionedElement.rowOffset &&
        isColliding(place, placeAfterPositionedElement);
}

function extendPlaceToOtherPlace(place, otherPlace) {
    place.columnSpan = otherPlace.columnSpan;
    place.columnOffset = otherPlace.columnOffset;
    return place;
}

function extendPlaceToWholeWidth(place, columnsNumber) {
    place.columnSpan = columnsNumber;
    place.columnOffset = 0;

    return place;
}

function joinPlaces(firstPlace, secondPlace) {
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

function breakPlaceByPositionedElement(place, positionedElement) {
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

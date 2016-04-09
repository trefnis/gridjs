import { calculateBestPossiblePlace, calculateNewPossiblePlaces } from '../../src/places';

describe('places: ', () => {
    describe('calculating best places', () => {
        it('returns only place if there is single available place', () => {
            const places = [{ columnOffset: 4, rowOffset: 4, index: 0 }];
            const place = calculateBestPossiblePlace(places);

            expect(place).toEqual({ bestPossiblePlace: places[0], index: 0 });
        });

        it('returns place with smallest rowOffset as the best place', () => {
            const places = [
                { columnOffset: 4, rowOffset: 4, index: 0 },
                { columnOffset: 2, rowOffset: 3, index: 1 },
                { columnOffset: 4, rowOffset: 2, index: 2 },
                { columnOffset: 1, rowOffset: 3, index: 3 },
            ];
            const place = calculateBestPossiblePlace(places);

            expect(place).toEqual({ bestPossiblePlace: places[2], index: 2 });
        });

        it('returns place with smalles columnOffset if there are two places with smallest rowOffset', () => {
            const places = [
                { columnOffset: 4, rowOffset: 5, index: 0 },
                { columnOffset: 4, rowOffset: 4, index: 1 },
                { columnOffset: 2, rowOffset: 2, index: 2 },
                { columnOffset: 4, rowOffset: 3, index: 3 },
                { columnOffset: 4, rowOffset: 2, index: 4 },
                { columnOffset: 1, rowOffset: 3, index: 5 },
            ];
            const place = calculateBestPossiblePlace(places);

            expect(place).toEqual({ bestPossiblePlace: places[2], index: 2 });
        });
    });

    describe('calculating possible places', () => {
        it('adds new place after positioned element', () => {
            const places = [
                {
                    columnOffset: 0,
                    columnSpan: 5,
                    rowOffset: 0,
                    rowSpan: Number.MAX_VALUE,
                    index: 0 ,
                },
            ];
            const positionedElement = {
                columnOffset: 0,
                columnSpan: 2,
                rowOffset: 1,
                rowSpan: 1,
            };
            const columnsNumber = 5;

            const possiblePlaces = calculateNewPossiblePlaces(places, positionedElement, columnsNumber);

            const expectedPlace = {
                columnOffset: 0,
                columnSpan: 5,
                rowOffset: 2,
                rowSpan: Number.MAX_VALUE,
            };

            expect(possiblePlaces).toContain(expectedPlace);
        });

        it('breaks place in two with positioned element that collide with place', () => {
            const places = [
                {
                    columnOffset: 0,
                    columnSpan: 5,
                    rowOffset: 0,
                    rowSpan: Number.MAX_VALUE,
                },
            ];
            const positionedElement = {
                columnOffset: 2,
                columnSpan: 2,
                rowOffset: 0,
                rowSpan: 1,
            };
            const columnsNumber = 5;

            const possiblePlaces = calculateNewPossiblePlaces(places, positionedElement, columnsNumber);

            const leftBrokenPlace = {
                columnOffset: 0,
                columnSpan: 2,
                rowOffset: 0,
                rowSpan: Number.MAX_VALUE,
            };

            const rightBrokenPlace = {
                columnOffset: 4,
                columnSpan: 1,
                rowOffset: 0,
                rowSpan: Number.MAX_VALUE,
            };

            expect(possiblePlaces).toContain(leftBrokenPlace);
            expect(possiblePlaces).toContain(rightBrokenPlace);
        });

        it('joins places if place after position element is just between them', () => {
            const places = [
                {
                    columnOffset: 0,
                    columnSpan: 5,
                    rowOffset: 2,
                    rowSpan: Number.MAX_VALUE,
                }
            ];

            const positionedElement = {
                columnOffset: 2,
                columnSpan: 2,
                rowOffset: 0,
                rowSpan: 2,
            };
            const columnsNumber = 5;

            const possiblePlaces = calculateNewPossiblePlaces(places, positionedElement, columnsNumber);

            expect(possiblePlaces.length).toBe(1);
            expect(possiblePlaces[0]).toEqual({
                columnOffset: 0,
                columnSpan: 5,
                rowOffset: 2,
                rowSpan: Number.MAX_VALUE,
            });
        });
    });
});

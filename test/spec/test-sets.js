import { PackingAlgorithm } from '../../src/packing-algorithm';

import test1 from '../datasets/test1.json';
import test2 from '../datasets/test2.json';
import test3 from '../datasets/test3.json';
import test4 from '../datasets/test4.json';
import test5 from '../datasets/test5.json';
import test6 from '../datasets/test6.json';
import test7 from '../datasets/test7.json';
import test8 from '../datasets/test8.json';

const sets = [
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
    test7,
    test8,
];

const getArgsFromSet = (set) => {
    return {
        elements: set.elements,
        columnWidth: set.columnWidth,
        rowHeight: set.rowHeight,
        units: set.units,
        getWidth: () => set.width
    };
};

const elementComparator = (element, packedElement) =>
    element.top === packedElement.top &&
    element.left === packedElement.left &&
    element.width === packedElement.width &&
    element.height === packedElement.height &&
    element.index === packedElement.index;

const testSet = (set) => () => {
    const packer = new PackingAlgorithm(getArgsFromSet(set));

    const packedElements = packer.pack();
    const expectedElements = set.elementsHistory[set.elementsHistory.length - 1];

    expect(packedElements).toEqual(expectedElements);
};

beforeEach(() => {
    jasmine.addCustomEqualityTester(elementComparator);
});

describe('test set:', () => {
    sets.forEach((set, i) => it(`test${i}`, testSet(set)));
});

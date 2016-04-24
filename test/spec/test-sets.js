import PackingAlgorithm from '../../src/packing-algorithm';

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

import keepIndexOrder_test1 from '../datasets/keepIndexOrder_test1.json';

const keepIndexOrderSets = [
    keepIndexOrder_test1,
];

const getArgsFromSet = (set, keepIndexOrder) => {
    return {
        elements: set.elements,
        columnWidth: set.columnWidth,
        rowHeight: set.rowHeight,
        units: set.units,
        containerWidth: set.width,
        keepIndexOrder
    };
};

const elementComparator = (element, packedElement) => {
    const props = ['top', 'left', 'width', 'height', 'index'];

    if (!element || !packedElement ||
        typeof element !== 'object' ||
        typeof packedElement !== 'object' ||
        !props.reduce((result, prop) =>
            result && prop in element && prop in packedElement, true)) {
        return undefined;
    }

    const result = props.reduce((result, prop) =>
        result && element[prop] === packedElement[prop], true);

    return result;
};

const testSet = ({ set, keepIndexOrder = false }) => () => {
    const packer = new PackingAlgorithm(getArgsFromSet(set, keepIndexOrder));

    const packedElements = packer.pack();
    const expectedElements = set.elementsHistory[set.elementsHistory.length - 1];

    expect(packedElements).toEqual(expectedElements);
};

beforeEach(() => {
    jasmine.addCustomEqualityTester(elementComparator);
});

describe('test set:', () => {
    sets.forEach((set, i) => it(`test${i + 1}`, testSet({ set })));
    keepIndexOrderSets.forEach((set, i) => it(`keepIndexOrder test${i + 1}`, testSet({ set, keepIndexOrder: true })));
});

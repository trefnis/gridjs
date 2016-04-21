export { compareAscBy, compareDescBy, lesser, greater };

function greater(a, b, ...props) {
    return compareAscBy(...props)(a, b) === 1 ? a : b;
}

function lesser(a, b, ...props) {
    return compareDescBy(...props)(a, b) === 1 ? a : b;
}

function compareAscBy(...props) {
    return comparer(props);
}

function compareDescBy(...props) {
    return (a, b) => -(comparer(props)(a, b));
}

function comparer(props) {
    return (a, b) => {
        const isGreater = (x, y) => x > y;
        const isSmaller = (x, y) => x < y;

        const { result: isAGreater } = compare({ isGreater, isSmaller, a, b, props });
        if (isAGreater === 1) return 1;

        const { result: isBGreater } = compare({
            isGreater: isSmaller,
            isSmaller: isGreater,
            a, b, props
        });
        if (isBGreater === 1) return -1;

        return 0;
    };
}

function compare({ isGreater, isSmaller, a, b, props }) {
    return props.reduce(({ result, prop1 }, prop2) => {
        if (result === 1 || result === -1) return { result };

        if (isGreater(a[prop2], b[prop2])) return { result: 1 };
        if (isSmaller(a[prop2], b[prop2])) return { result: -1 };
        return { result: 0, prop1: prop2 };
    }, { result: null, prop1: null });
}

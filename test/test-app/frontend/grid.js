(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compareAscBy = compareAscBy;
exports.compareDescBy = compareDescBy;
exports.lesser = lesser;
exports.greater = greater;

function greater(a, b) {
    for (var _len = arguments.length, props = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        props[_key - 2] = arguments[_key];
    }

    return compareDescBy(props)(a, b) === 1 ? a : b;
}

function lesser(a, b) {
    for (var _len2 = arguments.length, props = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        props[_key2 - 2] = arguments[_key2];
    }

    return compareAscBy(props)(a, b) === 1 ? a : b;
}

function compareAscBy() {
    for (var _len3 = arguments.length, props = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        props[_key3] = arguments[_key3];
    }

    return function (a, b) {
        return -comparer(props)(a, b);
    };
}

function compareDescBy() {
    for (var _len4 = arguments.length, props = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        props[_key4] = arguments[_key4];
    }

    return comparer(props);
}

function comparer(props) {
    return function (a, b) {
        var isGreater = function isGreater(x, y) {
            return x > y;
        };
        var isSmaller = function isSmaller(x, y) {
            return x < y;
        };

        var _compare = compare({ isGreater: isGreater, isSmaller: isSmaller, a: a, b: b, props: props });

        var isAGreater = _compare.result;

        if (isAGreater === 1) return 1;

        var _compare2 = compare({
            isGreater: isSmaller,
            isSmaller: isGreater,
            a: a, b: b, props: props
        });

        var isBGreater = _compare2.result;

        if (isBGreater === 1) return -1;

        return 0;
    };
}

function compare(_ref) {
    var isGreater = _ref.isGreater;
    var isSmaller = _ref.isSmaller;
    var a = _ref.a;
    var b = _ref.b;
    var props = _ref.props;

    return props.reduce(function (_ref2, prop2) {
        var result = _ref2.result;
        var prop1 = _ref2.prop1;

        if (result === 1 || result === -1) return { result: result };

        if (result === null) {
            // Check first prop only the first time as on every other
            // iteration it will be checked as prop2
            if (isGreater(a[prop1], b[prop1])) return { result: 1 };
            if (isSmaller(a[prop1], b[prop1])) return { result: -1 };
        }

        if (isGreater(a[prop2], b[prop2])) return { result: 1 };
        if (isSmaller(a[prop2], b[prop2])) return { result: -1 };
        return { result: 0, prop1: prop2 };
    }, { result: null, prop1: 'undefined' });
}

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _comparer = require('./comparer');

var _sizing = require('./sizing');

var _sizing2 = _interopRequireDefault(_sizing);

var _priorityQueue = require('./priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PackingAlgorithm = (function () {
    function PackingAlgorithm(_ref) {
        var _ref$elements = _ref.elements;
        var elements = _ref$elements === undefined ? [] : _ref$elements;
        var _ref$rowHeight = _ref.rowHeight;
        var rowHeight = _ref$rowHeight === undefined ? 10 : _ref$rowHeight;
        var _ref$columnWidth = _ref.columnWidth;
        var columnWidth = _ref$columnWidth === undefined ? 10 : _ref$columnWidth;
        var _ref$units = _ref.units;
        _ref$units = _ref$units === undefined ? {} : _ref$units;
        var _ref$units$width = _ref$units.width;
        var width = _ref$units$width === undefined ? 'px' : _ref$units$width;
        var _ref$units$height = _ref$units.height;
        var height = _ref$units$height === undefined ? 'px' : _ref$units$height;
        var getWidth = _ref.getWidth;

        _classCallCheck(this, PackingAlgorithm);

        this.placedElements = [];
        this.width = getWidth();
        this.columnsNumber = Math.floor(columnWidth, this.width);

        this.elementsToBePlaced = elements.map(function (_ref2, arrayIndex) {
            var width = _ref2.width;
            var height = _ref2.height;
            var index = _ref2.index;
            return {
                columnSpan: _getColumnSpan(width),
                rowSpan: _getRowSpan(height),
                index: index || arrayIndex
            };
        }).sort((0, _comparer.compareAscBy)('columnSpan', 'index', 'rowSpan'));

        this.possiblePlaces = [{
            columnSpan: this.columnsNumber,
            columnOffset: 0,
            rowOffset: 0,
            rowSpan: Number.MAX_VALUE }];

        // Guard.
        this.gaps = [];
    }

    _createClass(PackingAlgorithm, [{
        key: 'stepForward',
        value: function stepForward() {
            if (this.elementsToBePlaced.length <= 0) {
                return;
            }

            var _calculateBestPossibl = this.calculateBestPossiblePlace(this.possiblePlaces);

            var bestPossiblePlace = _calculateBestPossibl.bestPossiblePlace;
            var bestPossiblePlaceIndex = _calculateBestPossibl.index;

            var _findElementThatFits = this.findElementThatFits(this.elementsToBePlaced, bestPossiblePlace);

            var elementThatFits = _findElementThatFits.element;
            var elementThatFitsIndex = _findElementThatFits.index;

            if (elementThatFits === null) {
                // TODO: add replacement
                var gap = this.positionGapAtPlace(bestPossiblePlace, this.possiblePlaces);
                this.gaps.push(gap);

                this.possiblePlaces.splice(bestPossiblePlaceIndex, 1);
                // TODO: check if there is possibility to last with no possible places
                // and if there is a way to avoid or handle it
                return;
            }

            var positionedElement = this.positionElementAtPlace(elementThatFits, bestPossiblePlace);
            this.placedElements.push(positionedElement);
            this.elementsToBePlaced.splice(elementThatFitsIndex, 1);

            this.possiblePlaces = this.calculateNewPossiblePlaces(this.possiblePlaces, positionedElement);
        }
    }, {
        key: 'pack',
        value: function pack() {
            var elementsToBePlaced = this.elementsToBePlaced;
            var placedElements = [];
            var gaps = [];
            var leaves = [];
            var possiblePlaces = this.possiblePlaces;

            while (elementsToBePlaced.length > 0) {
                var _calculateBestPossibl2 = this.calculateBestPossiblePlace(possiblePlaces);

                var bestPossiblePlace = _calculateBestPossibl2.bestPossiblePlace;
                var bestPossiblePlaceIndex = _calculateBestPossibl2.index;

                var _findElementThatFits2 = this.findElementThatFits(elementsToBePlaced, bestPossiblePlace);

                var elementThatFits = _findElementThatFits2.element;
                var elementThatFitsIndex = _findElementThatFits2.index;

                if (elementThatFits === null) {
                    // TODO: add replacement
                    var gap = this.positionGapAtPlace(bestPossiblePlace, possiblePlaces);
                    gaps.push(gap);

                    // // TODO: Check if it is needed
                    // leaves.push(gap);

                    possiblePlaces.splice(bestPossiblePlaceIndex, 1);
                    // TODO: check if there is possibility to last with no possible places
                    // and if there is a way to avoid or handle it
                    continue;
                }

                var positionedElement = this.positionElementAtPlace(elementThatFits, bestPossiblePlace);
                placedElements.push(positionedElement);
                elementsToBePlaced.splice(elementThatFitsIndex, 1);

                // let closedLeaves = this.getElementsClosedByPlacedElement(placedElement, leaves);
                // leaves = leaves.filter(leaf => !closedLeaves.some(closedLeaf => closedLeaf === leaf));
                // leaves.push(positionedElement);

                possiblePlaces = this.calculateNewPossiblePlaces(possiblePlaces, positionedElement);
            }
        }
    }, {
        key: 'calculateBestPossiblePlace',
        value: function calculateBestPossiblePlace(placedElement, possiblePlaces) {
            return possiblePlaces.reduce(function (currentBest, candidate, i) {
                var betterPlace = (0, _comparer.lesser)(currentBest, candidate, 'rowOffset', 'columnOffset');
                return betterPlace === currentBest ? { bestPossiblePlace: currentBest, index: i - 1 } : { bestPossiblePlace: candidate, index: i };
            });
        }
    }, {
        key: 'findElementThatFits',
        value: function findElementThatFits(elements, place) {
            // Assume that elements are sorted by width, index
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].columnSpan <= place.columnSpan) {
                    return { element: elements[i], index: i };
                }
            }

            // Nothing found.
            return { element: null };
        }
    }, {
        key: 'positionElementAtPlace',
        value: function positionElementAtPlace(element, place) {
            return {
                rowOffset: place.rowOffset,
                columnOffset: place.columnOffset,
                rowSpan: element.rowSpan,
                columnSpan: element.columnSpan
            };
        }
    }, {
        key: 'positionGapAtPlace',
        value: function positionGapAtPlace(place, possiblePlaces) {
            var _place;

            var gap = (_place = place, rowOffset = _place.rowOffset, columnOffset = _place.columnOffset, rowSpan = _place.rowSpan, columnSpan = _place.columnSpan, _place);

            //TODO: get row span based on closest other place that is below given place

            return gap;
        }
    }, {
        key: 'calculateNewPossiblePlaces',
        value: function calculateNewPossiblePlaces(places, positionedElement) {
            var _this = this;

            var currentPlaces = [];
            var placeAfterPositionedElement = this.getPlaceAfterPositionedElement(positionedElement, places);
            var isPlaceAfterPositionedElementJoined = false;

            // const newPlaces = places.reduce((newPlaces, place) => {
            //     return this.isColliding(place, positionedElement) ?
            //         this.breakPlaceByPositionedElement(place, positionedElement) :
            //         [place];
            // }, []);

            // placeAfterPositionedElement = this.extendPlaceToMaxWidth(placeAfterPositionedElement, leaves);

            var newPlaces = places.reduce(function (newPlaces, place) {
                var places = newPlaces.concat([]);

                if (_this.isColliding(place, positionedElement)) {
                    var brokenPlaces = _this.breakPlaceByPositionedElement(place, positionedElement);
                    places = places.concat(brokenPlaces);
                }

                if (isPlaceAfterPositionedElementJoined) {
                    return places;
                }

                if (_this.hasJoin(place, placeAfterPositionedElement)) {
                    isPlaceAfterPositionedElementJoined = true;
                    places = places.concat(_this.joinPlaces(place, placeAfterPositionedElement));
                } else if (_this.isColliding(place, placeAfterPositionedElement)) {
                    // We assume that possible places are sorted by rowOffset ascending
                    // so this is the first place before place after positioned element
                    // and we can extend new place to closest but closer to begin place's width
                    placeAfterPositionedElement.columnSpan = place.columnSpan;
                    places.push(placeAfterPositionedElement);
                    isPlaceAfterPositionedElementJoined = true;
                }

                return places;

                // if (this.hasJoin(place, placeAfterPositionedElement)) {
                //     // We are not yet adding this new joined place as there can be another
                //     // place that will join to these (e. g. there was a hole that is now filled).
                //     placeAfterPositionedElement = this.joinPlaces(place, placeAfterPositionedElement);
                //     return newPlaces;
                // } else {
                //     return newPlaces.concat([place]);
                // }
            }, []);

            // New element is most distant, so we extend new place to a whole line
            // with container width.
            if (isPlaceAfterPositionedElementJoined) {
                placeAfterPositionedElement.columnSpan = this.columnsNumber;
                placeAfterPositionedElement.columnOffset = 0;
            }

            // // If there is no other place that is beyond place after element that has just
            // // been placed it means that new element is most distant, so we extend new place
            // // to a whole line with container width.
            // if (!newPlaces.some(place => place.rowOffset > placeAfterPositionedElement.rowOffset)) {
            //     placeAfterPositionedElement.columnSpan = this.columnsNumber;
            //     placeAfterPositionedElement.columnOffset = 0;
            // }

            newPlaces.push(placeAfterPositionedElement);

            return newPlaces;
        }
    }, {
        key: 'isColliding',
        value: function isColliding(element, otherElement) {
            var isBetween = function isBetween(value, firstEdge, secondEdge) {
                return value > firstEdge && value < secondEdge;
            };

            var doesContain = function doesContain(x1, x2, y1, y2) {
                return y1 <= x1 && y2 >= x2;
            };

            var horizontalEdges = function horizontalEdges(element) {
                return {
                    left: element.columnOffset,
                    right: element.columnOffset + element.columnSpan
                };
            };

            var verticalEdges = function verticalEdges(element) {
                return {
                    top: element.rowOffset,
                    bottom: element.rowOffset + element.rowSpan
                };
            };

            var isCollidingAtAxis = function isCollidingAtAxis(xFirstEdge, xSecondEdge, yFirstEdge, ySecondEdge) {
                return isBetween(yFirstEdge, xFirstEdge, xSecondEdge) || isBetween(ySecondEdge, xFirstEdge, xSecondEdge) || doesContain(xSecondEdge, ySecondEdge, xFirstEdge, yFirstEdge) || doesContain(xFirstEdge, yFirstEdge, xSecondEdge, ySecondEdge);
            };

            var _horizontalEdges = horizontalEdges(element);

            var leftEdge = _horizontalEdges.left;
            var rightEdge = _horizontalEdges.right;

            var _horizontalEdges2 = horizontalEdges(otherElement);

            var otherLeftEdge = _horizontalEdges2.left;
            var otherRightEdge = _horizontalEdges2.right;

            var _verticalEdges = verticalEdges(element);

            var topEdge = _verticalEdges.top;
            var bottomEdge = _verticalEdges.bottom;

            var _verticalEdges2 = verticalEdges(otherElement);

            var otherTopEdge = _verticalEdges2.top;
            var otherBottomEdge = _verticalEdges2.bottom;

            return isCollidingAtAxis(leftEdge, rightEdge, otherLeftEdge, otherRightEdge) && isCollidingAtAxis(topEdge, bottomEdge, otherTopEdge, otherBottomEdge);
        }
    }, {
        key: 'breakPlaceByPositionedElement',
        value: function breakPlaceByPositionedElement(place, positionedElement) {
            var newPlaces = [];

            var leftColumnSpan = positionedElement.columnOffset - place.columnOffset;
            if (leftColumnSpan > 0) {
                newPlaces.push({
                    rowOffset: place.rowOffset,
                    columnOffset: place.columnOffset,
                    rowSpan: place.rowSpan,
                    columnSpan: leftColumnSpan
                });
            }

            var rightColumnSpan = place.columnOffset + place.columnSpan - (positionedElement.columnOffset + positionedElement.columnSpan);
            if (rightColumnSpan) {
                newPlaces.push({
                    rowOffset: place.rowOffset,
                    columnOffset: positionedElement.columnOffset,
                    rowSpan: place.rowSpan,
                    columnSpan: rightColumnSpan
                });
            }
        }
    }, {
        key: 'getPlaceAfterPositionedElement',
        value: function getPlaceAfterPositionedElement(element, places) {
            return {
                rowOffset: element.rowOffset,
                columnOffset: element.columnOffset + element.rowSpan,
                columnSpan: element.columnSpan,
                rowSpan: Number.MAX_VALUE
            };
        }

        // getElementsClosedByPlacedElement(placedElement, leaves) {

        // }

    }, {
        key: '_getColumnSpan',
        value: function _getColumnSpan(element) {
            return _sizing2.default.getColumnSpan(element.width, this.columnWidth);
        }
    }, {
        key: '_getRowSpan',
        value: function _getRowSpan(element) {
            return _sizing2.default._getRowSpan(element.height, this.rowHeight);
        }
    }]);

    return PackingAlgorithm;
})();

exports.default = PackingAlgorithm;

},{"./comparer":1,"./priority-queue":3,"./sizing":4}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _comparer = require('./comparer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PriorityQueue = function PriorityQueue() {
    _classCallCheck(this, PriorityQueue);
};

//TODO real implementation

var MultiplePrioritiesQueue = (function () {
    function MultiplePrioritiesQueue() {
        var elements = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, MultiplePrioritiesQueue);

        this.elements = elements;
    }

    _createClass(MultiplePrioritiesQueue, [{
        key: 'first',
        value: function first() {
            for (var _len = arguments.length, priorities = Array(_len), _key = 0; _key < _len; _key++) {
                priorities[_key] = arguments[_key];
            }

            //TODO real implementation with PriorityQueue
            return this.elements.map(identity).sort(_comparer.compareAscBy.apply(null, priorities))[0];
        }
    }, {
        key: 'greaterThan',
        value: function greaterThan(element) {
            for (var _len2 = arguments.length, priorities = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                priorities[_key2 - 1] = arguments[_key2];
            }

            return this.elements.map(identity).sort(_comparer.compareDescBy.apply(null, priorities)).filter(function (sortedElement) {
                return (0, _comparer.compareDescBy)(priorities)(sortedElement, element);
            });
        }
    }, {
        key: 'lesserThan',
        value: function lesserThan(element) {
            for (var _len3 = arguments.length, priorities = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                priorities[_key3 - 1] = arguments[_key3];
            }

            return this.elements.map(identity).sort(_comparer.compareAscBy.apply(null, priorities)).filter(function (sortedElement) {
                return (0, _comparer.compareAscBy)(priorities)(sortedElement, element);
            });
        }
    }]);

    return MultiplePrioritiesQueue;
})();

exports.default = MultiplePrioritiesQueue;

function identity(x) {
    return x;
}

},{"./comparer":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    getColumnSpan: function getColumnSpan(elementWidth, columnWidth) {
        return Math.ceil(elementWidth / columnWidth);
    },
    getRowSpan: function getRowSpan(elementHeight, rowHeight) {
        return Math.ceil(elementHeight / rowHeight);
    }
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcGFyZXIuanMiLCJzcmMvcGFja2luZy1hbGdvcml0aG0uanMiLCJzcmMvcHJpb3JpdHktcXVldWUuanMiLCJzcmMvc2l6aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNBUyxZQUFZLEdBQVosWUFBWTtRQUFFLGFBQWEsR0FBYixhQUFhO1FBQUUsTUFBTSxHQUFOLE1BQU07UUFBRSxPQUFPLEdBQVAsT0FBTzs7QUFFckQsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBWTtzQ0FBUCxLQUFLO0FBQUwsYUFBSzs7O0FBQzNCLFdBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNuRDs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFZO3VDQUFQLEtBQUs7QUFBTCxhQUFLOzs7QUFDMUIsV0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2xEOztBQUVELFNBQVMsWUFBWSxHQUFXO3VDQUFQLEtBQUs7QUFBTCxhQUFLOzs7QUFDMUIsV0FBTyxVQUFDLENBQUMsRUFBRSxDQUFDO2VBQUssQ0FBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxBQUFDO0tBQUEsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLGFBQWEsR0FBVzt1Q0FBUCxLQUFLO0FBQUwsYUFBSzs7O0FBQzNCLFdBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzFCOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNyQixXQUFPLFVBQUMsQ0FBQyxF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QUFDLFlBQVksR0FBRyxXQUFXLENBQUMsQ0FBQztLQUNoRDtBQUVELGNBQVUsc0JBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRTtBQUNqQyxlQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0tBQy9DO0NBQ0oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IHsgY29tcGFyZUFzY0J5LCBjb21wYXJlRGVzY0J5LCBsZXNzZXIsIGdyZWF0ZXIgfTtcblxuZnVuY3Rpb24gZ3JlYXRlcihhLCBiLCAuLi5wcm9wcykge1xuICAgIHJldHVybiBjb21wYXJlRGVzY0J5KHByb3BzKShhLCBiKSA9PT0gMSA/IGEgOiBiO1xufVxuXG5mdW5jdGlvbiBsZXNzZXIoYSwgYiwgLi4ucHJvcHMpIHtcbiAgICByZXR1cm4gY29tcGFyZUFzY0J5KHByb3BzKShhLCBiKSA9PT0gMSA/IGEgOiBiO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlQXNjQnkoLi4ucHJvcHMpIHtcbiAgICByZXR1cm4gKGEsIGIpID0+IC0oY29tcGFyZXIocHJvcHMpKGEsIGIpKTtcbn1cblxuZnVuY3Rpb24gY29tcGFyZURlc2NCeSguLi5wcm9wcykge1xuICAgIHJldHVybiBjb21wYXJlcihwcm9wcyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVyKHByb3BzKSB7XG4gICAgcmV0dXJuIChhLCBiKSA9PiB7XG4gICAgICAgIGxldCBpc0dyZWF0ZXIgPSAoeCwgeSkgPT4geCA+IHk7XG4gICAgICAgIGxldCBpc1NtYWxsZXIgPSAoeCwgeSkgPT4geCA8IHk7XG5cbiAgICAgICAgbGV0IHsgcmVzdWx0OiBpc0FHcmVhdGVyIH0gPSBjb21wYXJlKHsgaXNHcmVhdGVyLCBpc1NtYWxsZXIsIGEsIGIsIHByb3BzIH0pO1xuICAgICAgICBpZiAoaXNBR3JlYXRlciA9PT0gMSkgcmV0dXJuIDE7XG5cbiAgICAgICAgbGV0IHsgcmVzdWx0OiBpc0JHcmVhdGVyIH0gPSBjb21wYXJlKHtcbiAgICAgICAgICAgIGlzR3JlYXRlcjogaXNTbWFsbGVyLFxuICAgICAgICAgICAgaXNTbWFsbGVyOiBpc0dyZWF0ZXIsXG4gICAgICAgICAgICBhLCBiLCBwcm9wc1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzQkdyZWF0ZXIgPT09IDEpIHJldHVybiAtMTtcblxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmUoeyBpc0dyZWF0ZXIsIGlzU21hbGxlciwgYSwgYiwgcHJvcHMgfSkge1xuICAgIHJldHVybiBwcm9wcy5yZWR1Y2UoKHsgcmVzdWx0LCBwcm9wMSB9LCBwcm9wMikgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ID09PSAxIHx8IHJlc3VsdCA9PT0gLTEpIHJldHVybiB7IHJlc3VsdCB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpcnN0IHByb3Agb25seSB0aGUgZmlyc3QgdGltZSBhcyBvbiBldmVyeSBvdGhlciBcbiAgICAgICAgICAgIC8vIGl0ZXJhdGlvbiBpdCB3aWxsIGJlIGNoZWNrZWQgYXMgcHJvcDJcbiAgICAgICAgICAgIGlmIChpc0dyZWF0ZXIoYVtwcm9wMV0sIGJbcHJvcDFdKSkgcmV0dXJuIHsgcmVzdWx0OiAxIH07XG4gICAgICAgICAgICBpZiAoaXNTbWFsbGVyKGFbcHJvcDFdLCBiW3Byb3AxXSkpIHJldHVybiB7IHJlc3VsdDogLTEgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0dyZWF0ZXIoYVtwcm9wMl0sIGJbcHJvcDJdKSkgcmV0dXJuIHsgcmVzdWx0OiAxIH07XG4gICAgICAgIGlmIChpc1NtYWxsZXIoYVtwcm9wMl0sIGJbcHJvcDJdKSkgcmV0dXJuIHsgcmVzdWx0OiAtMSB9O1xuICAgICAgICByZXR1cm4geyByZXN1bHQ6IDAsIHByb3AxOiBwcm9wMiB9O1xuICAgIH0sIHsgcmVzdWx0OiBudWxsLCBwcm9wMTogJ3VuZGVmaW5lZCd9KTtcbn1cbiIsImltcG9ydCB7IGNvbXBhcmVBc2NCeSwgY29tcGFyZURlc2NCeSwgZ3JlYXRlciwgbGVzc2VyIH0gZnJvbSAnLi9jb21wYXJlcic7XG5pbXBvcnQgU2l6aW5nIGZyb20gJy4vc2l6aW5nJztcbmltcG9ydCBNdWx0aXBsZVByaW9yaXRlc1F1ZXVlIGZyb20gJy4vcHJpb3JpdHktcXVldWUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWNraW5nQWxnb3JpdGhtIHtcbiAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgIGVsZW1lbnRzID0gW10sXG4gICAgICAgIHJvd0hlaWdodCA9IDEwLFxuICAgICAgICBjb2x1bW5XaWR0aCA9IDEwLFxuICAgICAgICB1bml0czoge1xuICAgICAgICAgICAgd2lkdGggPSAncHgnLFxuICAgICAgICAgICAgaGVpZ2h0ID0gJ3B4J1xuICAgICAgICB9ID0ge30sXG4gICAgICAgIGdldFdpZHRoXG4gICAgfSkge1xuXG4gICAgICAgIHRoaXMucGxhY2VkRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy53aWR0aCA9IGdldFdpZHRoKCk7XG4gICAgICAgIHRoaXMuY29sdW1uc051bWJlciA9IE1hdGguZmxvb3IoY29sdW1uV2lkdGgsIHRoaXMud2lkdGgpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudHNUb0JlUGxhY2VkID0gZWxlbWVudHNcbiAgICAgICAgICAgIC5tYXAoKHsgd2lkdGgsIGhlaWdodCwgaW5kZXggfSwgYXJyYXlJbmRleCkgPT4gKHsgXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblNwYW46IF9nZXRDb2x1bW5TcGFuKHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgcm93U3BhbjogX2dldFJvd1NwYW4oaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4IHx8IGFycmF5SW5kZXggXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAuc29ydChjb21wYXJlQXNjQnkoJ2NvbHVtblNwYW4nLCAnaW5kZXgnLCAncm93U3BhbicpKTtcblxuXG4gICAgICAgIHRoaXMucG9zc2libGVQbGFjZXMgPSBbe1xuICAgICAgICAgICAgY29sdW1uU3BhbjogdGhpcy5jb2x1bW5zTnVtYmVyLFxuICAgICAgICAgICAgY29sdW1uT2Zmc2V0OiAwLFxuICAgICAgICAgICAgcm93T2Zmc2V0OiAwLFxuICAgICAgICAgICAgcm93U3BhbjogTnVtYmVyLk1BWF9WQUxVRSwgLy8gR3VhcmQuXG4gICAgICAgIH1dO1xuXG5cbiAgICAgICAgdGhpcy5nYXBzID0gW107XG4gICAgfVxuXG4gICAgc3RlcEZvcndhcmQoKSB7XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRzVG9CZVBsYWNlZC5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHsgYmVzdFBvc3NpYmxlUGxhY2UsIGluZGV4OiBiZXN0UG9zc2libGVQbGFjZUluZGV4IH0gPVxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVCZXN0UG9zc2libGVQbGFjZSh0aGlzLnBvc3NpYmxlUGxhY2VzKTtcblxuICAgICAgICBsZXQgeyBlbGVtZW50OiBlbGVtZW50VGhhdEZpdHMsIGluZGV4OiBlbGVtZW50VGhhdEZpdHNJbmRleCB9ID1cbiAgICAgICAgICAgIHRoaXMuZmluZEVsZW1lbnRUaGF0Rml0cyh0aGlzLmVsZW1lbnRzVG9CZVBsYWNlZCwgYmVzdFBvc3NpYmxlUGxhY2UpO1xuXG4gICAgICAgIGlmIChlbGVtZW50VGhhdEZpdHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCByZXBsYWNlbWVudFxuICAgICAgICAgICAgY29uc3QgZ2FwID0gdGhpcy5wb3NpdGlvbkdhcEF0UGxhY2UoYmVzdFBvc3NpYmxlUGxhY2UsIHRoaXMucG9zc2libGVQbGFjZXMpO1xuICAgICAgICAgICAgdGhpcy5nYXBzLnB1c2goZ2FwKTtcblxuICAgICAgICAgICAgdGhpcy5wb3NzaWJsZVBsYWNlcy5zcGxpY2UoYmVzdFBvc3NpYmxlUGxhY2VJbmRleCwgMSk7XG4gICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiB0aGVyZSBpcyBwb3NzaWJpbGl0eSB0byBsYXN0IHdpdGggbm8gcG9zc2libGUgcGxhY2VzXG4gICAgICAgICAgICAvLyBhbmQgaWYgdGhlcmUgaXMgYSB3YXkgdG8gYXZvaWQgb3IgaGFuZGxlIGl0XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcG9zaXRpb25lZEVsZW1lbnQgPSB0aGlzLnBvc2l0aW9uRWxlbWVudEF0UGxhY2UoZWxlbWVudFRoYXRGaXRzLCBiZXN0UG9zc2libGVQbGFjZSk7XG4gICAgICAgIHRoaXMucGxhY2VkRWxlbWVudHMucHVzaChwb3NpdGlvbmVkRWxlbWVudCk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNUb0JlUGxhY2VkLnNwbGljZShlbGVtZW50VGhhdEZpdHNJbmRleCwgMSk7XG5cbiAgICAgICAgdGhpcy5wb3NzaWJsZVBsYWNlcyA9IHRoaXMuY2FsY3VsYXRlTmV3UG9zc2libGVQbGFjZXModGhpcy5wb3NzaWJsZVBsYWNlcywgcG9zaXRpb25lZEVsZW1lbnQpO1xuICAgIH1cblxuICAgIHBhY2soKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzVG9CZVBsYWNlZCA9IHRoaXMuZWxlbWVudHNUb0JlUGxhY2VkO1xuICAgICAgICBjb25zdCBwbGFjZWRFbGVtZW50cyA9IFtdO1xuICAgICAgICBjb25zdCBnYXBzID0gW107XG4gICAgICAgIGxldCBsZWF2ZXMgPSBbXTtcbiAgICAgICAgbGV0IHBvc3NpYmxlUGxhY2VzID0gdGhpcy5wb3NzaWJsZVBsYWNlcztcblxuICAgICAgICB3aGlsZSAoZWxlbWVudHNUb0JlUGxhY2VkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCB7IGJlc3RQb3NzaWJsZVBsYWNlLCBpbmRleDogYmVzdFBvc3NpYmxlUGxhY2VJbmRleCB9ID1cbiAgICAgICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUJlc3RQb3NzaWJsZVBsYWNlKHBvc3NpYmxlUGxhY2VzKTtcblxuICAgICAgICAgICAgbGV0IHsgZWxlbWVudDogZWxlbWVudFRoYXRGaXRzLCBpbmRleDogZWxlbWVudFRoYXRGaXRzSW5kZXggfSA9XG4gICAgICAgICAgICAgICAgdGhpcy5maW5kRWxlbWVudFRoYXRGaXRzKGVsZW1lbnRzVG9CZVBsYWNlZCwgYmVzdFBvc3NpYmxlUGxhY2UpO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudFRoYXRGaXRzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIHJlcGxhY2VtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZ2FwID0gdGhpcy5wb3NpdGlvbkdhcEF0UGxhY2UoYmVzdFBvc3NpYmxlUGxhY2UsIHBvc3NpYmxlUGxhY2VzKTtcbiAgICAgICAgICAgICAgICBnYXBzLnB1c2goZ2FwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyAvLyBUT0RPOiBDaGVjayBpZiBpdCBpcyBuZWVkZWRcbiAgICAgICAgICAgICAgICAvLyBsZWF2ZXMucHVzaChnYXApO1xuXG4gICAgICAgICAgICAgICAgcG9zc2libGVQbGFjZXMuc3BsaWNlKGJlc3RQb3NzaWJsZVBsYWNlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIHBvc3NpYmlsaXR5IHRvIGxhc3Qgd2l0aCBubyBwb3NzaWJsZSBwbGFjZXNcbiAgICAgICAgICAgICAgICAvLyBhbmQgaWYgdGhlcmUgaXMgYSB3YXkgdG8gYXZvaWQgb3IgaGFuZGxlIGl0XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbmVkRWxlbWVudCA9IHRoaXMucG9zaXRpb25FbGVtZW50QXRQbGFjZShlbGVtZW50VGhhdEZpdHMsIGJlc3RQb3NzaWJsZVBsYWNlKTtcbiAgICAgICAgICAgIHBsYWNlZEVsZW1lbnRzLnB1c2gocG9zaXRpb25lZEVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudHNUb0JlUGxhY2VkLnNwbGljZShlbGVtZW50VGhhdEZpdHNJbmRleCwgMSk7XG5cbiAgICAgICAgICAgIC8vIGxldCBjbG9zZWRMZWF2ZXMgPSB0aGlzLmdldEVsZW1lbnRzQ2xvc2VkQnlQbGFjZWRFbGVtZW50KHBsYWNlZEVsZW1lbnQsIGxlYXZlcyk7XG4gICAgICAgICAgICAvLyBsZWF2ZXMgPSBsZWF2ZXMuZmlsdGVyKGxlYWYgPT4gIWNsb3NlZExlYXZlcy5zb21lKGNsb3NlZExlYWYgPT4gY2xvc2VkTGVhZiA9PT0gbGVhZikpO1xuICAgICAgICAgICAgLy8gbGVhdmVzLnB1c2gocG9zaXRpb25lZEVsZW1lbnQpO1xuXG4gICAgICAgICAgICBwb3NzaWJsZVBsYWNlcyA9IHRoaXMuY2FsY3VsYXRlTmV3UG9zc2libGVQbGFjZXMocG9zc2libGVQbGFjZXMsIHBvc2l0aW9uZWRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZUJlc3RQb3NzaWJsZVBsYWNlKHBsYWNlZEVsZW1lbnQsIHBvc3NpYmxlUGxhY2VzKSB7XG4gICAgICAgIHJldHVybiBwb3NzaWJsZVBsYWNlcy5yZWR1Y2UoKGN1cnJlbnRCZXN0LCBjYW5kaWRhdGUsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJldHRlclBsYWNlID0gbGVzc2VyKGN1cnJlbnRCZXN0LCBjYW5kaWRhdGUsICdyb3dPZmZzZXQnLCAnY29sdW1uT2Zmc2V0Jyk7XG4gICAgICAgICAgICByZXR1cm4gYmV0dGVyUGxhY2UgPT09IGN1cnJlbnRCZXN0ID9cbiAgICAgICAgICAgICAgICB7IGJlc3RQb3NzaWJsZVBsYWNlOiBjdXJyZW50QmVzdCwgaW5kZXg6IGkgLSAxIH0gOlxuICAgICAgICAgICAgICAgIHsgYmVzdFBvc3NpYmxlUGxhY2U6IGNhbmRpZGF0ZSwgaW5kZXg6IGkgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmluZEVsZW1lbnRUaGF0Rml0cyhlbGVtZW50cywgcGxhY2UpIHtcbiAgICAgICAgLy8gQXNzdW1lIHRoYXQgZWxlbWVudHMgYXJlIHNvcnRlZCBieSB3aWR0aCwgaW5kZXhcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzW2ldLmNvbHVtblNwYW4gPD0gcGxhY2UuY29sdW1uU3Bhbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGVsZW1lbnQ6IGVsZW1lbnRzW2ldLCBpbmRleDogaSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90aGluZyBmb3VuZC5cbiAgICAgICAgcmV0dXJuIHsgZWxlbWVudDogbnVsbCB9O1xuICAgIH1cblxuICAgIHBvc2l0aW9uRWxlbWVudEF0UGxhY2UoZWxlbWVudCwgcGxhY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJvd09mZnNldDogcGxhY2Uucm93T2Zmc2V0LFxuICAgICAgICAgICAgY29sdW1uT2Zmc2V0OiBwbGFjZS5jb2x1bW5PZmZzZXQsXG4gICAgICAgICAgICByb3dTcGFuOiBlbGVtZW50LnJvd1NwYW4sXG4gICAgICAgICAgICBjb2x1bW5TcGFuOiBlbGVtZW50LmNvbHVtblNwYW4sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcG9zaXRpb25HYXBBdFBsYWNlKHBsYWNlLCBwb3NzaWJsZVBsYWNlcykge1xuICAgICAgICBjb25zdCBnYXAgPSAoe1xuICAgICAgICAgICAgcm93T2Zmc2V0LFxuICAgICAgICAgICAgY29sdW1uT2Zmc2V0LFxuICAgICAgICAgICAgcm93U3BhbixcbiAgICAgICAgICAgIGNvbHVtblNwYW4gXG4gICAgICAgIH0gPSBwbGFjZSk7XG5cbiAgICAgICAgLy9UT0RPOiBnZXQgcm93IHNwYW4gYmFzZWQgb24gY2xvc2VzdCBvdGhlciBwbGFjZSB0aGF0IGlzIGJlbG93IGdpdmVuIHBsYWNlXG5cbiAgICAgICAgcmV0dXJuIGdhcDtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVOZXdQb3NzaWJsZVBsYWNlcyhwbGFjZXMsIHBvc2l0aW9uZWRFbGVtZW50KSB7XG4gICAgICAgIGxldCBjdXJyZW50UGxhY2VzID0gW107XG4gICAgICAgIGxldCBwbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQgPSB0aGlzLmdldFBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudChwb3NpdGlvbmVkRWxlbWVudCwgcGxhY2VzKTtcbiAgICAgICAgbGV0IGlzUGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50Sm9pbmVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gY29uc3QgbmV3UGxhY2VzID0gcGxhY2VzLnJlZHVjZSgobmV3UGxhY2VzLCBwbGFjZSkgPT4ge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRpbmcocGxhY2UsIHBvc2l0aW9uZWRFbGVtZW50KSA/XG4gICAgICAgIC8vICAgICAgICAgdGhpcy5icmVha1BsYWNlQnlQb3NpdGlvbmVkRWxlbWVudChwbGFjZSwgcG9zaXRpb25lZEVsZW1lbnQpIDpcbiAgICAgICAgLy8gICAgICAgICBbcGxhY2VdO1xuICAgICAgICAvLyB9LCBbXSk7XG5cbiAgICAgICAgLy8gcGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50ID0gdGhpcy5leHRlbmRQbGFjZVRvTWF4V2lkdGgocGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50LCBsZWF2ZXMpO1xuXG4gICAgICAgIGNvbnN0IG5ld1BsYWNlcyA9IHBsYWNlcy5yZWR1Y2UoKG5ld1BsYWNlcywgcGxhY2UpID0+IHtcbiAgICAgICAgICAgIGxldCBwbGFjZXMgPSBuZXdQbGFjZXMuY29uY2F0KFtdKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNDb2xsaWRpbmcocGxhY2UsIHBvc2l0aW9uZWRFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJyb2tlblBsYWNlcyA9IHRoaXMuYnJlYWtQbGFjZUJ5UG9zaXRpb25lZEVsZW1lbnQocGxhY2UsIHBvc2l0aW9uZWRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBwbGFjZXMgPSBwbGFjZXMuY29uY2F0KGJyb2tlblBsYWNlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc1BsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudEpvaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwbGFjZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0pvaW4ocGxhY2UsIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBpc1BsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudEpvaW5lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcGxhY2VzID0gcGxhY2VzLmNvbmNhdCh0aGlzLmpvaW5QbGFjZXMocGxhY2UsIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQ29sbGlkaW5nKHBsYWNlLCBwbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgYXNzdW1lIHRoYXQgcG9zc2libGUgcGxhY2VzIGFyZSBzb3J0ZWQgYnkgcm93T2Zmc2V0IGFzY2VuZGluZ1xuICAgICAgICAgICAgICAgIC8vIHNvIHRoaXMgaXMgdGhlIGZpcnN0IHBsYWNlIGJlZm9yZSBwbGFjZSBhZnRlciBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAvLyBhbmQgd2UgY2FuIGV4dGVuZCBuZXcgcGxhY2UgdG8gY2xvc2VzdCBidXQgY2xvc2VyIHRvIGJlZ2luIHBsYWNlJ3Mgd2lkdGhcbiAgICAgICAgICAgICAgICBwbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQuY29sdW1uU3BhbiA9IHBsYWNlLmNvbHVtblNwYW47XG4gICAgICAgICAgICAgICAgcGxhY2VzLnB1c2gocGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBpc1BsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudEpvaW5lZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwbGFjZXM7XG5cbiAgICAgICAgICAgIC8vIGlmICh0aGlzLmhhc0pvaW4ocGxhY2UsIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudCkpIHtcbiAgICAgICAgICAgIC8vICAgICAvLyBXZSBhcmUgbm90IHlldCBhZGRpbmcgdGhpcyBuZXcgam9pbmVkIHBsYWNlIGFzIHRoZXJlIGNhbiBiZSBhbm90aGVyXG4gICAgICAgICAgICAvLyAgICAgLy8gcGxhY2UgdGhhdCB3aWxsIGpvaW4gdG8gdGhlc2UgKGUuIGcuIHRoZXJlIHdhcyBhIGhvbGUgdGhhdCBpcyBub3cgZmlsbGVkKS5cbiAgICAgICAgICAgIC8vICAgICBwbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQgPSB0aGlzLmpvaW5QbGFjZXMocGxhY2UsIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudCk7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIG5ld1BsYWNlcztcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIG5ld1BsYWNlcy5jb25jYXQoW3BsYWNlXSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0sIFtdKTtcblxuICAgICAgICAvLyBOZXcgZWxlbWVudCBpcyBtb3N0IGRpc3RhbnQsIHNvIHdlIGV4dGVuZCBuZXcgcGxhY2UgdG8gYSB3aG9sZSBsaW5lXG4gICAgICAgIC8vIHdpdGggY29udGFpbmVyIHdpZHRoLlxuICAgICAgICBpZiAoaXNQbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnRKb2luZWQpIHtcbiAgICAgICAgICAgIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudC5jb2x1bW5TcGFuID0gdGhpcy5jb2x1bW5zTnVtYmVyO1xuICAgICAgICAgICAgcGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50LmNvbHVtbk9mZnNldCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAvLyBJZiB0aGVyZSBpcyBubyBvdGhlciBwbGFjZSB0aGF0IGlzIGJleW9uZCBwbGFjZSBhZnRlciBlbGVtZW50IHRoYXQgaGFzIGp1c3RcbiAgICAgICAgLy8gLy8gYmVlbiBwbGFjZWQgaXQgbWVhbnMgdGhhdCBuZXcgZWxlbWVudCBpcyBtb3N0IGRpc3RhbnQsIHNvIHdlIGV4dGVuZCBuZXcgcGxhY2VcbiAgICAgICAgLy8gLy8gdG8gYSB3aG9sZSBsaW5lIHdpdGggY29udGFpbmVyIHdpZHRoLlxuICAgICAgICAvLyBpZiAoIW5ld1BsYWNlcy5zb21lKHBsYWNlID0+IHBsYWNlLnJvd09mZnNldCA+IHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudC5yb3dPZmZzZXQpKSB7XG4gICAgICAgIC8vICAgICBwbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQuY29sdW1uU3BhbiA9IHRoaXMuY29sdW1uc051bWJlcjtcbiAgICAgICAgLy8gICAgIHBsYWNlQWZ0ZXJQb3NpdGlvbmVkRWxlbWVudC5jb2x1bW5PZmZzZXQgPSAwO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgbmV3UGxhY2VzLnB1c2gocGxhY2VBZnRlclBvc2l0aW9uZWRFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gbmV3UGxhY2VzO1xuICAgIH1cblxuICAgIGlzQ29sbGlkaW5nKGVsZW1lbnQsIG90aGVyRWxlbWVudCkge1xuICAgICAgICBjb25zdCBpc0JldHdlZW4gPSAodmFsdWUsIGZpcnN0RWRnZSwgc2Vjb25kRWRnZSkgPT4gXG4gICAgICAgICAgICB2YWx1ZSA+IGZpcnN0RWRnZSAmJiB2YWx1ZSA8IHNlY29uZEVkZ2U7XG5cbiAgICAgICAgY29uc3QgZG9lc0NvbnRhaW4gPSAoeDEsIHgyLCB5MSwgeTIpID0+IHkxIDw9IHgxICYmIHkyID49IHgyO1xuXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxFZGdlcyA9IChlbGVtZW50KSA9PiAoe1xuICAgICAgICAgICAgbGVmdDogZWxlbWVudC5jb2x1bW5PZmZzZXQsXG4gICAgICAgICAgICByaWdodDogZWxlbWVudC5jb2x1bW5PZmZzZXQgKyBlbGVtZW50LmNvbHVtblNwYW4sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHZlcnRpY2FsRWRnZXMgPSAoZWxlbWVudCkgPT4gKHtcbiAgICAgICAgICAgIHRvcDogZWxlbWVudC5yb3dPZmZzZXQsXG4gICAgICAgICAgICBib3R0b206IGVsZW1lbnQucm93T2Zmc2V0ICsgZWxlbWVudC5yb3dTcGFuLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpc0NvbGxpZGluZ0F0QXhpcyA9ICh4Rmlyc3RFZGdlLCB4U2Vjb25kRWRnZSwgeUZpcnN0RWRnZSwgeVNlY29uZEVkZ2UpID0+XG4gICAgICAgICAgICBpc0JldHdlZW4oeUZpcnN0RWRnZSwgeEZpcnN0RWRnZSwgeFNlY29uZEVkZ2UpIHx8XG4gICAgICAgICAgICBpc0JldHdlZW4oeVNlY29uZEVkZ2UsIHhGaXJzdEVkZ2UsIHhTZWNvbmRFZGdlKSB8fFxuICAgICAgICAgICAgZG9lc0NvbnRhaW4oeFNlY29uZEVkZ2UsIHlTZWNvbmRFZGdlLCB4Rmlyc3RFZGdlLCB5Rmlyc3RFZGdlKSB8fFxuICAgICAgICAgICAgZG9lc0NvbnRhaW4oeEZpcnN0RWRnZSwgeUZpcnN0RWRnZSwgeFNlY29uZEVkZ2UsIHlTZWNvbmRFZGdlKTtcblxuICAgICAgICBjb25zdCB7IGxlZnQ6IGxlZnRFZGdlLCByaWdodDogcmlnaHRFZGdlIH0gPSBob3Jpem9udGFsRWRnZXMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHsgbGVmdDogb3RoZXJMZWZ0RWRnZSwgcmlnaHQ6IG90aGVyUmlnaHRFZGdlIH0gPSBob3Jpem9udGFsRWRnZXMob3RoZXJFbGVtZW50KTtcbiAgICAgICAgY29uc3QgeyB0b3A6IHRvcEVkZ2UsIGJvdHRvbTogYm90dG9tRWRnZSB9ID0gdmVydGljYWxFZGdlcyhlbGVtZW50KTtcbiAgICAgICAgY29uc3QgeyB0b3A6IG90aGVyVG9wRWRnZSwgYm90dG9tOiBvdGhlckJvdHRvbUVkZ2UgfSA9IHZlcnRpY2FsRWRnZXMob3RoZXJFbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gaXNDb2xsaWRpbmdBdEF4aXMobGVmdEVkZ2UsIHJpZ2h0RWRnZSwgb3RoZXJMZWZ0RWRnZSwgb3RoZXJSaWdodEVkZ2UpXG4gICAgICAgICAgICAmJiBpc0NvbGxpZGluZ0F0QXhpcyh0b3BFZGdlLCBib3R0b21FZGdlLCBvdGhlclRvcEVkZ2UsIG90aGVyQm90dG9tRWRnZSk7XG4gICAgfVxuXG4gICAgYnJlYWtQbGFjZUJ5UG9zaXRpb25lZEVsZW1lbnQocGxhY2UsIHBvc2l0aW9uZWRFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IG5ld1BsYWNlcyA9IFtdO1xuXG4gICAgICAgIHZhciBsZWZ0Q29sdW1uU3BhbiA9IHBvc2l0aW9uZWRFbGVtZW50LmNvbHVtbk9mZnNldCAtIHBsYWNlLmNvbHVtbk9mZnNldDtcbiAgICAgICAgaWYgKGxlZnRDb2x1bW5TcGFuID4gMCkge1xuICAgICAgICAgICAgbmV3UGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJvd09mZnNldDogcGxhY2Uucm93T2Zmc2V0LFxuICAgICAgICAgICAgICAgIGNvbHVtbk9mZnNldDogcGxhY2UuY29sdW1uT2Zmc2V0LFxuICAgICAgICAgICAgICAgIHJvd1NwYW46IHBsYWNlLnJvd1NwYW4sXG4gICAgICAgICAgICAgICAgY29sdW1uU3BhbjogbGVmdENvbHVtblNwYW4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByaWdodENvbHVtblNwYW4gPSAocGxhY2UuY29sdW1uT2Zmc2V0ICsgcGxhY2UuY29sdW1uU3BhbikgXG4gICAgICAgICAgICAtIChwb3NpdGlvbmVkRWxlbWVudC5jb2x1bW5PZmZzZXQgKyBwb3NpdGlvbmVkRWxlbWVudC5jb2x1bW5TcGFuKTtcbiAgICAgICAgaWYgKHJpZ2h0Q29sdW1uU3Bhbikge1xuICAgICAgICAgICAgbmV3UGxhY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJvd09mZnNldDogcGxhY2Uucm93T2Zmc2V0LFxuICAgICAgICAgICAgICAgIGNvbHVtbk9mZnNldDogcG9zaXRpb25lZEVsZW1lbnQuY29sdW1uT2Zmc2V0LFxuICAgICAgICAgICAgICAgIHJvd1NwYW46IHBsYWNlLnJvd1NwYW4sXG4gICAgICAgICAgICAgICAgY29sdW1uU3BhbjogcmlnaHRDb2x1bW5TcGFuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQbGFjZUFmdGVyUG9zaXRpb25lZEVsZW1lbnQoZWxlbWVudCwgcGxhY2VzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByb3dPZmZzZXQ6IGVsZW1lbnQucm93T2Zmc2V0LFxuICAgICAgICAgICAgY29sdW1uT2Zmc2V0OiBlbGVtZW50LmNvbHVtbk9mZnNldCArIGVsZW1lbnQucm93U3BhbixcbiAgICAgICAgICAgIGNvbHVtblNwYW46IGVsZW1lbnQuY29sdW1uU3BhbixcbiAgICAgICAgICAgIHJvd1NwYW46IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gZ2V0RWxlbWVudHNDbG9zZWRCeVBsYWNlZEVsZW1lbnQocGxhY2VkRWxlbWVudCwgbGVhdmVzKSB7XG5cbiAgICAvLyB9XG5cbiAgICBfZ2V0Q29sdW1uU3BhbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBTaXppbmcuZ2V0Q29sdW1uU3BhbihlbGVtZW50LndpZHRoLCB0aGlzLmNvbHVtbldpZHRoKTtcbiAgICB9XG5cbiAgICBfZ2V0Um93U3BhbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBTaXppbmcuX2dldFJvd1NwYW4oZWxlbWVudC5oZWlnaHQsIHRoaXMucm93SGVpZ2h0KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjb21wYXJlQXNjQnksIGNvbXBhcmVEZXNjQnksIGdyZWF0ZXIsIGxlc3NlciB9IGZyb20gJy4vY29tcGFyZXInO1xuXG5jbGFzcyBQcmlvcml0eVF1ZXVlIHtcbiAgICAvL1RPRE8gcmVhbCBpbXBsZW1lbnRhdGlvblxuICAgIFxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpcGxlUHJpb3JpdGllc1F1ZXVlIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50cyA9IFtdKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgICB9XG5cbiAgICBmaXJzdCguLi5wcmlvcml0aWVzKSB7XG4gICAgICAgIC8vVE9ETyByZWFsIGltcGxlbWVudGF0aW9uIHdpdGggUHJpb3JpdHlRdWV1ZVxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5tYXAoaWRlbnRpdHkpLnNvcnQoY29tcGFyZUFzY0J5LmFwcGx5KG51bGwsIHByaW9yaXRpZXMpKVswXTtcbiAgICB9XG5cbiAgICBncmVhdGVyVGhhbihlbGVtZW50LCAuLi5wcmlvcml0aWVzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLm1hcChpZGVudGl0eSlcbiAgICAgICAgICAgIC5zb3J0KGNvbXBhcmVEZXNjQnkuYXBwbHkobnVsbCwgcHJpb3JpdGllcykpXG4gICAgICAgICAgICAuZmlsdGVyKHNvcnRlZEVsZW1lbnQgPT4gY29tcGFyZURlc2NCeShwcmlvcml0aWVzKShzb3J0ZWRFbGVtZW50LCBlbGVtZW50KSk7XG4gICAgfVxuXG4gICAgbGVzc2VyVGhhbihlbGVtZW50LCAuLi5wcmlvcml0aWVzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLm1hcChpZGVudGl0eSlcbiAgICAgICAgICAgIC5zb3J0KGNvbXBhcmVBc2NCeS5hcHBseShudWxsLCBwcmlvcml0aWVzKSlcbiAgICAgICAgICAgIC5maWx0ZXIoc29ydGVkRWxlbWVudCA9PiBjb21wYXJlQXNjQnkocHJpb3JpdGllcykoc29ydGVkRWxlbWVudCwgZWxlbWVudCkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICAgIHJldHVybiB4O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICAgIGdldENvbHVtblNwYW4oZWxlbWVudFdpZHRoLCBjb2x1bW5XaWR0aCkge1xuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnRXaWR0aCAvIGNvbHVtbldpZHRoKTtcbiAgICB9LFxuXG4gICAgZ2V0Um93U3BhbihlbGVtZW50SGVpZ2h0LCByb3dIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50SGVpZ2h0IC8gcm93SGVpZ2h0KTtcbiAgICB9XG59OyJdfQ==

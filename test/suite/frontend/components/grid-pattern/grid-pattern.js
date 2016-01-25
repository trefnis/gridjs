(function() {
'use strict';

var stripTemplate = _.template(
    '<% var stripWidth = stripWidth || 1 %>' +
    'linear-gradient(${direction}, ${color} 0, ${color} ${stripWidth || 1}px, transparent 0, transparent ${width - (stripWidth || 1)}px)'
    );

var repeatingStripTemplate = _.template(
    '${strip} 0 0 / ${width}px ${height}px'
    );

angular
    .module('gridjs-test.grid-pattern', [])
    .factory('gridPattern', [gridPatternFactory]);

function gridPatternFactory() {
    return {
        getGridCss: getGridCss
    };
}

function getGridCss(width, height) {
    var color = '#666';

    var horizontalLines = repeatingStripTemplate({
        strip: stripTemplate({
            direction: 'to right',
            color: color,
            width: width,
        }),
        width: width,
        height: height,
    });

    var verticalLines = repeatingStripTemplate({
        strip: stripTemplate({
            direction: 'to bottom',
            color: color,
            width: width,
        }),
        width: width,
        height: height,
    });

    var rightLine = stripTemplate({
        direction: 'to left',
        color: color,
        width: width,
    });

    return {
        background: [horizontalLines, verticalLines, rightLine].join(',')
        // background: [rightLine].join(',')
    };
}

}());

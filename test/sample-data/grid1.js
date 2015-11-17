var grid1 = [
    { w: 2, h: 3 },
    { w: 2, h: 2 },
    { w: 3, h: 2 },
    { w: 3, h: 3 },
    { w: 2, h: 2 },
].map(createElement);

function createElement(el) {
    return {
        width: (100 * el.w) + 'px',
        height: (100 * el.h) + 'px'
    };
}

var positioned = [
    { top: 0, left: '0px' },
    { top: 0, left: '200px' },
    { top: 0, left: '400px' },
    { top: 0, left: '700px' },
    { top: 0, left: '1000px' },
].map(function(el, i) {
    el.width = grid1[i].width;
    el.height = grid1[i].height;
    return el;
});
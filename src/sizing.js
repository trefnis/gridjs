export default {
    getColumnSpan(elementWidth, columnWidth) {
        return Math.ceil(elementWidth / columnWidth);
    },

    getRowSpan(elementHeight, rowHeight) {
        return Math.ceil(elementHeight / rowHeight);
    }
};
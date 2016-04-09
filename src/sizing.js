export function getColumnSpan(elementWidth, columnWidth) {
    return Math.ceil(elementWidth / columnWidth);
}

export function getRowSpan(elementHeight, rowHeight) {
    return Math.ceil(elementHeight / rowHeight);
}

export function isColliding(element, otherElement) {
    const isBetween = (value, firstEdge, secondEdge) => 
        value > firstEdge && value < secondEdge;

    const doesContain = (x1, x2, y1, y2) => x1 <= y1 && x2 >= y2;

    const horizontalEdges = (element) => ({
        left: element.columnOffset,
        right: element.columnOffset + element.columnSpan,
    });

    const verticalEdges = (element) => ({
        top: element.rowOffset,
        bottom: element.rowOffset + element.rowSpan,
    });

    const isCollidingAtAxis = (xFirstEdge, xSecondEdge, yFirstEdge, ySecondEdge) =>
        isBetween(yFirstEdge, xFirstEdge, xSecondEdge) ||
        isBetween(ySecondEdge, xFirstEdge, xSecondEdge) ||
        doesContain(xFirstEdge, xSecondEdge, yFirstEdge, ySecondEdge) ||
        doesContain(yFirstEdge, ySecondEdge, xFirstEdge, xSecondEdge);

    const { left: leftEdge, right: rightEdge } = horizontalEdges(element);
    const { left: otherLeftEdge, right: otherRightEdge } = horizontalEdges(otherElement);
    const { top: topEdge, bottom: bottomEdge } = verticalEdges(element);
    const { top: otherTopEdge, bottom: otherBottomEdge } = verticalEdges(otherElement);

    return isCollidingAtAxis(leftEdge, rightEdge, otherLeftEdge, otherRightEdge)
        && isCollidingAtAxis(topEdge, bottomEdge, otherTopEdge, otherBottomEdge);
}
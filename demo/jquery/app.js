var PackingAlgorithm = window.jaspis.default;

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var rowHeight = 300;
var columnWidth = 300;

function getRandomImageSize() {
    return {
        width: getRandom(1, 3) * rowHeight,
        height: getRandom(1, 3) * columnWidth,
    };
}

function getImage(imageSize) {
    return $('<img>', {
        src: "https://source.unsplash.com/random/" + imageSize.width + "x" + imageSize.height,
        alt: 'image'
    });
}

$(function() {
    var $imageList = $('<ul />', { class: 'images-list' });
    var img;

    var imageListItems = new Array(20);
    for (var i = 0; i < imageListItems.length; i++) {
        img = getImage(getRandomImageSize());
        imageListItems[i] = $('<li />', { class: 'image-list-item' }).append(img);
    }

    $.fn.append.apply($imageList, imageListItems).appendTo($('.container'));

    var containerWidth = $imageList.width();

    $imageList.imagesLoaded(function() {
        var elements = imageListItems.map(function(listItem, i) {
            return {
                width: listItem.outerWidth(true),
                height: listItem.outerHeight(true),
                index: i
            };
        });

        window.packager = new PackingAlgorithm({
            elements,
            rowHeight,
            columnWidth,
            containerWidth,
        });

        var packedElements = window.packager.pack();

        packedElements.forEach(function(element, i) {
            var listItem = imageListItems[i];
            listItem.addClass('positioned');
            listItem.css({
                left: element.left,
                top: element.top,
            });
        });

        $imageList.addClass('positioned');
    });
});

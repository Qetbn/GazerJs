/**
 * gazer.js util lib
 * @type {{getTimestamp: Function, getByteLength: Function}}
 */
if (typeof gazer === "undefined") {
    var gazer = {};
}
gazer.utils = {
    /**
     * Get timestam
     * @returns {number}
     */
    getTimestamp: function () {
        if (!Date.now) {
            return new Date().getTime();
        } else {
            return Date.now();
        }
    },
    /**
     * Get string length in bytes
     * @param str
     * @returns {number}
     */
    getByteLength: function (str) {
        var length = str.length, count = 0, i = 0, ch = 0;
        for (i; i < length; i++) {
            ch = str.charCodeAt(i);
            if (ch <= 127) {
                count++;
            } else if (ch <= 2047) {
                count += 2;
            } else if (ch <= 65535) {
                count += 3;
            } else if (ch <= 2097151) {
                count += 4;
            } else if (ch <= 67108863) {
                count += 5;
            } else {
                count += 6;
            }
        }
        return count;
    },
    /**
     * Translate coords
     * @param sizesFrom
     * @param coordsFrom
     * @param sizesTo
     */
    translateCoords: function (sizesFrom, coordsFrom, sizesTo) {
        var coords = {
            diffX: 0,
            diffY: 0,
            x: Math.round(sizesTo.width * coordsFrom.x / sizesFrom.width),
            y: Math.round(sizesTo.height * coordsFrom.y / sizesFrom.height)
        };
        if (coords.x > sizesTo.width) {
            coords.diffX = coords.x - sizesTo.width;
            coords.x = sizesTo.width;
        }
        if (coords.y > sizesTo.height) {
            coords.diffY = coords.y - sizesTo.height;
            coords.y = sizesTo.height;
        }
        return coords;
    }
};
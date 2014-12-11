/**
 * gazer.js util lib
 * @type {{getTimestamp: Function, getByteLength: Function}}
 */
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
        var coordsNew = {
            x: sizesTo.width * coordsFrom.x / sizesFrom.width,
            y: sizesTo.height * coordsFrom.y / sizesFrom.height
        };
    }
};
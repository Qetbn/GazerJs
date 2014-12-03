/**
 * gazer.js core
 */
var gazer = {};
/**
 * Window propperties
 */
gazer.properties = {};
/**
 * Init windows props
 */
gazer.initProperties = function () {
    gazer.properties = {
        url: $(location).attr('href'),
        height: $(window).height(),
        width: $(window).height(),
        navigator: $(navigator).attr('userAgent'),
        pageX: 0,
        pageY: 0,
        scrollTop: 0,
        scrollLeft: 0,
        minMouseMove: 5,
        uid: script.data('uid')
    }
};

/**
 * Cut frames
 * @param start
 * @param end
 * @returns {Array.<T>}
 */
gazer.cutFrames = function (start, end) {
    if (typeof end === "undefined")
        var end = 10;
    if (end > gazer.frames.length - 1) {
        end = gazer.frames.length - 1;
    }
    var result = gazer.frames.slice(start, end);
    gazer.frames.splice(start, end);
    return result;
};
gazer.frames = [];
/**
 * Add a rame
 * @param e событие
 */
gazer.pushFrame = function (e) {
    gazer.frames.push(e);
};


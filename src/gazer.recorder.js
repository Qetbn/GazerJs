/**
 * gazer.js records
 */
gazer.recorder = {};
/**
 * Window propperties
 */
gazer.recorder.properties = {};
/**
 * Init windows props
 */
gazer.recorder.initProperties = function () {
    var script = $('#page-gazer-script');
    gazer.recorder.properties = {
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
gazer.recorder.cutFrames = function (start, end) {
    if (typeof end === "undefined")
        var end = 10;
    if (end > gazer.recorder.frames.length - 1) {
        end = gazer.recorder.frames.length - 1;
    }
    var result = gazer.recorder.frames.slice(start, end);
    gazer.recorder.frames.splice(start, end);
    return result;
};
gazer.recorder.frames = [];
/**
 * Add a rame
 * @param e событие
 */
gazer.recorder.pushFrame = function (e) {
    gazer.recorder.frames.push(e);
};


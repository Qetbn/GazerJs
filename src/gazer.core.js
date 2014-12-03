/**
 * gazer.js recorder
 */
(function () {
    $(function () {
        var gazer = {},
            script = $('#page-gazer-script');
        /**
         * Window propperties
         */
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
        };
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

        /**
         * Events
         */
        gazer.pushFrame({
            event: 'init',
            date: gazer.utils.getTimestamp(),
            data: gazer.properties
        });

        /**
         * Mouse move
         */
        $(window).on('mousemove', function (e) {
            gazer.properties.pageX = e.pageX;
            gazer.properties.pageY = e.pageY;
            return true;
        });
        /**
         * Window scoll
         */
        $(document).on('scroll', function () {
            gazer.properties.scrollTop = $(document).scrollTop();
            gazer.properties.scrollLeft = $(document).scrollLeft();
            /**
             * Add a frame with 'scroll' event
             */
            gazer.pushFrame({
                event: 'scroll',
                date: gazer.utils.getTimestamp(),
                data: {
                    scrollTop: gazer.properties.scrollTop,
                    scrollLeft: gazer.properties.scrollLeft
                }
            });
            return true;
        });
        /**
         * Mouse click
         */
        $(document).on('mousedown', function (e) {
            /**
             * Add a frame with 'click' event
             */
            gazer.pushFrame({
                event: 'click',
                date: gazer.utils.getTimestamp()
            });
        });
        /**
         * Key down
         */
        $(document).on('keydown', function (e) {
            /**
             * Do not track passwords
             */
            if ($(e.target).prop('type') === "password") {
                return true;
            }
            /**
             * Add a frame with 'keypress' event
             */
            gazer.pushFrame({
                event: 'keypress',
                date: gazer.utils.getTimestamp(),
                data: {
                    keyCode: e.keyCode,
                    char: e.Char
                }
            });
        });
        /**
         * Mouse movement analytics
         */
        var mouse = {
            x: gazer.properties.pageX,
            y: gazer.properties.pageY
        };
        var checkMouseMoves = setInterval(function () {
                if (
                    mouse.x - gazer.properties.pageX >= gazer.properties.minMouseMove ||
                    gazer.properties.pageX - mouse.x >= gazer.properties.minMouseMove ||
                    mouse.y - gazer.properties.pageY >= gazer.properties.minMouseMove ||
                    gazer.properties.pageY - mouse.y >= gazer.properties.minMouseMove
                ) {
                    mouse.x = gazer.properties.pageX;
                    mouse.y = gazer.properties.pageY;
                    /**
                     * Add a frame with 'mousemove' event
                     */
                    gazer.pushFrame({
                        event: 'mousemove',
                        date: gazer.utils.getTimestamp(),
                        data: {
                            x: mouse.x,
                            y: mouse.y
                        }
                    });
                }
                return true;
            },
            300
        );
        /**
         * Read frames
         */
        var state = gazer.frames.length,
            readState = setInterval(function () {
                if (gazer.frames.length != state) {
                    /**
                     * Get & log state
                     */
                    var frames = JSON.stringify(gazer.frames);
                    console.log(gazer.utils.getByteLength(frames), frames);
                    state = gazer.frames.length;
                }

            }, 1000);
    });
})();
/**
 * gazer.js recorder
 */
(function () {
    $(function () {
        var watch = {},
            script = $('#page-watch-script');
        /**
         * Запишем свойства окна в объект
         */
        watch.properties = {
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
        watch.utils = {
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
        watch.cutFrames = function (start, end) {
            if (typeof end === "undefined")
                var end = 10;
            if (end > watch.frames.length - 1) {
                end = watch.frames.length - 1;
            }
            var result = watch.frames.slice(start, end);
            watch.frames.splice(start, end);
            return result;
        };
        watch.frames = [];
        /**
         * Add a rame
         * @param e событие
         */
        watch.pushFrame = function (e) {
            watch.frames.push(e);
        };

        /**
         * Events
         */
        watch.pushFrame({
            event: 'init',
            date: watch.utils.getTimestamp(),
            data: watch.properties
        });

        /**
         * Mouse move
         */
        $(window).on('mousemove', function (e) {
            watch.properties.pageX = e.pageX;
            watch.properties.pageY = e.pageY;
            return true;
        });
        /**
         * Window scoll
         */
        $(document).on('scroll', function () {
            watch.properties.scrollTop = $(document).scrollTop();
            watch.properties.scrollLeft = $(document).scrollLeft();
            /**
             * Add a frame with 'scroll' event
             */
            watch.pushFrame({
                event: 'scroll',
                date: watch.utils.getTimestamp(),
                data: {
                    scrollTop: watch.properties.scrollTop,
                    scrollLeft: watch.properties.scrollLeft
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
            watch.pushFrame({
                event: 'click',
                date: watch.utils.getTimestamp()
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
            watch.pushFrame({
                event: 'keypress',
                date: watch.utils.getTimestamp(),
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
            x: watch.properties.pageX,
            y: watch.properties.pageY
        };
        var checkMouseMoves = setInterval(function () {
                if (
                    mouse.x - watch.properties.pageX >= watch.properties.minMouseMove ||
                    watch.properties.pageX - mouse.x >= watch.properties.minMouseMove ||
                    mouse.y - watch.properties.pageY >= watch.properties.minMouseMove ||
                    watch.properties.pageY - mouse.y >= watch.properties.minMouseMove
                ) {
                    mouse.x = watch.properties.pageX;
                    mouse.y = watch.properties.pageY;
                    /**
                     * Add a frame with 'mousemove' event
                     */
                    watch.pushFrame({
                        event: 'mousemove',
                        date: watch.utils.getTimestamp(),
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
        var state = watch.frames.length,
            readState = setInterval(function () {
                if (watch.frames.length != state) {
                    /**
                     * Get & log state
                     */
                    var frames = JSON.stringify(watch.frames);
                    console.log(watch.utils.getByteLength(frames), frames);
                    state = watch.frames.length;
                    /**
                     * Cut 10 frames
                     */
                    //var cutFrames = JSON.stringify(watch.cutFrames(0, 10));
                    //console.log('cut 10 frames', cutFrames);
                    /**
                     * @todo: send frames to server
                     */
                }

            }, 1000);
    });
})();
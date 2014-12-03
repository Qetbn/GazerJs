
$(function () {
    var script = $('#page-gazer-script');

    /**
     * Initial step
     */
    gazer.initProperties();
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
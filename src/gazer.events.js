
$(function () {
    /**
     * Initial step
     */
    gazer.recorder.initProperties();
    gazer.recorder.pushFrame({
        event: 'init',
        date: gazer.utils.getTimestamp(),
        data: gazer.recorder.properties
    });
    /**
     * Window Resize
     */
    $(window).resize(function() {
        gazer.recorder.pushFrame({
            event: 'resize',
            date: gazer.utils.getTimestamp(),
            data: {
                height: $(window).height(),
                width: $(window).width()   
            }
        });
    });
    /**
     * Mouse move
     */
    $(window).on('mousemove', function (e) {
        gazer.recorder.properties.pageX = e.pageX;
        gazer.recorder.properties.pageY = e.pageY;
        return true;
    });
    /**
     * Document scoll
     */
    $(document).on('scroll', function () {
        gazer.recorder.properties.scrollTop = $(document).scrollTop();
        gazer.recorder.properties.scrollLeft = $(document).scrollLeft();
        /**
         * Add a frame with 'scroll' event
         */
        gazer.recorder.pushFrame({
            event: 'scroll',
            date: gazer.utils.getTimestamp(),
            data: {
                scrollTop: gazer.recorder.properties.scrollTop,
                scrollLeft: gazer.recorder.properties.scrollLeft
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
        gazer.recorder.pushFrame({
            event: 'click',
            date: gazer.utils.getTimestamp(),
            data: {
                target: gazer.utils.getPath($(e.target))
            }
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
        gazer.recorder.pushFrame({
            event: 'keypress',
            date: gazer.utils.getTimestamp(),
            data: {
                keyCode: e.keyCode,
                char: e.Char
            }
        });
    });
    
    /**
     * Change value
     */
     $(document).on('change', 'input, select, textarea', function (e) {
        /**
         * Do not track passwords
         */
        if ($(e.target).prop("tagName") == "INPUT" && $(e.target).prop('type') === "password") {
            return true;
        }
        /**
         * Add a frame with 'keypress' event
         */
        gazer.recorder.pushFrame({
            event: 'change',
            date: gazer.utils.getTimestamp(),
            data: {
                value: $(e.target).val(),
                target: gazer.utils.getPath($(e.target))
            }
        });
    });
     
    /**
     * Focus
     */
     $(document).on('focus', 'input, a, button, select, textarea', function (e) {
        /**
         * Do not track passwords
         */
        if ($(e.target).prop("tagName") == "INPUT" && $(e.target).prop('type') === "password") {
            return true;
        }
        /**
         * Add a frame with 'keypress' event
         */
        gazer.recorder.pushFrame({
            event: 'focus',
            date: gazer.utils.getTimestamp(),
            data: {
                target: gazer.utils.getPath($(e.target))
            }
        });
    });
    /**
     * Text selection
     */
    $(document).on('mouseup', function (e) {
        var selectedText = "";
        if (window.getSelection) {
            selectedText =  window.getSelection().toString();
        } else if (document.selection) {
            selectedText = document.selection.createRange().text;
        }
        if (selectedText.length > 0) {
           var node = window.getSelection ? window.getSelection().focusNode.parentNode: document.selection.createRange().parentElement();
            gazer.recorder.pushFrame({
                event: 'select',
                date: gazer.utils.getTimestamp(),
                data: {
                    text: selectedText,
                    target: gazer.utils.getPath($(node))
                }
            }); 
        }
    });
    /**
     * Mouse movement analytics
     */
    var mouse = {
        x: gazer.recorder.properties.pageX,
        y: gazer.recorder.properties.pageY
    };
    var checkMouseMoves = setInterval(function () {
            if (
                mouse.x - gazer.recorder.properties.pageX >= gazer.recorder.properties.minMouseMove ||
                gazer.recorder.properties.pageX - mouse.x >= gazer.recorder.properties.minMouseMove ||
                mouse.y - gazer.recorder.properties.pageY >= gazer.recorder.properties.minMouseMove ||
                gazer.recorder.properties.pageY - mouse.y >= gazer.recorder.properties.minMouseMove
            ) {
                mouse.x = gazer.recorder.properties.pageX;
                mouse.y = gazer.recorder.properties.pageY;
                /**
                 * Add a frame with 'mousemove' event
                 */
                gazer.recorder.pushFrame({
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
    var state = gazer.recorder.frames.length,
        readState = setInterval(function () {
            if (gazer.recorder.frames.length != state) {
                /**
                 * Get & log state
                 */
                var frames = JSON.stringify(gazer.recorder.frames);
                console.log(gazer.utils.getByteLength(frames), frames);
                state = gazer.recorder.frames.length;
            }

        }, 1000);
});
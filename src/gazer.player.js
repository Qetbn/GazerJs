/**
 * gazer.js player
 */
$(function () {
    var history = $('#history').text();
    var gazerPlayer = {},
        script = $('#page-watch-script');

    gazerPlayer.utils = {
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
        }
    };
    /**
     * Current contains timestamp of a current moment
     * * @type {{}}
     */
    gazerPlayer.current = {
        time: parseInt(gazerPlayer.utils.getTimestamp(), 10)
    };
    /**
     * Properties containes user windows params
     * @type {{}}
     */
    gazerPlayer.properties = {};
    /**
     * UI describes all additional windows helpers
     * @type {{player: (*|jQuery|HTMLElement), mouse: {create: Function, move: Function, destroy: Function, element: null}, window: {element: (*|jQuery|HTMLElement), resize: Function, destroy: Function}}}
     */
    gazerPlayer.ui = {
        player: $('#watch-player'),
        mouse: {
            create: function () {
                this.element = $('<div id="watch-player-mouse"/>');
                this.element.appendTo(gazerPlayer.ui.player);
                return true;
            },
            move: function (x, y) {
                this.element.css({
                    left: x,
                    top: y
                });
                return true;
            },
            destroy: function () {
                this.element.detach();
            },
            element: null
        },
        window: {
            element: $('#watch-player iframe:eq(0)'),
            resize: function (w, h) {
                this.element.css({
                    width: w,
                    height: h
                });
                return true;
            },
            destroy: function () {
                this.element.detach();
            }
        }
    };
    /**
     * Parse frames
     */
    try {
        gazerPlayer.frames = JSON.parse(history);
    } catch (e) {
        console.log(e);
        return false;
    }
    /**
     * Player actions
     * @type {{init: Function, mousemove: Function, click: Function, keypress: Function, scroll: Function, setTickTime: Function, tick: Function, cutFramesByDelta: Function}}
     */
    gazerPlayer.actions = {
        init: function (params) {
            gazerPlayer.properties = params.data;
            params.date = parseInt(params.date, 10);
            this.setTickTime(params.date);
            /**
             * Init UI
             */
            gazerPlayer.ui.mouse.create();
        },
        mousemove: function (params) {
            console.log('mousemove', params);
            gazerPlayer.ui.mouse.move(params.data.x, params.data.y);
            this.tick();
        },
        click: function (params) {
            console.log('click', params);
            this.tick();
        },
        keypress: function (params) {
            console.log('keypress', params);
            this.tick();
        },
        scroll: function (params) {
            console.log('scroll', params);
            this.tick();
        },
        setTickTime: function (date) {
            gazerPlayer.current.filmTime = date;
            gazerPlayer.current.delta = gazerPlayer.current.time - gazerPlayer.current.filmTime;
            this.tick();
            return true;
        },
        tick: function () {
            gazerPlayer.current.time = parseInt(gazerPlayer.utils.getTimestamp(), 10);
            return true;
        },
        cutFramesByDelta: function () {
            var delta = gazerPlayer.current.delta;
            var time = gazerPlayer.current.time;
            var minNextTick  = time - delta;
            for(var i = 0; i < gazerPlayer.frames.length; i++) {
                var frame = gazerPlayer.frames[i];
                frame.date = parseInt(frame.date, 10);
                if (minNextTick >= frame.date) {
                    gazerPlayer.frames.splice(0, i+1);
                }
            }
            this.tick();
            return true;
        }
    };
    var tick = 0;
    var filmLoop = setInterval(function () {
        var frame = gazerPlayer.frames[0];
        if (typeof frame.event === "undefined") {
            clearInterval(filmLoop);
            return true;
        }
        gazerPlayer.actions[frame.event](frame);
        gazerPlayer.actions.cutFramesByDelta();
        tick++;
    }, 50);
});
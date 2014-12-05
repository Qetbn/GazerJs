/**
 * gazer.js player lib
 */
gazer.player = {};

/**
 * Current contains timestamp of a current moment
 * * @type {{}}
 */
gazer.player.current = {
    time: parseInt(gazer.utils.getTimestamp(), 10)
};
/**
 * Properties containes user windows params
 * @type {{}}
 */
gazer.player.properties = {};
/**
 * UI describes all additional windows helpers
 * @type {{player: (*|jQuery|HTMLElement), mouse: {create: Function, move: Function, destroy: Function, element: null}, window: {element: (*|jQuery|HTMLElement), resize: Function, destroy: Function}}}
 */
gazer.player.ui = {
    player: {
        init: function () {
            this.element = $('#watch-player');
        },
        element: null
    },
    mouse: {
        init: function () {
            this.element = $('<div id="watch-player-mouse"/>');
            this.element.appendTo(gazer.player.ui.player.element);
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
 * Player actions
 * @type {{init: Function, mousemove: Function, click: Function, keypress: Function, scroll: Function, setTickTime: Function, tick: Function, cutFramesByDelta: Function}}
 */
gazer.player.actions = {
    init: function (params) {
        gazer.player.properties = params.data;
        params.date = parseInt(params.date, 10);
        this.setTickTime(params.date);
        /**
         * Init UI
         */
        gazer.player.ui.player.init();
        gazer.player.ui.mouse.init();
    },
    mousemove: function (params) {
        console.log('mousemove', params);
        gazer.player.ui.mouse.move(params.data.x, params.data.y);
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
        gazer.player.current.filmTime = date;
        gazer.player.current.delta = gazer.player.current.time - gazer.player.current.filmTime;
        this.tick();
        return true;
    },
    tick: function () {
        gazer.player.current.time = parseInt(gazer.utils.getTimestamp(), 10);
        return true;
    },
    cutFramesByDelta: function () {
        var delta = gazer.player.current.delta;
        var time = gazer.player.current.time;
        var minNextTick = time - delta;
        for (var i = 0; i < gazer.player.frames.length; i++) {
            var frame = gazer.player.frames[i];
            frame.date = parseInt(frame.date, 10);
            if (minNextTick >= frame.date) {
                gazer.player.frames.splice(0, i + 1);
            }
        }
        this.tick();
        return true;
    }
};

$(function () {
    var history = $('#history').text();
    script = $('#page-watch-script');
    /**
     * Parse frames
     */
    try {
        gazer.player.frames = JSON.parse(history);
    } catch (e) {
        console.log(e);
        return false;
    }

    var tick = 0;
    var filmLoop = setInterval(function () {
        var frame = gazer.player.frames[0];
        if (typeof frame.event === "undefined") {
            clearInterval(filmLoop);
            return true;
        }
        gazer.player.actions[frame.event](frame);
        gazer.player.actions.cutFramesByDelta();
        tick++;
    }, 50);
});
/**
 * gazer.js player lib
 */
if (typeof gazer === "undefined") {
    var gazer = {};
}
gazer.player = {};

/**
 * Current contains timestamp of a current moment
 * * @type {{}}
 */
gazer.player.current = {
    time: parseInt(gazer.utils.getTimestamp(), 10),
    contentLoaded: false,
    status: "stop"
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
            this.element.addClass('loading');
            return true;
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
    container: {
        element: false,
        init: function() {
            this.element = $('<div />').addClass("watch-player-container");
            this.element.appendTo(gazer.player.ui.player.element);
        }
    },
    window: {
        element: false,
        init: function (cb) {
            var self = this;
            self.element = $('<iframe />').attr('scrolling', 'no');
            self.element.appendTo(gazer.player.ui.container.element);
            self.loadUrl(gazer.player.properties.url);
            /**
             * Perform callback if specified
             */
            this.element.on('load', function(){
                gazer.player.actions.contentLoaded();
                var height = self.element.contents().height();
                self.element.css('height', height);
                if (typeof cb === "function") {
                    cb();
                }    
            });
            
            return true;
        },
        loadUrl: function (url) {
            this.element.attr('src', url);
            return true;
        },
        resize: function (w, h) {
            this.element.css({
                width: w,
                height: h
            });
            return true;
        },
        destroy: function () {
            this.element.detach();
            return true;
        },
        scroll: function(x,y) {}
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
        gazer.player.ui.container.init();
        gazer.player.ui.window.init(function () {
            gazer.player.actions.play();
            gazer.player.ui.mouse.init();
        });
        return true;
    },
    mousemove: function (params) {
        console.log('mousemove', params);
        /**
         * Translate coords to current window size
         */
        var sizesTo =  {
            width: gazer.player.ui.window.element.width(),
            height: gazer.player.ui.window.element.height()
        };
        var sizesFrom = {
            width: gazer.player.properties.width,
            height: gazer.player.properties.height
        };
        var coords  = gazer.utils.translateCoords(sizesFrom, params.data, sizesTo);
        this.scroll(coords, true);
        gazer.player.ui.mouse.move(coords.x, coords.y);
        this.tick();
        return true;
    },
    click: function (params) {
        console.log('click', params);
        this.tick();
        return true;
    },
    keypress: function (params) {
        console.log('keypress', params);
        this.tick();
        return true;
    },
    /**
     * Scoll function
     * @param params
     * @boolean diff Compare with current. If true only adds positive offsets
     * @returns {boolean}
     */
    scroll: function (params, diff) {
        console.log('scroll', params);
        if (typeof params.scrollTop !== "undefined") {
            gazer.player.ui.window.element.scrollTop(params.scrollTop);
        }
        this.tick();
        return true;
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
    },
    play: function() {
        gazer.player.current.status = "play";
    },
    stop: function() {
        gazer.player.current.status = "stop";
    },
    pause: function() {
        gazer.player.current.status = "pause";
    },
    contentLoaded: function() {
        gazer.player.ui.player.element.removeClass("loading");
        gazer.player.current.contentLoaded = true;
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
        if (typeof frame === "undefined" || typeof frame.event === "undefined") {
            gazer.player.actions.stop();
            clearInterval(filmLoop);
            return true;
        }
        if (gazer.player.current.status !== "play" && frame.event != "init") {
            return true;
        }
        gazer.player.actions[frame.event](frame);
        gazer.player.actions.cutFramesByDelta();
        tick++;
        return true;
    }, 50);
});
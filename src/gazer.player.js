/**
 * GazerJs player lib
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
    story: {
        element: false,
        progressBar: false,
        progress: 0,
        init: function() {
            this.element = $('<div />').addClass("watch-story-container");
            this.progressBar  = $('<div />').addClass("watch-progressbar");
            this.element.appendTo(gazer.player.ui.player.element);
            this.progressBar.appendTo(this.element);
        },
        setProgress: function(p) {
            this.progress = p;
            if (this.progressBar !== false) {
                this.progressBar.css({'left': p});
            }
        }
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
        click: function() {
            this.element.addClass('click').delay(100).queue(function(next){
                $(this).removeClass("click");
                next();
            });
            return true;
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
            this.element.on('load', function(){
                gazer.player.actions.contentLoaded();
                var height = self.element.contents().height();
                self.element.css('height', height);
                /**
                 * Perform callback if specified
                 */
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
        gazer.player.framesCount = gazer.player.frames.length;
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
            gazer.player.ui.story.init();
        });
        return true;
    },
    mousemove: function (params) {
        /**
         * Translate coords to current window size
         */
        var sizesTo =  {
            width: gazer.player.ui.container.element.width(),
            height: gazer.player.ui.container.element.height()
        };
        var sizesFrom = {
            width: gazer.player.properties.dWidth,
            height: gazer.player.properties.dHeight
        };
        var coords  = gazer.utils.translateCoords(sizesFrom, params.data, sizesTo);
        this.scroll(coords, true);
        gazer.player.ui.mouse.move(coords.x, coords.y);
        this.tick();
        return true;
    },
    click: function (params) {
        //console.log('click', params);
        gazer.player.ui.mouse.click();
        this.tick();
        return true;
    },
    keypress: function (params) {
        //console.log('keypress', params);
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
        if (typeof params.data !== "undefined" && typeof params.data.scrollTop !== "undefined") {
            gazer.player.ui.container.element.scrollTop(params.data.scrollTop);
        } else if (diff === true) {
            /**
             * scrolls window to mouse position if its out of bounds of current window container
             */
            gazer.player.ui.container.element.scrollTop(
                gazer.player.ui.container.element.scrollTop() + params.diffY
            );
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
    updateDeltas: function () {
        this.tick();
        gazer.player.current.delta = gazer.player.current.time - gazer.player.current.filmTime;
        return true;  
    },
    tick: function () {
        gazer.player.current.time = parseInt(gazer.utils.getTimestamp(), 10);
        gazer.player.ui.story.setProgress(gazer.player.framesCount * gazer.player.frames.length / 100);
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
        gazer.player.actions.updateDeltas();
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
    var history = $('#history').text(),
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
        if (typeof gazer.player.actions[frame.event] === "function") {
            console.log(frame.event, frame);
            gazer.player.actions[frame.event](frame);
        }
        gazer.player.actions.cutFramesByDelta();
        tick++;
        return true;
    }, 50);
});
/**
 * watch.js recorder
 * Created by omelich on 28.11.2014.
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
             * Получить timestamp
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
             * Получить длинну строки в байтах
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
         * Вырезать кадры
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
         * Запись кадра
         * @param e событие
         */
        watch.pushFrame = function (e) {
            watch.frames.push(e);
        };

        /**
         * События
         */
        watch.pushFrame({
            event: 'init',
            date: watch.utils.getTimestamp(),
            data: watch.properties
        });

        /**
         * Движение мыши
         */
        $(window).on('mousemove', function (e) {
            watch.properties.pageX = e.pageX;
            watch.properties.pageY = e.pageY;
            return true;
        });
        /**
         * Скролл окна
         */
        $(document).on('scroll', function () {
            watch.properties.scrollTop = $(document).scrollTop();
            watch.properties.scrollLeft = $(document).scrollLeft();
            /**
             * Запишем кадр с событием типа scroll
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
         * Клик
         */
        $(document).on('mousedown', function (e) {
            /**
             * Запишем кадр с событием типа scroll
             */
            watch.pushFrame({
                event: 'click',
                date: watch.utils.getTimestamp()
            });
        });
        /**
         * Кнопка
         */
        $(document).on('keydown', function (e) {
            /**
             * Не пишем пароли
             */
            if ($(e.target).prop('type') === "password") {
                return true;
            }
            /**
             * Запишем кадр с событием типа scroll
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
         * Анализ движения мыши
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
                     * Запишем кадр с событием типа scroll
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
         * Чтение кадров
         */
        var state = watch.frames.length,
            readState = setInterval(function () {
                if (watch.frames.length != state) {
                    /**
                     * Текущее состояние
                     */
                    var frames = JSON.stringify(watch.frames);
                    console.log(watch.utils.getByteLength(frames), frames);
                    state = watch.frames.length;
                    /**
                     * Получить 10 кадров
                     */
                    //var cutFrames = JSON.stringify(watch.cutFrames(0, 10));
                    //console.log('cut 10 frames', cutFrames);
                    /**
                     * @todo: отправить кадры на сервер
                     */
                }

            }, 1000);
    });
})();
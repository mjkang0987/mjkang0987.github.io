export const constants = (() => {
    'use strict';

    /**
     * @typedef EventHandlerType
     * @param {function} callback
     * @param {number} timing
     * @returns {(function(...[*]): void)|*}
     */

    const METHODS = {
        /**
         * @type {EventHandlerType}
         */
        DEBOUNCE(callback = () => {}, timing = 100) {
            let timer;

            return (...args) => {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(() => {
                    callback(...args);
                    timer = null;
                }, timing);
            };
        },
        /**
         * @type {EventHandlerType}
         */
        THROTTLING(callback = () => {}, timing = 100) {
            let timer;

            return (...args) => {
                if (!timer) {
                    timer = setTimeout(() => {
                        callback(...args);
                        timer = null;
                    }, timing);
                }
            };
        },
        REDUCE(f, acc, iter) {
            if (!iter) {
                iter = acc[Symbol.iterator]();
                acc = iter.next().value;
            }

            for (const a of iter) {
                acc = f(acc, a);
            }

            return acc;
        },
        GO(...args) {
            return () => METHODS.REDUCE((a, f) => f(a), args);
        },
        /**
         * RO - ResizeObserver
         * @param callback
         * @param timing
         * @returns {ResizeObserver}
         */
        RO(callback = () => {}, timing = 100) {
            const debounceCallback = METHODS.DEBOUNCE(callback, timing);
            const observer = new ResizeObserver((entries, observer) => {
                debounceCallback(entries);
            });

            return {
                observe(target) {
                    observer.observe(target);
                },
                unobserve(target) {
                    observer.unobserve(target);
                },
                disconnect() {
                    observer.disconnect();
                },
            };
        },
        /**
         * IO - IntersectionObserver
         * @param callback
         * @returns {IntersectionObserver}
         */
        IO(callback = () => {}) {
            const observer = new IntersectionObserver((entries, observer) => {
                callback(entries);
            });

            return {
                observe(target) {
                    observer.observe(target);
                },
                unobserve(target) {
                    observer.unobserve(target);
                },
                disconnect() {
                    observer.disconnect();
                },
            };
        },
        IS_DESKTOP() {
            const userAgent = window.navigator.userAgent;
            const desktopRegex = /windows nt|macintosh|linux/i;
            return desktopRegex.test(userAgent);
        },
    };

    const FETCH = {
        async GET(host, body, headers = {}) {
            const options = {
                method : 'GET',
                headers: {
                    'Content-Type': 'application/json', ...headers,
                },
            };

            const res = await fetch(host, options);
            const data = await res.json();

            if (res.ok) {
                return data;
            }

            if (!res.ok) {
                throw Error(data);
            }
        },
    };

    const TRANSITION = {
        CUBIC: [.57, .21, .69, .95],
    };


    return {
        METHODS,
        FETCH,
        TRANSITION,
    };
})();

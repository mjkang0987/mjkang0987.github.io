const UTILS = (() => {
    /**
     * @typedef EventHandlerType
     * @param {function} callback
     * @param {number} timing
     * @returns {(function(...[*]): void)|*}
     */

    /**
     * @type {EventHandlerType}
     */
    const DEBOUNCE = (callback = () => {}, timing = 100) => {
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
    };

    /**
     * @type {EventHandlerType}
     */
    const THROTTLING = (callback = () => {}, timing = 100) => {
        let timer;

        return (...args) => {
            if (!timer) {
                timer = setTimeout(() => {
                    callback(...args);
                    timer = null;
                }, timing);
            }
        };
    };

    const REDUCE = (f, acc, iter) => {
        if (!iter) {
            iter = acc[Symbol.iterator]();
            acc = iter.next().value;
        }

        for (const a of iter) {
            acc = f(acc, a);
        }

        return acc;
    };

    const GO = (...args) => {
        return () => METHODS.REDUCE((a, f) => f(a), args);
    };

    /**
     * RO - ResizeObserver
     * @param callback
     * @param timing
     * @returns {ResizeObserver}
     */
    const RO = (callback = () => {}, timing = 100) => {
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
    };

    /**
     * IO - IntersectionObserver
     * @param callback
     * @returns {IntersectionObserver}
     */
    const IO = (callback = () => {}) => {
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
    };

    const CREATE_EL = (el, attr) => {
        const element = document.createElement(el);

        if (attr) {
            Object.assign(element, attr);
        }

        return element;
    };

    const IS_DESKTOP = () => {
        const userAgent = window.navigator.userAgent;
        const desktopRegex = /windows nt|macintosh|linux/i;
        return desktopRegex.test(userAgent);
    };

    /**
     * @param breakpoint
     * @returns {boolean}
     */
    const IS_BIG = (breakpoint) => {
        return window.innerWidth > breakpoint;
    };

    /**
     * @param breakpoint
     * @returns {boolean}
     */
    const IS_SMALL = (breakpoint) => {
        return window.innerWidth < breakpoint;
    };

    /**
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    const IS_VISIBLE = (element) => {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };

    return {
        DEBOUNCE,
        THROTTLING,
        REDUCE,
        GO,
        RO,
        IO,
        CREATE_EL,
        IS_DESKTOP,
        IS_BIG,
        IS_SMALL,
        IS_VISIBLE,
    };
})();

export {
    UTILS,
};
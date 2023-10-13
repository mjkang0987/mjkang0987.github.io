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
                }
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
                }
            };
        },
        IS_DESKTOP() {
            const userAgent = window.navigator.userAgent;
            const desktopRegex = /windows nt|macintosh|linux/i;
            return desktopRegex.test(userAgent);
        }
    };

    const FETCH = {
        async GET(host, body, headers = {}) {
            const options = {
                method : 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const res = await fetch(host, options);
            const data = await res.json();

            if (res.ok) {
                return data;
            }

            if (!res.ok) {
                throw Error(data);
            }
        }
    };

    const TRANSITION = {
        CUBIC: [.57, .21, .69, .95]
    };


    return {
        METHODS,
        FETCH,
        TRANSITION
    };
})();

const {
    METHODS,
    FETCH
} = constants;

const masonryJS = ({
    element = '.masonry',
    options = {}
}) => {
    const masonry = document.querySelector(element);

    if (!masonry) {
        return;
    }

    const defaultOptions = {
        rows  : 3,
        gap   : 10,
        timing: 300
    };

    const opts = {...defaultOptions, ...options};

    masonry.setAttribute('style', `padding: 0 ${opts.gap / 2}px;`);

    const temp = {
        widthMasonry: masonry.clientWidth,
        rowsHeight  : Array.from({length: opts.rows}, () => 0),
        width       : Math.floor((masonry.offsetWidth - opts.gap) / opts.rows),
        totalElement: new Map(),
        newElement  : new Map()
    };

    const resetHeights = () => {
        temp.rowsHeight = Array.from({length: opts.rows}, () => 0);
    };

    const setWidth = () => {
        temp.width = Math.floor((masonry.offsetWidth - opts.gap) / opts.rows);
    };

    const setElement = () => {
        const elements = masonry.querySelectorAll('.img-wrap.isNew');
        const lengthElements = elements.length;

        for (let i = 0; i < lengthElements; i++) {
            if (temp.totalElement.has(elements[i])) {
                continue;
            }

            temp.totalElement.set(elements[i], elements[i]);
            temp.newElement.set(elements[i], elements[i]);
        }
    };

    const setPosition = (elements) => {
        if (elements.size === 0) {
            return;
        }

        for (const [, element] of elements) {
            if (!element.querySelector('img').style.display) {
                element.querySelector('img').setAttribute('style', 'display: block; width: 100%; height: auto;');
            }

            element.setAttribute(
                'style',
                `position: absolute; 
                top: 0; 
                left: ${opts.gap / 2}px; 
                width: ${temp.width}px; 
                padding: 0 ${opts.gap / 2}px; 
                box-sizing: border-box;`
            );

            const height = element.offsetHeight;
            const minIndex = temp.rowsHeight.indexOf(Math.min(...temp.rowsHeight)) < 0 ? 0 : temp.rowsHeight.indexOf(
                Math.min(...temp.rowsHeight));

            element.style.transform = `translate(${(temp.width * minIndex)}px, ${Number(temp.rowsHeight[minIndex]) + opts.gap}px)`;

            element.classList.remove('isNew');
            temp.rowsHeight[minIndex] = temp.rowsHeight[minIndex] + height + opts.gap;
            masonry.dataset.arr = temp.rowsHeight.join(' ');

            if (temp.newElement.has(element)) {
                temp.newElement.delete(element);
            }
        }
    };

    const onResize = () => {
        const width = masonry.clientWidth;
        const isResize = width !== temp.widthMasonry;

        if (isResize) {
            resetHeights();
            setWidth();
        }

        setPosition(isResize ? temp.totalElement : temp.newElement);

        temp.widthMasonry = width;
    };

    const init = () => {
        setElement();
        setWidth();
        setPosition(temp.newElement);
    };

    resetHeights();

    const masonryResize = METHODS.RO(onResize, 10);
    masonryResize.observe(document.querySelector('body'));

    return () => {
        init();
    };
};

const prototype = (() => {
    'use strict';

    let initPage = 0;
    const masonryElement = document.querySelector('.masonry');
    const infiniteElement = document.querySelector('.infiniteScroll');
    const gap = 10;

    const data = async () => {
        initPage++;

        return await FETCH.GET(
            `https://picsum.photos/v2/list?page=${initPage}&limit=20`
        );
    };

    const toggleLoader = (isShow = false) => {
        const loader = document.getElementById('loader');
        loader.style.display = isShow ? 'flex' : 'none';
    };

    const setInfinitePosition = () => {
        const arr = masonryElement.dataset.arr.split(' ') ?? [];
        const max = Math.max(...arr);

        infiniteElement.style.transform = `translateY(${max < 0 ? window.innerHeight + gap : max - (gap * 2)}px)`;
    };

    const toggleInfiniteArea = (isDisconnect = false) => {
        infiniteElement.classList[isDisconnect ? 'add' : 'remove']('disconnect');

        if (isDisconnect) {
            setInfinitePosition();
        }
    };

    const masonry = masonryJS({
        element: '.masonry',
        options: {
            rows: 3
        }
    });

    const setUI = (items = []) => {
        if (!masonry) {
            return;
        }

        if (!masonryElement) {
            return;
        }

        if (items.length === 0) {
            return;
        }

        const itemsElement = items.reduce((acc, curr) => {
            return [
                ...acc,
                `<div class="img-wrap isNew">
                    <img src="${curr.download_url}" width="${curr.width}" height="${curr.height}" alt="${curr.author}">
                </div>`
            ];
        }, []);

        masonryElement.insertAdjacentHTML('beforeend', itemsElement.join(''));
    };

    const setMasonry = async (items) => {
        setUI(items);
        masonry();
        toggleInfiniteArea(true);
        toggleLoader();
    };

    const infiniteScroll = () => {
        if (infiniteElement.classList.contains('disconnect')) {
            return toggleInfiniteArea();
        }

        (async () => {
            toggleLoader(true);

            const items = await data();

            if (items) {
                await setMasonry(items);
            }
        })();
    };

    const init = () => {
        const infiniteIO = METHODS.IO(infiniteScroll);
        infiniteIO.observe(infiniteElement);
    };

    return {
        init
    };
})();

if (document.readyState === 'complete') {
    prototype.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', prototype.init);
}

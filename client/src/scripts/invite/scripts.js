const JS = (() => {
    let scrollTop = null;

    const ELEMENT = {
        BODY : document.querySelector('body'),
        SLIDE: document.querySelectorAll('.slide-wrap')
    };

    const {
        BODY,
        SLIDE
    } = ELEMENT;


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

    const RO = (callback = () => {}, timing = 100) => {
        const debounceCallback = THROTTLING(callback, timing);
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
    };

    const IO = (callback = () => {}, opts) => {
        const observer = new IntersectionObserver((entries, observer) => {
            callback(entries);
        }, opts);

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
    };

    const now = new Date();

    const currentDate = {
        fullYear: null,
        month   : null,
        day     : null,
        date    : null
    };

    const setCurrent = () => {
        Object.keys(currentDate).map(d => currentDate[d] = now[`get${d[0].toUpperCase()}${d.slice(1)}`]());
    };

    const print = () => {
        const text = [
            '%cEUN%c & %cJIWOO'
        ];
        const style = [
            'background-color: rgb(106, 116, 249); color: #fff; padding: 2px 4px;',
            'background-color: rgb(0, 170, 255); color: #fff; padding: 2px 0;',
            'background-color: rgb(255, 158, 158); color: #fff; padding: 2px 4px;'
        ];

        console.log(text.join(''), ...style);
    };

    const setDays = () => {
        const timer = document.querySelector('.timer-count');
        const current = new Date();
        const weddingDay = new Date(2024, 2, 3, 13, 20, 0);

        const diff = weddingDay - current;

        const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffHour = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const diffMin = Math.floor((diff / (1000 * 60)) % 60);
        const diffSec = Math.floor(diff / 1000 % 60);

        if (timer) {
            timer.textContent = `${diffDay}일 ${diffHour}시간 ${diffMin}분 ${diffSec}초`;
        }
    };

    const copyright = () => {
        const year = document.querySelector('.copy-year');
        const share = document.getElementById('share-url');

        if (year) {
            year.textContent = currentDate.fullYear;
        }

        if (share) {
            share.value = window.location;
        }
    };

    const carouselSlide = (target, opts) => {
        const TEMP = {
            SLIDES: new Set()
        };

        const defaultOptions = {
            el          : {},
            view        : 1,
            gap         : 15,
            pagination  : true,
            indexing    : true,
            thumb       : {
                wrap: null,
                el  : null
            },
            controls    : true,
            speed       : 3000,
            loop        : false,
            startIndex  : 1,
            isTransition: false
        };

        if (!target) {
            return;
        }

        const slide = target.querySelector('ul');
        const slideWrap = slide.parentElement;

        if (!slide) {
            return;
        }

        slideWrap.setAttribute('style', `overflow: hidden;`);

        const options = Object.assign(defaultOptions, opts);
        const slides = slide.querySelectorAll('.slide');
        const length = slides.length;

        if (!target.dataset.index) {
            target.dataset.index = options.startIndex;
        }

        const calcIndex = options.loop ? options.view - 1 : -1;
        const initIndex = options.loop ? Number(options.view) : 0;

        const bindTransform = (isBind) => {
            slide.style.transition = `transform ${isBind ? '.3s' : '0s'} ease-in-out`;
        };

        const resetPosition = () => {
            bindTransform(false);
            options.left = -(options.width * (Number(target.dataset.index) + options.view - 1)) - (options.gap * (Number(
                target.dataset.index) + Number(options.view)));
            slide.style.transform = `translate3d(${options.left}px, 0, 0)`;
        };

        const onMove = () => {
            if (options.direction !== null) {
                options.left = (options.left + ((options.direction === 'prev' ? 1 : -1) * (options.width + options.gap)));
            }

            if (options.direction === null) {
                options.left = -(options.width * (Number(target.dataset.index) + calcIndex)) - (options.gap * (Number(
                    target.dataset.index) + initIndex));
            }

            slide.style.transform = `translate3d(${options.left}px, 0, 0)`;
        };

        const changeState = () => {
            const handlerClasses = [
                'current',
                'prev',
                'next'
            ];

            handlerClasses.map(c => {
                const curr = slideWrap.querySelector(`.${c}`);

                if (curr) {
                    curr.classList.remove(c);

                    if (c === 'current') {
                        curr.setAttribute('tabindex', '-1');
                    }
                }
            });

            options.el.current = slides[target.dataset.index - 1];

            options.el.prev = options.el.current.previousElementSibling && !options.el.current.previousElementSibling.classList.contains(
                'clone') ? options.el.current.previousElementSibling : slides[length - 1];
            options.el.next = options.el.current.nextElementSibling && !options.el.current.nextElementSibling.classList.contains(
                'clone') ? options.el.current.nextElementSibling : slides[0];

            options.el.current.setAttribute('tabindex', 0);
            options.el.current.classList.add('current');

            options.el.prev.classList.add('prev');
            options.el.next.classList.add('next');
        };

        const setLoopPosition = () => {
            const index = Number(target.dataset.index);
            const isLast = index === 1;

            if (options.direction === 'prev' && index === length - options.view + 1) {
                resetPosition();
            }

            if (options.direction === 'next' && isLast) {
                resetPosition();
            }

            setTimeout(() => bindTransform(true), 0);
        };

        const setPagination = () => {
            options.paginationEl = {};
            options.paginationEl.el = document.createElement('div');
            options.paginationEl.children = [];

            Object.assign(options.paginationEl.el, {
                className: 'slide-pagination',
                style    : 'display: flex; justify-content: center; align-items: center; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);'
            });

            for (let i = 0; i < length; i++) {
                options.paginationEl.children[i] = document.createElement('button');
                Object.assign(options.paginationEl.children[i], {
                    type     : 'button',
                    className: i === Number(target.dataset.index) - 1 ? 'current' : ''
                });

                options.paginationEl.children[i].dataset.index = i + 1;
                options.paginationEl.children[i].innerHTML = `<span class="index" style="pointer-events: none;${i !== length ? ' margin-right: 20px;' : ''}">${i + 1}</span>`;
                options.paginationEl.el.insertAdjacentElement('beforeend', options.paginationEl.children[i]);
            }

            options.paginationEl.el.addEventListener('click', (e) => {
                const targetEl = e.target;

                if (targetEl.tagName !== 'BUTTON') {
                    return;
                }

                options.paginationEl.el.querySelector('.current').classList.remove('current');
                targetEl.classList.add('current');

                onSlide(targetEl.dataset.index);
            });

            target.insertAdjacentElement('beforeend', options.paginationEl.el);
        };

        const setIndexing = () => {
            options.indexingEl = {};
            options.indexingEl.el = document.createElement('div');

            Object.assign(options.indexingEl.el, {
                className: 'slide-indexing',
                style    : 'display: flex; justify-content: center; align-items: center; position: absolute; bottom: 20px; right: 20px;',
                tabIndex : '0'
            });

            const objIndexingEl = {
                current : target.dataset.index,
                division: '/',
                total   : length
            };

            Object.keys(objIndexingEl).map(index => {
                options.indexingEl[index] = document.createElement('span');

                Object.assign(options.indexingEl[index], {
                    className  : index,
                    textContent: objIndexingEl[index]
                });

                options.indexingEl.el.insertAdjacentElement('beforeend', options.indexingEl[index]);
            });

            target.insertAdjacentElement('beforeend', options.indexingEl.el);
        };

        const changeIndexing = () => {
            options.indexingEl.current.textContent = target.dataset.index;
        };

        const updateSlide = () => {
            changeState();
            onMove();

            if (options.indexing) {
                changeIndexing();
            }
        };

        const onSlide = (index) => {
            if (options.isTransition) {
                return;
            }

            if (index) {
                options.direction = null;
            }


            options.index = Number(index ? index : target.dataset.index);
            let currentIndex = !index ? options.index + (options.direction !== null ? (options.direction === 'prev' ? -1 : 1) : 0) : options.index;

            const isLast = options.loop ? currentIndex === length + 1 : currentIndex === length;
            const isFirst = options.loop ? currentIndex === 0 : currentIndex === 1;

            if (options.loop) {
                currentIndex = isLast ? 1 : isFirst ? length : currentIndex;
            }

            if (!options.loop) {
                options.controlsEl.prev.disabled = isFirst;
                options.controlsEl.next.disabled = isLast;
            }

            target.dataset.index = currentIndex;

            updateSlide();
        };

        const setThumbs = () => {
            options.thumbEl = document.querySelector(options.thumb.wrap);

            if (!options.thumbEl) {
                return;
            }

            options.thumbEls = options.thumbEl.querySelectorAll(options.thumb.el);

            if (options.thumbEls.length === 0) {
                return;
            }

            for (let i = 0; i < options.thumbEls.length; i++) {
                if (!options.thumbEls[i].dataset.index) {
                    options.thumbEls[i].dataset.index = i + 1;
                }

                options.thumbEls[i].addEventListener('click', () => {
                    onSlide(options.thumbEls[i].dataset.index);
                });
            }
        };

        const changeSlide = (e) => {
            const target = e.target;

            if (!target) {
                return;
            }

            if (target.tagName !== 'BUTTON') {
                return;
            }

            options.direction = target.classList.contains('button-prev') ? 'prev' : 'next';

            onSlide();

            options.isTransition = true;
        };

        const setControls = () => {
            options.controlsEl = {};
            options.controlsEl.el = document.createElement('div');

            Object.assign(options.controlsEl.el, {
                className: 'slide-controls',
                style    : 'display: flex; flex-direction: row; justify-content: space-between; width: 100%; position: absolute; top: 50%; transform: translateY(-50%); padding: 0 20px; box-sizing: border-box;'
            });

            [
                'next',
                'prev'
            ].map(curr => {
                options.controlsEl[curr] = document.createElement('button');
                Object.assign(options.controlsEl[curr], {
                    type       : 'button',
                    className  : `button-${curr}`,
                    textContent: curr === 'next' ? 'Next' : 'Prev',
                    disabled   : (!options.loop && curr === 'prev' && options.startIndex === 1)
                });

                options.controlsEl.el.insertAdjacentElement('afterbegin', options.controlsEl[curr]);
            });

            target.insertAdjacentElement('beforeend', options.controlsEl.el);
            options.controlsEl.el.addEventListener('click', changeSlide);
        };

        const setLoop = () => {
            options.clone = {
                before: [],
                after : []
            };

            for (let i = 0; i < options.view; i++) {
                options.clone.before[i] = slides[i].cloneNode(true);
                options.clone.after[i] = slides[slides.length - (i + 1)].cloneNode(true);

                options.clone.before[i].classList.add('clone');
                options.clone.after[i].classList.add('clone');

                slide.insertAdjacentElement('beforeend', options.clone.before[i]);
                slide.insertAdjacentElement('afterbegin', options.clone.after[i]);
            }
        };

        if (options.indexing) {
            setIndexing();
        }

        if (options.controls) {
            setControls();
        }

        if (options.thumb.wrap) {
            setThumbs();
        }

        if (options.pagination) {
            setPagination();
        }

        if (options.loop) {
            setLoop();
        }

        for (let i = 0; i < length; i++) {
            slides[i].setAttribute('tabindex', i === Number(target.dataset.index) - 1 ? 0 : '-1');
        }

        slideWrap.addEventListener('transitionend', () => {
            if (options.loop) {
                setLoopPosition();
            }

            options.isTransition = false;
        });

        options.event = {};

        const setTouchEvent = (e) => {
            options.event.type = e.type.indexOf('mouse') > -1 ? 'mouse' : 'touch';
            options.event.moveEvent = options.event.type === 'mouse' ? 'mousemove' : 'touchmove';
        };

        const getClientX = (e) => {
            return options.event.type === 'mouse' ? e['clientX'] : e['touches'][0]['clientX'];
        };

        const onTouchMove = (e) => {
            e.preventDefault();

            options.event.move = getClientX(e);
            options.event.distance = options.event.move - options.event.init;
            options.event.left = options.left + options.event.distance;

            slide.style.transform = `translate3d(${options.event.left}px, 0, 0)`;
        };

        const onTouchStart = (e) => {
            e.preventDefault();

            options.direction = null;

            const targetEl = e.target;

            if (targetEl.tagName === 'BUTTON') {
                return;
            }

            bindTransform(false);

            setTouchEvent(e);

            options.event.init = getClientX(e);

            slide.addEventListener(options.event.moveEvent, onTouchMove);
        };

        const onTouchEnd = (e) => {
            slide.removeEventListener(options.event.moveEvent, onTouchMove);

            e.preventDefault();

            bindTransform(true);

            const isPrev = options.event.distance > 0;
            const index = Math.floor(((options.event.left + (options.loop ? options.width * options.view : 0)) / (options.width - 30)) * -1) + 1 + (!options.loop ? (isPrev ? -1 : 1) : 0);

            if (options.loop) {
                options.direction = isPrev ? 'prev' : 'next';
                options.event.index = index > length ? length - options.view + 1 : index < 1 ? 1 : index;
            }

            if (!options.loop) {
                options.event.index = index > length ? length : index < 1 ? 1 : index;
            }

            target.dataset.index = options.event.index;

            onSlide();
        };

        return (...args) => {
            if (slideWrap.clientWidth === 0) {
                return;
            }

            options.width = Math.floor(((slideWrap.clientWidth - (options.gap * (options.view - 1))) / options.view));
            options.left = -(options.width * (Number(target.dataset.index) + calcIndex)) - (options.gap * (Number(target.dataset.index) + initIndex));

            const style = `flex-shrink: 0; width: ${options.width}px; margin-left: ${options.gap}px;`;

            for (let i = 0; i < length; i++) {
                Object.assign(slides[i], {
                    style
                });
            }

            if (options.loop) {
                for (let i = 0; i < options.clone.before.length; i++) {
                    Object.assign(options.clone.before[i], {
                        style
                    });

                    Object.assign(options.clone.after[i], {
                        style
                    });
                }
            }

            target.setAttribute('style', `overflow: hidden; display: flex; position: relative; width: 100%;`);
            slide.setAttribute(
                'style',
                `display: flex; transform: translate3d(${options.left}px, 0, 0);touch-action: none;`
            );
            setTimeout(() => slide.style.transition = `transform .3s ease-in-out`, 100);

            if (TEMP.SLIDES.has(target)) {
                return;
            }

            const objBindEvents = {
                touchstart: onTouchStart,
                touchend  : onTouchEnd,
                mousedown : onTouchStart,
                mouseup   : onTouchEnd
            };

            Object.keys(objBindEvents).map((e) => {
                slide.addEventListener(e, objBindEvents[e], false);
            });

            slide.addEventListener('mouseleave', () => {
                bindTransform(true);

                slide.removeEventListener(options.event.moveEvent, onTouchMove);

                onSlide(target.dataset.index);
            });

            TEMP.SLIDES.add(target);
        };
    };

    const bindLayer = () => {
        const toggleClass = 'active';

        let target = null;
        let trigger = null;
        let btnClose = null;

        let isOpen = false;

        const trapTab = (e) => {
            if (!target) {
                return;
            }

            const tabbable = target.querySelectorAll(
                'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');
            const first = tabbable[0];
            const last = tabbable[tabbable.length - 1];
            const isNabbing = tabbable.length > 0;

            const isTab = !e.shiftKey && e.keyCode === 9;
            const isBackTab = e.shiftKey && e.keyCode === 9;
            const isClose = e.keyCode === 27;

            if (isClose) {
                closeLayer();

                if (trigger) {
                    trigger.focus();
                }
            }

            if (!isNabbing) {
                return;
            }

            if (tabbable.length === 0) {
                return;
            }

            if (isBackTab) {
                if (e.target === target || e.target === first) {
                    e.preventDefault();
                    last.focus();
                }
            }

            if (isTab) {
                if (e.target === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        const onTransition = () => {
            if (!isOpen) {
                target.style.display = 'none';
            }
        };

        const onShow = () => {
            Object.assign(target, {
                style   : 'display: flex;',
                tabIndex: 0
            });

            setTimeout(() => target.classList.add(toggleClass), 0);

            target.focus();
        };

        const openLayer = (e) => {
            isOpen = true;

            trigger = e.target || null;
            target = trigger ? document.querySelector(`#${trigger.getAttribute('aria-controls')}`) : e;

            if (!target) {
                return;
            }

            onShow(target);

            target.addEventListener('transitionend', onTransition);

            btnClose = target.querySelector('[aria-label="close"]');

            if (btnClose) {
                btnClose.addEventListener('click', () => {
                    closeLayer();
                });
            }

            target.addEventListener('keydown', trapTab);
        };

        const closeLayer = () => {
            target.setAttribute('tabindex', -1);
            target.classList.remove(toggleClass);

            if (trigger) {
                trigger.focus();
            }

            isOpen = false;

            btnClose.removeEventListener('click', closeLayer);
            target.removeEventListener('click', onTransition);
            target.removeEventListener('keydown', trapTab);
        };

        return (...args) => {
            const triggers = document.querySelectorAll(args[0].trigger) || null;
            const targets = document.querySelectorAll(args[0].target) || null;

            if (triggers.length > 0) {
                for (let i = 0; i < triggers.length; i++) {
                    triggers[i].addEventListener('click', (e) => {
                        openLayer(e);

                        if (args[0].callback) {
                            args[0].callback();
                        }
                    });
                }
            }

            if (triggers.length === 0 && targets.length > 0) {
                for (let i = 0; i < targets.length; i++) {
                    openLayer(targets[i]);

                    if (args[0].callback) {
                        args[0].callback();
                    }
                }
            }
        };
    };

    const carousel = carouselSlide(document.querySelector('.slide-wrap'), {
        thumb: {
            wrap: '.grids',
            el  : '.grid'
        }
    });

    const onResize = () => {
        carousel();
    };

    const setMap = () => {
        const address = [
            '서울 구로구 새말로 97',
            '서울시 구로구 구로동 3-25',
            '신도림 테크노마트 7층 '
        ];

        const link = 'https://naver.me/xUStXdcX';

        const arrayMarker = [
            '<div class="address-wrap">',
            '    <ul class="addresses">',
            `        <li class="address"><strong class="title">도로명주소</strong><address>${address[0]} ${address[2]}</li></address>`,
            `        <li class="address"><strong class="title">지번주소</strong><address>${address[1]} ${address[2]}</li></address>`,
            '    </ul>',
            `    <a href="${link}" class="link" target="_blank">네이버 지도 바로가기</a>`,
            '    <span class="marker">',
            '        <span class="a11y">위치 마커</span>',
            '    </span>',
            '</div>'
        ];

        naver.maps.Service.geocode({
            query: `${address[0]} ${address[2]}`
        }, function (status, response) {
            if (status !== naver.maps.Service.Status.OK) {
                return alert('Something wrong!');
            }

            const result = response?.v2;
            const items = result.addresses;

            const lat = items[0].y;
            const lng = items[0].x;

            const Map = new naver.maps.Map('map', {
                center     : new naver.maps.LatLng(lat, lng),
                zoomControl: true,
                zoom       : 16
            });

            new naver.maps.Marker({
                position: new naver.maps.LatLng(lat, lng),
                map     : Map,
                icon    : {
                    content: arrayMarker.join('')
                }
            });

            new naver.maps.InfoWindow({
                anchorSkew: true
            });
        });
    };

    const contentsObserver = () => {
        const safetyAreaActive = (window.innerHeight / 100) * 20;
        const safetyAreaOff = (window.innerHeight / 100) * 40;
        const headerHeight = document.querySelector('.header')?.clientHeight;
        const contents = document.querySelectorAll('.content');

        for (let i = 0; i < contents.length; i++) {
            if (scrollTop > contents[i].offsetTop - headerHeight - safetyAreaActive) {
                contents[i].classList.add('active');
            }

            if (scrollTop < contents[i].offsetTop - headerHeight - safetyAreaOff) {
                contents[i].classList.remove('active');
            }
        }
    };

    const scrollEvent = () => {
        scrollTop = window.scrollY;

        contentsObserver();
    };

    const scrollMove = (target, value) => {
        if (!target) {
            return;
        }

        if (!value) {
            return;
        }

        target.scrollTo({
            top     : value,
            behavior: 'smooth'
        });
    };

    const setToast = (msg, trigger, timing = 3000) => {
        let toast = BODY.querySelector('.layer-toast');

        if (!toast) {
            toast = document.createElement('div');

            Object.assign(toast, {
                className  : 'layer-toast',
                ariaLive   : 'polite',
                textContent: msg
            });

            BODY.insertAdjacentElement('beforeend', toast);
        }

        setTimeout(() => {
            toast.classList.add('active');
            toast.setAttribute('tabindex', '0');
            toast.focus();
        }, 0);

        setTimeout(() => {
            toast.classList.remove('active');
            toast.setAttribute('tabindex', '-1');

            if (trigger) {
                trigger.focus();
            }
        }, timing);
    };

    const setShare = () => {
        const buttons = document.querySelectorAll('.btn-copy, .btn-share');

        if (buttons.length === 0) {
            return;
        }

        const setEvent = async (trigger, type = 'copy') => {
            const isShare = type === 'share';
            const isNavigatorShare = navigator.share;

            if (!trigger) {
                return;
            }

            const input = BODY.querySelector(`#${trigger.getAttribute('aria-controls')}`);

            if (!input) {
                return;
            }

            input.select();
            document.execCommand('copy');

            const msg = isShare ? 'URL이 복사되었습니다.' : '복사가 완료되었습니다.';

            if (isNavigatorShare) {
                window.navigator.share({
                    title: document.title
                }).then(() => {
                    console.log('Share URL');
                }).catch(console.error);
            }

            if (!isNavigatorShare) {
                setToast(msg, trigger);
            }
        };

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', () => {
                setEvent(buttons[i], buttons[i].classList.contains('btn-share') ? 'share' : 'copy');
            });
        }
    };

    const init = () => {
        setCurrent();
        print();
        setMap();

        setInterval(setDays, 1000);

        scrollEvent();

        window.addEventListener('scroll', THROTTLING(scrollEvent, 50));

        copyright();

        const slideObserver = RO(() => onResize(), 100);
        slideObserver.observe(document.querySelector('.slide-wrap'));

        const setLayer = bindLayer();

        setLayer({
            trigger: '.button-slide',
            target : '#layer-slide'
        });

        setShare();
    };

    return {
        init
    };
})();

if (document.readyState === 'complete') {
    JS.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', JS.init);
}
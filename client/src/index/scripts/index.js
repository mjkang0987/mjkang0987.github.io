import {
    EL,
    LOCATION,
    METHODS,
    TEMP
} from './constants.js';

const indexJS = (() => {
    const isMobile = () => {
        const width = window.innerWidth;
        const breakPoint = 600;

        return width < breakPoint;
    };

    const pagesHandler = () => {
        if (!isMobile()) {
            EL.asideBottom.open = true;
        }
    };

    const firstPage = EL.group.querySelector('ul:first-of-type li:first-of-type') || null;
    let token = null;

    const setToken = () => {
        token = !LOCATION.hash
                ? firstPage.querySelector(EL.buttonSelector).dataset.token
                : LOCATION.hash.slice(1);
    };

    const setLocation = () => {
        location.hash = token;
    };

    const toggleClass = ({target}) => {
        target.classList[target.classList.contains(EL.activeClass)
                         ? 'remove'
                         : 'add'](EL.activeClass);
    };

    const setPreviewUI = ({
        target
    }) => {
        const pageData = target.dataset;

        EL.viewToken.textContent = `${pageData.group} - ${pageData.state}: ${pageData.href}`;
        EL.viewLink.setAttribute('href', `${pageData.href}`);
        EL.viewIframe.querySelector('iframe').setAttribute('src', pageData.href);
        EL.viewIframe.classList.remove('hidden');

        if (isMobile()) {
            EL.asideBottom.open = false;
        }
    };

    const activePage = () => {
        const activePage = EL.group.querySelector(`[data-token=${token}]`).closest('li') || firstPage;
        const activeButton = activePage.querySelector('.button-preview');
        activeButton.focus();
        const prevPage = EL.group.querySelector(`li.${EL.activeClass}`);

        if (prevPage) {
            toggleClass({target: prevPage});
            prevPage.closest('.group-wrap').classList.remove(EL.activeClass);
        }

        toggleClass({target: activePage});
        activePage.closest('.group-wrap').classList.add(EL.activeClass);
        setPreviewUI({target: activeButton});
    };

    const resetSearch = ({
        set,
        type
    }) => {
        if (!set) {
            return;
        }

        if (set.size === 0) {
            return;
        }

        const isElement = type === 'tag';

        [...set].map((s) => {
            if (s) {
                isElement ? s.replaceWith(...s.childNodes) : s.classList.remove(EL.searchClass);
            }

            set.delete(s);
        });
    };

    const resetSearchCombine = () => {
        resetSearch({
            set : TEMP.searchDetails,
            type: null
        });

        resetSearch({
            set : TEMP.searchElements,
            type: 'tag'
        });
    };

    const searchData = ({
        value
    }) => {
        TEMP.searchElement = [];

        if (!value) {
            EL.group.classList.remove('searching');
            return resetSearchCombine();
        }

        resetSearchCombine();
        EL.group.classList.add('searching');

        for (let i = 0; i < EL.searchTargets.length; i++) {
            if (EL.searchTargets[i].dataset.keywords.toLowerCase().indexOf(value.toLowerCase()) < 0) {
                continue;
            }

            const isDetail = EL.searchTargets[i].tagName === 'DETAILS';

            if (isDetail) {
                EL.searchTargets[i].classList.add(EL.searchClass);
                TEMP.searchDetails.add(EL.searchTargets[i]);
            }

            if (!isDetail) {
                EL.searchTargets[i].closest('details').classList.add(EL.searchClass);
                TEMP.searchDetails.add(EL.searchTargets[i].closest('details'));
            }

            const matchingTag = EL.searchTargets[i].querySelector(isDetail ? 'summary' : 'span');
            matchingTag.innerHTML = matchingTag.textContent.replace(value, `<em>${value}</em>`);
            TEMP.searchElements.add(matchingTag.querySelector('em'));
        }
    };

    const activeSearch = () => {
        const searchEl = EL.aside.querySelector(EL.searchSelector);

        if (!searchEl) {
            return;
        }

        searchEl.addEventListener('input', (e) => {
            const debounceInput = METHODS.DEBOUNCE(searchData, 200);
            debounceInput({value: e.target.value})
        });
    };

    const bindEvent = (e) => {
        if (e.target.tagName !== 'BUTTON') {
            return;
        }

        location.hash = e.target.dataset.token;

        setToken();
        setLocation();
        activePage();
    };

    const changeAsideWidth = () => {
        let x = 0;
        let y = 0;

        const onMouseDown = (e) => {
            x = e.clientX;
            y = e.clientY;

            EL.group.style.pointerEvents = 'none';
            EL.view.style.pointerEvents = 'none';
            document.body.style.cursor = 'col-resize';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseUp = () => {
            EL.group.style.pointerEvents = 'auto';
            EL.view.style.pointerEvents = 'auto';
            document.body.style.cursor = 'cursor';

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            EL.aside.style.width = `${e.clientX}px`;
        };

        EL.asideChange.addEventListener('mousedown', onMouseDown);
    };

    const bindAsideKeyEvent = () => {
        let current = null;
        let isPrev = null;

        const onChangeActive = () => {
            const groups = new Map();
            const groupsEl = EL.group.querySelectorAll(EL.groupSelector);
            let parent = current.parentElement;
            let groupWrap = parent.closest(EL.groupSelector);
            let tempParent = parent[isPrev ? 'previousElementSibling' : 'nextElementSibling'];

            [...groupsEl].map((g, i) => groups.set(i, g));
            const length = groups.size;

            while (!tempParent) {
                const index = Number(groupWrap.dataset.index) + (isPrev ? -1 : 1);
                groupWrap = groups.get(index < 0 ? length - 1 : index === length ? 0 : index);
                tempParent = groupWrap.querySelector(`li:not(.null)${isPrev ? ':last-child' : ':first-child'}`);
            }

            if (!groupWrap) {
                return;
            }

            parent = tempParent;
            current = parent.querySelector(EL.buttonSelector);

            if (current) {
                current.focus();
                location.hash = current.dataset.token;
            }

            setToken();
            setLocation();
            activePage();
        };

        const onKeyDown = (e) => {
            e.preventDefault();

            const key = {
                down: 40,
                up  : 38
            };

            if (!Object.keys(key).find(k => e.keyCode === key[k])) {
                return;
            }

            current = e.target;
            isPrev = e.keyCode === key.up;

            onChangeActive();
        };

        EL.group.addEventListener('keydown', onKeyDown);
    };

    const init = () => {
        if (!EL.group) {
            return;
        }

        if (!firstPage) {
            return;
        }

        const bodyObserver = METHODS.RO(pagesHandler);
        bodyObserver.observe(document.querySelector('body'));

        EL.group.addEventListener('click', bindEvent);

        setToken();
        setLocation();
        activePage();
        activeSearch();

        changeAsideWidth();
        bindAsideKeyEvent();
    };

    return {
        init
    };
})();

if (document.readyState === 'complete') {
    indexJS.init();
} else if (document.addEventListener) {
    document.addEventListener(
        'DOMContentLoaded',
        indexJS.init
    );
}
const UTILS = {};

UTILS.EL = {};
UTILS.MAGIC_NUMBER = {};
UTILS.FUNC = {};
UTILS.TEMP = {};
UTILS.LOCATION = window.location;

let timer;
UTILS.METHODS = {
    DEBOUNCE(
        callback = () => {},
        timing = 100
    ) {
        let timer;

        return (...args) => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                callback.apply(this, args);
                timer = null;
            }, timing);
        }
    },
    THROTTLING(
        callback = () => {},
        timing = 100
    ) {
        let timer;

        return (...args) => {
            if (!timer) {
                timer = setTimeout(() => {
                    callback.apply(this, args);
                    timer = null;
                }, timing);
            }
        }
    },
    RO (
        callback = () => {}
    ) {
        return new ResizeObserver(this.DEBOUNCE((entrise, observer) => {
            callback(entrise);
        }, 100));
    }
};

export const {
    EL,
    LOCATION,
    METHODS,
    TEMP
} = UTILS;

EL.group = document.querySelector('.group');
EL.asideChange = document.querySelector('.aside-change');
EL.asideBottom = document.querySelector('.aside-bottom');
EL.aside = document.querySelector('.aside');
EL.view = document.querySelector('.view');
EL.viewIframe = EL.view.querySelector('.view-iframe');
EL.viewHeader = EL.view.querySelector('.view-header');
EL.viewToken = EL.viewHeader.querySelector('strong');
EL.viewLink = EL.viewHeader.querySelector('a');
EL.buttonSelector = '.button-preview';
EL.groupSelector = '.group-wrap';
EL.searchSelector = '.input-search';
EL.activeClass = 'active';
EL.searchClass = 'on';
EL.searchTargets = EL.aside.querySelectorAll(`${EL.groupSelector}, ${EL.buttonSelector}`);

TEMP.searchDetails = new Set();
TEMP.searchElements = new Set();

import {
    SELECTOR,
    ELEMENTS,
    COLORS,
    LENGTH,
} from './constants.js';

import {
    UTILS,
} from '../constants/utils.js';


const {
    CREATE_EL,
} = UTILS;

function PixelArt() {
    this.selector = {};

    this.init();
}

PixelArt.prototype = {
    init: function () {
        const input = document.createElement;
        this.setElement();
    },
    insertElement : function (el, parent, position) {
        const parentElement = this.selector[parent];
        parentElement.insertAdjacentElement(position, el);
    },
    setElement    : function () {
        for (let i = 0; i < LENGTH.ELEMENTS; i++) {
            const current = ELEMENTS[i];
            const element = CREATE_EL(current.el, current.attr);

            this.selector[current.selector] = element;

            if (current.parentSelector) {
                this.insertElement(element, current.parentSelector, current.insertPosition);
            }
        }

        SELECTOR.BODY.insertAdjacentElement('afterbegin', this.selector['PIXEL']);
    }
};
new PixelArt();

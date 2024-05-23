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
    THROTTLING,
    CREATE_EL,
} = UTILS;

function PixelArt() {
    this.selector = {};
    this.color = null;
    this.target = null;
    this.isDown = false;

    this.init();

    if (!Object.hasOwnProperty.call(this.selector, 'INPUT')) {
        return;
    }

    this.createPixelArt();
    this.selector['BUTTON_CREATE'].addEventListener('click', this.createPixelArt.bind(this));
    this.selector['PIXEL_CELLS'].addEventListener('mousedown', this.bindEvents.bind(this), {capture: true});

    this.selector['PIXEL_CELLS'].addEventListener('mouseup', () => {
        this.isDown = false;
    });

}

PixelArt.prototype = {
    init          : function () {
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
    },
    createPixelArt: function () {
        const count = +this.selector['INPUT'].value;

        if (count > 10) {
            return;
        }

        const elements = [];

        for (let i = 0; i < count + 1; i++) {
            for (let j = 0; j < count; j++) {
                const cell = i !== count ? `<div style="width: ${100 / count}%;border: 1px solid #111;box-sizing: border-box;padding-top: ${100 / count}%;height: 0;"></div>` : `<button type="button" style="width: ${100 / count}%;border: 1px solid #111;box-sizing: border-box;padding-top: ${100 / count}%;height: 0;background-color: ${COLORS[j]}"></button>`;

                elements.push(cell);
            }
        }

        this.selector['PIXEL_CELLS'].innerHTML = [...elements].join('');
    },
};

new PixelArt();

const CONSTANTS = (() => {
    'use strict';

    const SELECTOR = {
        BODY: document.querySelector('body'),
    };

    const ELEMENTS = [
        {
            el      : 'div',
            selector: 'PIXEL',
        },
        {
            el            : 'div',
            attr          : {
                className: 'pixel-input',
                style    : 'margin: 50px auto;display: grid;grid-template-columns: repeat(3, auto);justify-content:center;align-items:center;',
            },
            selector      : 'PIXEL_INPUT',
            parentSelector: 'PIXEL',
            insertPosition: 'afterbegin',
        },
        {
            el            : 'strong',
            attr          : {
                textContent: 'Pixel Art size:',
                style      : 'display:block;margin-right:10px;',
            },
            selector      : 'PIXEL_INPUT_TITLE',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
        {
            el            : 'input',
            attr          : {
                type     : 'number',
                style    : 'height: 30px;padding: 4px 10px;border-width:1px;',
                value    : 10,
                max      : 10,
                inputMode: 'numeric',
                pattern  : '[0-9]*',
                required : true,
            },
            selector      : 'INPUT',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
        {
            el            : 'button',
            attr          : {
                type       : 'button',
                style      : 'height:30px;padding: 4px 10px;border: 1px solid #111;border-left: 0;background-color:hsla(181, 81%, 46%, .4)',
                textContent: 'CREATE',
            },
            selector      : 'BUTTON_CREATE',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
        {
            el            : 'strong',
            attr          : {
                className  : 'caution',
                style      : 'grid-column: 2 / 4;padding: 8px 0;font-weight: 400;color: #ff0000;',
                textContent: 'only number. max 10.',
            },
            selector      : 'INPUT_CAUTION',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
    ];

    const COLORS = [
        'hsla(192, 100%, 39%, 1)',
        'hsla(238, 53%, 58%, 1)',
        'hsla(9, 84%, 55%, 1)',
        'hsla(181, 81%, 46%, 1)',
        'hsla(235, 95%, 16%, 1)',
        'hsla(86, 72%, 47%, 1)',
        'hsla(242, 98%, 56%, 1)',
        'hsla(12, 100%, 70%, 1)',
        'hsla(132, 43%, 42%, 1)',
        'hsla(189, 89%, 42%, 1)',
    ];

    const LENGTH = {
        ELEMENTS: ELEMENTS.length,
        COLORS  : COLORS.length,
    };

    return {
        SELECTOR,
        ELEMENTS,
        COLORS,
        LENGTH,
    };
})();

export const {
    SELECTOR,
    ELEMENTS,
    COLORS,
    LENGTH,
} = CONSTANTS;
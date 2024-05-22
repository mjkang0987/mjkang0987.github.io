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
            el            : 'input',
            attr          : {
                type : 'text',
                style: 'padding: 3 10px;',
            },
            selector      : 'INPUT',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
        {
            el            : 'button',
            attr          : {
                type       : 'button',
                style      : 'padding: 2px 5px;',
                textContent: 'CREATE',
            },
            selector      : 'BUTTON_CRATE',
            parentSelector: 'PIXEL_INPUT',
            insertPosition: 'beforeend',
        },
    ];

    const COLORS = [
        'hsl(192, 100%, 39%)',
        'hsl(238, 53%, 58%)',
        'hsl(9, 84%, 55%)',
        'hsl(181, 81%, 46%)',
        'hsl(235, 95%, 16%)',
        'hsl(86, 72%, 47%)',
        'hsl(242, 98%, 56%)',
        'hsl(12, 100%, 70%)',
        'hsl(132, 43%, 42%)',
        'hsl(189, 89%, 42%)',
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
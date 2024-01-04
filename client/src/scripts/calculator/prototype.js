const JS = (() => {
    const toggleClass = (selector, className, type = 'add') => {
        if (!selector) {
            return;
        }

        if (!className) {
            return;
        }

        selector.classList[type](className);
    };

    const bindCalculator = (selector = null) => {
        const calculator = document.getElementById(selector ?? 'calculator');

        if (!calculator) {
            return;
        }

        const CURRENT_CLASS = 'current';
        const VALUE_NULL = null;
        const VALUE_ZERO = 0;
        const VALUE_ONE = 1;
        const VALUE_TWO = 2;
        const BRACKETS = ['(', ')'];
        const OBJ_EXPRESSION = {
            plus       : '+',
            subtraction: '-',
            multiply   : '*',
            divide     : '÷'
        };

        const OBJ_INDEX = {
            plus       : 1,
            subtraction: 1,
            multiply   : 0,
            divide     : 0
        };

        const calculatorResult = document.getElementById('calculator-result');
        const calculatorExpression = document.getElementById('calculator-expression');

        const arrayExpression = [VALUE_ZERO];

        let currentExpressionElement = VALUE_NULL;
        let prevExpressionElement = VALUE_NULL;

        let currentExpression = VALUE_NULL;
        let currentValue = arrayExpression[VALUE_ZERO];
        let currentIndex = VALUE_ZERO;

        let isNegative = false;
        let isCalculation = false;

        const printExpression = () => {
            const lengthExpression = arrayExpression.length;

            let result = '';

            for (let i = 0; i < lengthExpression; i++) {
                if (typeof arrayExpression[i] === 'object') {
                    result += ` ${OBJ_EXPRESSION[arrayExpression[i][VALUE_ZERO]]} ${arrayExpression[i][VALUE_ONE] ? arrayExpression[i][VALUE_ONE].toLocaleString('KO-kr') : ''}`;
                }

                if (typeof arrayExpression[i] !== 'object') {
                    result += arrayExpression[i].toLocaleString('KO-kr');
                }
            }

            calculatorExpression.textContent = result;
        };

        const printResult = (result) => {
            calculatorResult.textContent = (+result).toLocaleString('KO-kr');
            console.log('print result', arrayExpression);
        };

        const initArray = (num) => {
            printResult(num);
            arrayExpression.splice(VALUE_ZERO);
            arrayExpression[VALUE_ZERO] = num;
            currentIndex = VALUE_ZERO;
        };

        const calculation = () => {
            let total = arrayExpression[VALUE_ZERO];
            let i = VALUE_ZERO;

            while (i < arrayExpression.length) {
                const tempExpression = arrayExpression[i];

                if (tempExpression[VALUE_ZERO] === 'plus') {
                    total += tempExpression[VALUE_ONE];
                }

                if (tempExpression[VALUE_ZERO] === 'subtraction') {
                    total -= tempExpression[VALUE_ONE];
                }

                if (tempExpression[VALUE_ZERO] === 'multiply') {
                    total *= tempExpression[VALUE_ONE];
                }

                if (tempExpression[VALUE_ZERO] === 'divide') {
                    total = total / tempExpression[VALUE_ONE];
                }

                i++;
            }

            initArray(total);
        };

        const events = {
            number(num) {
                const isArray = Array.isArray(arrayExpression[currentIndex]);
                const tempValue = isArray ? (arrayExpression[currentIndex][VALUE_ONE] ?? VALUE_ZERO) : (arrayExpression[currentIndex] ?? VALUE_ZERO);
                currentValue = +('' + (isCalculation ? VALUE_ZERO : tempValue) + num);

                if (isArray) {
                    arrayExpression[currentIndex][VALUE_ONE] = currentValue;
                }

                if (!isArray) {
                    arrayExpression[currentIndex] = currentValue;
                }

                if (arrayExpression.length > 2) {
                    calculation();
                }

                printResult(currentValue);
                currentExpression = null;
                isCalculation = false;
            },
            subtraction() {
                return true;
            },
            plus() {
                return true;
            },
            multiply() {
                return true;
            },
            divide() {
                return true;
            },
            percent() {
                return true;
            },
            negative() {
                isNegative = !isNegative;
                console.log(isNegative);
            },
            calculation() {
                isCalculation = true;
                calculation();
            },
            allClear() {
                initArray(VALUE_ZERO);
            },
            dot() {
                console.log('dot');
            },
            allClear() {
                initArray(initValue);
            }
        };

        const generatorExpression = (data) => {
            if (arrayExpression[currentIndex][VALUE_ONE] !== VALUE_NULL) {
                currentIndex++;
            }

            arrayExpression[currentIndex] = [data, VALUE_NULL, OBJ_INDEX[data]];

            if (currentExpression !== data) {
                currentIndex++;
            }

            console.log(arrayExpression);
        };

        const generatorData = (data) => {
            if (!isNaN(+data)) {
                return +data;
            }

            if (data.indexOf('-') > -1) {
                const dataArray = data.split('-');
                return `${dataArray[VALUE_ZERO]}${dataArray[VALUE_ONE].slice(VALUE_ZERO, VALUE_ONE).toUpperCase()}${dataArray[VALUE_ONE].slice(VALUE_ONE)}`;
            }

            return data;
        };

        const bindEvent = (e) => {
            e.preventDefault();

            const target = e.target;

            if (e.target.tagName !== 'BUTTON') {
                return;
            }

            currentExpression = generatorData(target.dataset.value);
            const isNumber = typeof currentExpression === 'number';

            if (isNumber) {
                return events.number(currentExpression);
            }

            if (currentExpressionElement) {
                prevExpressionElement = currentExpressionElement;
                toggleClass(prevExpressionElement, CURRENT_CLASS, 'remove');
            }

            if (currentExpression !== 'calculation') {
                currentExpressionElement = target;
                toggleClass(currentExpressionElement, CURRENT_CLASS, 'add');
                generatorExpression(currentExpression);
            }

            events[currentExpression]();
        };

        return () => {
            calculator.addEventListener('click', bindEvent, {capture: true});
        };
    };

    const init = () => {
        const calculator = bindCalculator('calculator');
        if (calculator) {
            calculator();
        }
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
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

        const arrayNumber = [VALUE_ZERO];
        const arrayExpression = [];

        let currentExpressionElement = VALUE_NULL;
        let prevExpressionElement = VALUE_NULL;

        let currentExpression = VALUE_NULL;
        let currentValue = arrayExpression[VALUE_ZERO];
        let currentIndex = VALUE_ZERO;

        let isDot = false;
        let isExpression = false;
        let isNegative = false;
        let isCalculation = false;

        const printExpression = () => {
            calculatorExpression.textContent = arrayNumber.reduce((acc, curr, index) => {
                const expression = `${curr} ${OBJ_EXPRESSION[arrayExpression[index]] ?? ''}`;
                return acc + expression;
            }, '');
        };

        const printResult = (result) => {
            calculatorResult.textContent = (+result).toLocaleString('KO-kr');
        };

        const initArray = (num) => {
            printResult(num);
            arrayExpression.splice(VALUE_ZERO);
            arrayNumber.splice(VALUE_ZERO);
            arrayNumber[VALUE_ZERO] = num;
            currentIndex = VALUE_ZERO;
        };

        const calculation = () => {
            let total = arrayNumber[VALUE_ZERO];
            let i = VALUE_ONE;

            while (i < arrayNumber.length) {
                const tempExpression = arrayExpression[i - VALUE_ONE];
                const tempNumber = arrayNumber[i];

                if (tempExpression === 'plus') {
                    total += tempNumber;
                }

                if (tempExpression === 'subtraction') {
                    total -= tempNumber;
                }

                if (tempExpression === 'multiply') {
                    total *= tempNumber;
                }

                if (tempExpression === 'divide') {
                    total = total / tempNumber;
                }

                i++;
            }

            initArray(total);
        };

        const generatorNumber = (tempValue, num) => {
            let curr = num;
            let acc = isCalculation ? VALUE_ZERO : tempValue;

            if (curr === 'dot') {
                isDot = true;
                curr = acc;
            }

            if (curr === 'percent') {
                curr = acc / 100;
            }

            if (typeof num === 'number') {
                curr = +(('' + acc) + curr) / (isDot ? 10 : 1);
                isDot = false;
            }

            return curr;
        };

        const generatorCamelCase = (array = []) => {
            if (array.length === 0) {
                return '';
            }

            return `${array[VALUE_ZERO]}${array[VALUE_ONE].slice(VALUE_ZERO, VALUE_ONE)
                                                          .toUpperCase()}${array[VALUE_ONE].slice(VALUE_ONE)}`;
        };

        const generatorData = (data) => {
            if (data.indexOf('-') > -1) {
                const dataArray = data.split('-');
                return generatorCamelCase(dataArray);
            }

            if (!isNaN(+data)) {
                return +data;
            }

            return data;
        };

        const events = {
            number(num) {
                if (isExpression) {
                    currentIndex++;
                }

                const tempValue = arrayNumber[currentIndex] ?? VALUE_ZERO;
                currentValue = generatorNumber(tempValue, num);

                arrayNumber[currentIndex] = currentValue;

                printResult(currentValue);

                currentExpression = null;
                isCalculation = false;
                isExpression = false;
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
            }
        };

        const bindEvent = (e) => {
            e.preventDefault();

            if (e.target.tagName !== 'BUTTON') {
                return;
            }

            const target = e.target;
            currentExpression = generatorData(target.dataset.value);

            const isDot_ = currentExpression === 'dot';
            const isPercent = currentExpression === 'percent';
            const isNumber = typeof currentExpression === 'number' || isPercent;

            if (isNumber || isDot_) {
                events.number(currentExpression);
            }

            if (currentExpressionElement) {
                prevExpressionElement = currentExpressionElement;
                toggleClass(prevExpressionElement, CURRENT_CLASS, 'remove');
            }

            if ((!isNumber || isDot_) && currentExpression !== 'calculation') {
                currentExpressionElement = target;
                toggleClass(currentExpressionElement, CURRENT_CLASS, 'add');
            }

            if (!isNumber && !isDot_) {
                if (currentExpression !== 'calculation' && currentExpression !== 'allClear') {
                    arrayExpression[currentIndex] = currentExpression;
                    isExpression = true;
                }
            }

            if (events[currentExpression]) {
                events[currentExpression]();
            }

            printExpression();
            console.log(arrayExpression, arrayNumber);
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
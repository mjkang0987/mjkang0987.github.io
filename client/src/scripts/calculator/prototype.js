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

        const calculatorResult = document.getElementById('calculator-result');
        const calculatorExpression = document.getElementById('calculator-expression');
        const CURRENT_CLASS = 'current';

        const initValue = 0;
        const arrayExpression = [initValue];

        let currentExpressionElement = null;
        let prevExpressionElement = null;

        let currentExpression = null;
        let currentValue = arrayExpression[0];
        let currentIndex = 0;

        let isNegative = false;
        let isCalculation = false;

        const printExpression = () => {
            console.log();
        };

        const printResult = (result) => {
            calculatorResult.textContent = (+result).toLocaleString('KO-kr');
            console.log('print result', arrayExpression);
        };

        const initArray = (num) => {
            printResult(num);
            arrayExpression.splice(0);
            arrayExpression[0] = num;
            currentIndex = 0;
        };

        const calculation = () => {
            let total = arrayExpression[0];
            let i = 0;

            while (i < arrayExpression.length) {
                const tempExpression = arrayExpression[i];

                if (tempExpression[0] === 'plus') {
                    total += tempExpression[1];
                }

                if (tempExpression[0] === 'subtraction') {
                    total -= tempExpression[1];
                }

                if (tempExpression[0] === 'multiply') {
                    total *= tempExpression[1];
                }

                if (tempExpression[0] === 'divide') {
                    total = total / tempExpression[1];
                }

                i++;
            }

            initArray(total);
        };

        const events = {
            number(num) {
                const isArray = Array.isArray(arrayExpression[currentIndex]);
                const tempValue = isArray ? arrayExpression[currentIndex][1] : (arrayExpression[currentIndex] ?? 0);
                currentValue = +('' + (isCalculation ? 0 : tempValue) + num);

                if (isArray) {
                    arrayExpression[currentIndex][1] = currentValue;
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
            dot() {
                console.log('dot');
            },
            allClear() {
                initArray(initValue);
            }
        };

        const generatorExpression = (data) => {
            currentIndex++;
            arrayExpression[currentIndex] = [data, initValue];

            // if (currentExpression !== data) {
            //     currentIndex++;
            // }

            console.log(arrayExpression);
        };

        const generatorData = (data) => {
            if (!isNaN(+data)) {
                return +data;
            }

            if (data.indexOf('-') > -1) {
                const dataArray = data.split('-');
                return `${dataArray[0]}${dataArray[1].slice(0, 1).toUpperCase()}${dataArray[1].slice(1)}`;
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
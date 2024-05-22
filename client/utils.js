/**
 * utils 내부 method
 * @type {Object}
 */
const utils = {
    /**
     * setFirstUpper method - 첫자 대문자
     * @param {string} text
     * @returns {string | void}
     */
    setFirstUpper({
        text,
    }) {
        if (!text) {
            return;
        }

        if (typeof text !== 'string') {
            text.toString();
        }

        return `${text[0].toUpperCase()}${text.slice(1)}`;
    },
    /**
     * setTimestamp method - CSS, JS timestamp
     * @returns {string}
     */
    setTimestamp() {
        const addZero = (number) => number.toString().length === 1 ? `0${number}` : number;
        const today = new Date();
        const year = today.getFullYear();
        const month = addZero(today.getMonth() + 1);
        const date = addZero(today.getDate());
        const hours = addZero(today.getHours());
        const minutes = addZero(today.getMinutes());
        const seconds = addZero(today.getSeconds());

        return `${year}${month}${date}${hours}${minutes}${seconds}`;
    },
    /**
     * isArray method - Array 검증 함수
     * @returns {boolean}
     */
    isArray({
        arr,
    }) {
        return arr !== undefined && Array.isArray(arr);
    },
    /**
     * isString method - String 검증 함수
     * @returns {boolean}
     */
    isString({
        str,
    }) {
        return str !== undefined && typeof str === 'string';
    },
    /**
     * isNumber method - Number 검증 함수
     * @returns {boolean}
     */
    isNumber({
        num,
    }) {
        return num !== undefined && typeof num === 'number';
    },
};

exports.setFirstUpper = utils.setFirstUpper;
exports.setTimestamp = utils.setTimestamp;
exports.isArray = utils.isArray;
exports.isString = utils.isString;
exports.isNumber = utils.isNumber;


const prototype = (() => {
    const init = () => {
        console.log('init');
    };

    return {
        init
    }
})();

if (document.readyState === 'complete') {
    prototype.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', prototype.init);
}

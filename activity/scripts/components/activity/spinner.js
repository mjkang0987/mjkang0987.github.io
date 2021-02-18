;(function($, doc, win) {
  function quantitySelector() {
    var q = {};
    q.temp = {};
    q.quantitySelector = '.quantitySelector';
    q.spinnerInputSelector = '.currentQuantity .iText';
    q.spinnerController = '.controller';

    q.controlEvent = function() {
      q.this = this;
      q.wrap = q.this.parentNode;
      q.isMinus = q.this.classList ?
        q.this.classList.contains('minus') :
        new RegExp('(^| )minus( |$)', 'gi').test(q.this.className);
      q.thisInput = q.wrap.querySelector(q.spinnerInputSelector);
      q.quantityRule();
    };

    q.totalRule = function() {
      if (!q.thisInput.getAttribute('data-total-number-selector')) {
        return true;
      }

      if (q.isMinus) {
        return true;
      }

      q.wrapper = q.wrap.closest(q.thisInput.getAttribute('data-total-number-selector'));
      q.totalNumber = q.wrapper.dataset.totalNumber;

      q.allSpinnerInput = q.wrapper.querySelectorAll(q.spinnerInputSelector);
      q.temp.totalSum = 0;

      for (var i = 0, iLength = q.allSpinnerInput.length; i < iLength; i++) {
        q.temp.totalSum += Number(q.allSpinnerInput[i].value);
      }

      if (Number(q.totalNumber) <= q.temp.totalSum) {
        alert(q.wrapper.dataset.errorMsg);
        return false;
      }

      return true;
    };

    q.trigger = function() {
      var ev = doc.createEvent('HTMLEvents');
      ev.initEvent('change', true, false);
      q.thisInput.dispatchEvent(ev);
    };

    q.quantityRule = function() {
      if (!q.totalRule()) {
        return;
      }

      q.temp.result = q.isMinus ?
        Number(q.thisInput.value) - 1 :
        Number(q.thisInput.value) + 1;

      q.controlState();

      if (q.temp.result > q.thisInput.getAttribute('data-max-number') || q.temp.result < q.thisInput.getAttribute('data-min-number')) {
        return;
      }

      q.thisInput.value = q.temp.result;
      q.trigger();
    };

    q.controlState = function() {
      if (q.temp.result >= q.thisInput.getAttribute('data-max-number')) {
        q.wrap.querySelector('.plus').setAttribute('disabled', '');
      } else {
        q.wrap.querySelector('.plus').removeAttribute('disabled');
      }

      if (q.temp.result <= q.thisInput.getAttribute('data-min-number')) {
        q.wrap.querySelector('.minus').setAttribute('disabled', '');
      } else {
        q.wrap.querySelector('.minus').removeAttribute('disabled');
      }
    };

    $(doc).on('click', q.quantitySelector + ' ' + q.spinnerController, q.controlEvent);
  }

  quantitySelector();
})(jQuery, document, window);

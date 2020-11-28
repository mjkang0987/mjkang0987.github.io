;(function() {
  'use strict';
  let utils = {};

  const CITIES = {
    '서울': 'seoul'
  };

  const TIME_TEXT = {
    MORNING: '오전',
    AFTERNOON: '오후'
  }

  const {MORNING, AFTERNOON} = TIME_TEXT;

  const API = {
    URL: 'https://api.openweathermap.org/data/2.5/weather',
    KEY: '&appid=8d0fba684264cc55f9b735566611ac78'
  };

  const {URL, KEY} = API;

  utils.Prototype = (function() {
    const Prototype = function() {
      this.init();
    }

    Prototype.prototype = {
      init: function(){
      },
      docSelector: function({
        el: el,
        all: isAll
      }) {
        if (isAll) return document.querySelectorAll(el);
        else return document.querySelector(el);
      }
    }

    return Prototype;
  })();
  const domReady = () => {
    setYear();
    const seoul = new utils.Prototype({
      city: 'seoul'
    });
  };
  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  }
})();
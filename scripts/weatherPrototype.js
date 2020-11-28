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

  const docSelector = ({
    el: el,
    all: isAll
  }) => {
    if (isAll) {
      return document.querySelectorAll(el);
    } else {
      return document.querySelector(el);
    }
  };

  const setYear = _ => {
    const yearWrap = docSelector({el: 'footer .year'});
    const now = new Date();
    yearWrap.innerText = now.getFullYear();
  }

  utils.Prototype = (function() {
    const Prototype = function({
      city: city
    }) {

      this.city = `?q=${city}`;
      this.init();
    }

    Prototype.prototype = {
      init: function() {
        console.log('init');
        this.getFetch();
      },
      getFetch: async function() {
        this.response = await fetch(`${URL}${this.city}${KEY}`);
        this.data = await this.response.json();
        console.log(this.data);
        return this.data;
      },

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
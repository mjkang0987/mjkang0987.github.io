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
    const Prototype = function() {}

    Prototype.prototype = {
      docSelector: function({
        el: el,
        all: isAll
      }) {
        if (isAll) return document.querySelectorAll(el);
        else return document.querySelector(el);
      },
      createEl: function({
        tag: tag
      }) {
        return document.createElement(tag);
      },
      addEl: function({
        wrap: wrap,
        direction: dir,
        el: el
      }) {
        wrap.insertAdjacentElement(dir, el);
      }
    }
    return Prototype;
  })();


  utils.UI_Prototype = (function() {
    const UI_Prototype = function() {
      this.timeTypeEl = this.docSelector({el: 'header .type'});
      this.timeHourEl = this.docSelector({el: 'header .hour'});
      this.timeMinuteEl = this.docSelector({el: 'header .minute'});
      this.timeMinuteEl = this.docSelector({el: 'header .minute'});
      this.cityEl = this.docSelector({el: 'header .location'});

      this.init();
    }

    UI_Prototype.prototype = {
      init: function(){
        this.getNow();
        this.getDate();
        this.setTime();

        this.now = setInterval(_ => {
          this.getNow();
          this.setTime();
        }, 3000);
      },
      getNow: function() {
        this.now = new Date();
        this.setTime();
      },
      getDate: function() {
        this.date = {
          year: this.now.getFullYear(),
          month: this.now.getMonth() + 1,
          day: this.now.getDate()
        }
      },
      getTime: function() {
        return this.gemTime = {
          hour: this.now.getHours(),
          minutes: this.now.getMinutes(),
          seconds: this.now.getSeconds()
        }
      },
      setTime: function() {
        this.time = this.getTime();

        if (this.gemTime.hour > 12) {
          this.hour = this.gemTime.hour - 12;
          this.timeText = AFTERNOON;
        } else {
          this.hour = this.gemTime.hour;
          this.timeText = MORNING;
        }

        this.minutes = this.gemTime.minutes;
        this.seconds = this.gemTime.seconds;

        this.time = {
          hour: this.hour < 10 ? `0${this.hour}` : this.hour,
          minutes: this.minutes < 10 ? `0${this.minutes}` : this.minutes,
          seconds: this.seconds
        }

        this.timeTypeEl.textContent = this.timeText;
        this.timeHourEl.textContent = this.time.hour;
        this.timeMinuteEl.textContent = this.time.minutes;
      },
    }

    return UI_Prototype;
  })();
  utils.SetWeather = (function() {
    const SetWeather = function({
      city: city
    }) {

      this.loaderEl = this.docSelector({el: '.loading'});
      this.city = `?q=${city}`;
      this.init().then(this.loaderEl.classList.add('hidden'));
    }

    SetWeather.prototype = {
      init: async function() {
        this.weather = await this.getFetch();
      },
      getFetch: async function() {
        this.response = await fetch(`${URL}${this.city}${KEY}`);
        if (this.response.ok) {
          this.data = await this.response.json();
        } else {
          this.data = null;
        }
        return this.data;
      },

    }

    return SetWeather;
  })();
  const domReady = () => {
    const {Prototype, UI_Prototype, SetWeather} = utils;
    const prototype = new Prototype();

    const UI = new UI_Prototype();

    const seoul = new SetWeather({
      city: 'seoul'
    });
  };
  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  }
})();
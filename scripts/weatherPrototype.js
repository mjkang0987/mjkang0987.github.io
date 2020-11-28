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

  utils.UI_Prototype = (function() {
    const UI_Prototype = function() {
      this.init();
    }

    UI_Prototype.prototype = {
      init: function(){
        this.getNow();
        this.getDate();
        this.getTime();
        this.UITime();

        this.now = setInterval(_ => {
          this.getNow();
          this.getTime();
        }, 3000);
      },
      getNow: function() {
        this.now = new Date();
      },
      getDate: function() {
        this.date = {
          year: this.now.getFullYear(),
          month: this.now.getMonth() + 1,
          day: this.now.getDate()
        }
      },
      getTime: function() {
        this.gemTime = {
          hour: this.now.getHours(),
          minutes: this.now.getMinutes(),
          seconds: this.now.getSeconds()
        }
      },
      UITime: function() {
        this.time = this.gemTime;
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
          hour: this.hour,
          minutes: this.minutes,
          seconds: this.seconds
        }

        console.log(`${this.time}${this.timeText}`);
      }
    }

    return UI_Prototype;
  })();
  utils.SetWeather = (function() {
    const SetWeather = function({
      city: city
    }) {

      this.city = `?q=${city}`;
      this.init();
    }

    SetWeather.prototype = {
      init: async function() {
        // console.log('init');
        // console.log(await this.getFetch());
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
    setYear();
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
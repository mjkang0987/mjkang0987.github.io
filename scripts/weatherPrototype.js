;(function() {
  'use strict';
  let utils = {};

  const CITIES = {
    'seoul': '서울'
  };

  const TIME_TEXT = {
    MORNING: ['오전', '아침'],
    AFTERNOON: '오후',
    DINNER: '저녁',
    NIGHT: '밤',
    DAWN: '새벽'
  };

  const TEMP = {
    ABSOLUTE: 273
  };

  const CLOTHES = {
    HOT: ['민소매', '반팔', '반바지', '짧은 치마', '린넨소재 옷'],
    WARM: ['반팔', '얇은 셔츠', '반바지', '면바지'],
    COZY: ['긴팔티', '블라우스', '면바지', '슬랙스'],
    MILD: ['얇은 가디건', '얇은 니트', '맨투맨', '후드', '면바지', '청바지', '슬랙스'],
    COOL: ['자켓', '가디건', '청자켓', '니트', '스타킹', '청바지'],
    CHILLY: ['트렌치코트', '간절기 야상', '여러겹 껴입기', '기모바지'],
    COLD: ['코트', '가죽자켓', '히트텍', '기모'],
    FREEZING: ['야상', '패딩', '목도리', '누빔옷', '두꺼운 코트', '기모']
  };

  const {MORNING, AFTERNOON} = TIME_TEXT;
  const {ABSOLUTE} = TEMP;

  const API = {
    URL: 'https://api.openweathermap.org/data/2.5/weather',
    KEY: '&lang=kr&appid=8d0fba684264cc55f9b735566611ac78'
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
    };
    return Prototype;
  })();


  utils.UI_Prototype = (function() {
    const UI_Prototype = function() {
      this.timeTypeEl = this.docSelector({el: 'header .type'});
      this.timeHourEl = this.docSelector({el: 'header .hour'});
      this.timeMinuteEl = this.docSelector({el: 'header .minute'});
      this.timeMinuteEl = this.docSelector({el: 'header .minute'});

      this.init();
    };

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
        };
      },
      getTime: function() {
        return this.gemTime = {
          hour: this.now.getHours(),
          minutes: this.now.getMinutes(),
          seconds: this.now.getSeconds()
        };
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

        this.time = {
          hour: this.hour < 10 ? `0${this.hour}` : this.hour,
          minutes: this.gemTime.minutes < 10 ? `0${this.gemTime.minutes}` : this.gemTime.minutes,
          seconds: this.gemTime.seconds
        };

        this.timeTypeEl.textContent = this.timeText;
        this.timeHourEl.textContent = this.time.hour;
        this.timeMinuteEl.textContent = this.time.minutes;
      }
    };

    return UI_Prototype;
  })();
  utils.SetWeather = (function() {
    const SetWeather = function({
      city: city
    }) {

      this.cityEl = this.docSelector({el: 'header .location'});
      this.tempEl = this.docSelector({el: '.nowTempWrap span'});
      this.tempMaxEl = this.docSelector({el: '.maxWrap span'});
      this.tempMinEl = this.docSelector({el: '.minWrap span'});
      this.weatherEl = this.docSelector({el: '.weather .weatherType'});
      this.loaderEl = this.docSelector({el: '.loading'});

      this.city = `?q=${city}`;
      this.init();
    };

    SetWeather.prototype = {
      init: async function () {
        this.weather = await this.getFetch();
        console.log(this.weather);
        await this.setUI();
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

    UI_Prototype.prototype = Object.assign(UI_Prototype.prototype, Prototype.prototype);
    const UI = new UI_Prototype();

    SetWeather.prototype = Object.assign(SetWeather.prototype, Prototype.prototype);
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
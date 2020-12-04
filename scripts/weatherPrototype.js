import {
  CITIES,
  TIME_TEXT,
  TEMP,
  CLOTHES,
  TITLE,
  API
} from './constans.js';

;(function() {
  'use strict';
  let utils = {} || function() {};

  const {MORNING, AFTERNOON, DINNER, NIGHT, DAWN} = TIME_TEXT;
  const {ABSOLUTE} = TEMP;
  const {HOT, WARM, COZY, MILD, COOL, CHILLY, COLD, FREEZING} = CLOTHES;
  const {SUMMER, MIDDLE, WINTER} = TITLE;
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
      this.contentTimeEl = this.docSelector({el: '.weather .timeType'});
      this.yearEl = this.docSelector({el: 'footer .year'});
      this.init();
    };

    UI_Prototype.prototype = {
      init: function(){
        this.getNow();
        this.getDate();
        this.setTime();
        this.yearEl.textContent = this.date.year;

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
          this.timeText = AFTERNOON[0];
        } else {
          this.hour = this.gemTime.hour;
          this.timeText = MORNING[0];
        }

        this.detailTime =
          this.gemTime.hour < 6 ? DAWN
            : this.gemTime.hour < 12 ? MORNING[1]
            : this.gemTime.hour < 8 ? DINNER
              : NIGHT;

        this.time = {
          hour: this.hour < 10 ? `0${this.hour}` : this.hour,
          minutes: this.gemTime.minutes < 10 ? `0${this.gemTime.minutes}` : this.gemTime.minutes,
          seconds: this.gemTime.seconds
        };

        this.timeTypeEl.textContent = this.timeText;
        this.timeHourEl.textContent = this.time.hour;
        this.timeMinuteEl.textContent = this.time.minutes;
        this.contentTimeEl.textContent = `${this.detailTime},`;
      }
    };

    return UI_Prototype;
  })();
  utils.SetWeather = (function() {
    const SetWeather = function({
      city: city
    }) {

      this.city = typeof city === 'undefined' ? '' : city;
      this.lon = null;
      this.lat = null;
      this.queryString = '';
      this.localItems = localStorage.getItem('locations');

      this.cityEl = this.docSelector({el: 'header .location'});
      this.tempEl = this.docSelector({el: '.nowTempWrap span'});
      this.tempMaxEl = this.docSelector({el: '.maxWrap span'});
      this.tempMinEl = this.docSelector({el: '.minWrap span'});
      this.weatherEl = this.docSelector({el: '.weather .weatherType'});
      this.clothesTitleEl = this.docSelector({el: '.recommendClothes strong'});
      this.clothesEl = this.docSelector({el: '.recommendClothes ul'});
      this.loaderEl = this.docSelector({el: '.loading'});

      this.init();
    };

    SetWeather.prototype = {
      init: function () {
        // if (!this.localItems) return this.getLocation();
      },
      getLocation: function() {
        navigator.geolocation.getCurrentPosition(position => {
          this.lon = position.coords.longitude;
          this.lat = position.coords.latitude;
          this.queryString = `?lat=${this.lat}&lon=${this.lon}`;
          this.handlerWeather();
        }, (error) => {
          this.queryString = `?q=seoul`;
          this.handlerWeather();
          console.error(error);
        }, {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: 3000
        });
      },
      handlerWeather: async function() {
        this.docSelector({el: 'body'}).classList.remove('load');
        this.weather = await this.getFetch();
        await this.setUI();
      },
      getFetch: async function () {
        await console.log(`${URL}${this.queryString}${KEY}`);
        this.response = await fetch(`${URL}${this.queryString}${KEY}`);
        if (this.response.ok) this.data = await this.response.json();
        else this.data = null;
        this.loaderEl.classList.add('hidden');
        return this.data;
      },
      setUI: function () {
        console.log(this.weather);
        this.city = this.weather.name.toLowerCase();
        this.gemTemp = {
          current: this.weather.main.temp,
          max: this.weather.main.temp_max,
          min: this.weather.main.temp_min
        };
        this.weatherState = this.weather.weather[0].description;

        this.setCity();
        this.setTemp();
        this.setWeather();
        this.setClothes();
      },
      setCity: function () {
        this.cityEl.textContent = CITIES[this.city];
      },
      setTemp: function () {
        this.temp = {
          current: Math.round(this.gemTemp.current - ABSOLUTE),
          max: Math.round(this.gemTemp.max - ABSOLUTE),
          min: Math.round(this.gemTemp.min - ABSOLUTE)
        };

        this.tempEl.textContent = this.temp.current;
        this.tempMaxEl.textContent = this.temp.max;
        this.tempMinEl.textContent = this.temp.min;
      },
      setWeather: function () {
        this.weatherEl.textContent = this.weatherState;
      },
      setClothes: function () {
        switch (this.temp) {
        case this.temp > 5:
          this.title = WINTER;
          this.style = COLD;
          break;
        case this.temp > 9:
          this.title = MIDDLE;
          this.style = CHILLY;
          break;
        case this.temp > 11:
          this.title = MIDDLE;
          this.style = COOL;
          break;
        case this.temp > 16:
          this.title = MIDDLE;
          this.style = MILD;
          break;
        case this.temp > 19:
          this.title = MIDDLE;
          this.style = COZY;
          break;
        case this.temp > 22:
          this.title = SUMMER;
          this.style = WARM;
          break;
        case this.temp > 27:
          this.title = SUMMER;
          this.style = HOT;
          break;
        default:
          this.title = WINTER;
          this.style = FREEZING;
          break;
        }
        this.clothesTitleEl.textContent = `대충 ${this.title} 옷`;
        this.setStyles();
      },
      setStyles: function () {
        this.styles = this.style.map((style =>
            `<li>${style}</li>`
        )).join('');
        this.clothesEl.innerHTML = this.styles;
      }
    };

    return SetWeather;
  })();
  const domReady = () => {
    const {Prototype, UI_Prototype, SetWeather} = utils;
    const prototype = new Prototype();

    UI_Prototype.prototype = Object.assign(UI_Prototype.prototype, Prototype.prototype);
    const UI = new UI_Prototype();

    SetWeather.prototype = Object.assign(SetWeather.prototype, Prototype.prototype);

    new SetWeather({city: ''});
  };
  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  }
})();
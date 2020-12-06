import {
  CITIES,
  TIME_TEXT,
  TEMP,
  TEMPS,
  TITLE,
  API,
  MAGIC_NUMBER,
  FIRST_KEY,
  FIRST_KEY_CITIES
} from './constans.js';

;(function() {
  'use strict';
  let utils = {} || function() {};

  const {MORNING, AFTERNOON, DINNER, NIGHT, DAWN} = TIME_TEXT;
  const {ABSOLUTE} = TEMP;
  const {SUMMER, MIDDLE, WINTER} = TITLE;
  const {URL, KEY} = API;
  const {FIRST, ONE} = MAGIC_NUMBER;

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

        this.time = {
          hour: this.hour < 10 ? `0${this.hour}` : this.hour,
          minutes: this.gemTime.minutes < 10 ? `0${this.gemTime.minutes}` : this.gemTime.minutes,
          seconds: this.gemTime.seconds
        };

        this.setHalfTime();
        this.setDetailTime();
        this.setTimeText();
      },
      setHalfTime: function() {
        if (this.gemTime.hour > 12) {
          this.hour = this.gemTime.hour - 12;
          this.timeText = AFTERNOON[0];
        } else {
          this.hour = this.gemTime.hour;
          this.timeText = MORNING[0];
        }
      },
      setDetailTime: function() {
        this.detailTime =
          this.gemTime.hour < 6 ? DAWN
            : this.gemTime.hour < 12 ? MORNING[1]
            : this.gemTime.hour < 8 ? DINNER
              : NIGHT;
      },
      setTimeText: function() {
        this.timeTypeEl.textContent = this.timeText;
        this.timeHourEl.textContent = this.time.hour;
        this.timeMinuteEl.textContent = this.time.minutes;
        this.contentTimeEl.textContent = `${this.detailTime},`;
      }
    };

    return UI_Prototype;
  })();
  utils.SetWeather = (function() {
    const SetWeather = function() {

      this.city = '';
      this.lon = null;
      this.lat = null;
      this.queryString = '';
      this.localItems = localStorage.getItem('locations');

      this.body = this.docSelector({el: 'body'});
      this.tempWrapEl = this.docSelector({el: '.temperature'});
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
        if (!this.localItems) return this.getLocation();
      },
      getLocation: function() {
        navigator.geolocation.getCurrentPosition(position => {
          this.successGeolocation({position: position});
        }, (error) => {
         this.failGeolocation();
          console.error(error);
        }, {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: 3000
        });
      },
      successGeolocation: function({
        position: position
      }) {
        this.lon = position.coords.longitude;
        this.lat = position.coords.latitude;
        this.queryString = `?lat=${this.lat}&lon=${this.lon}`;
        this.fetchData();
      },
      failGeolocation: function() {
        this.queryString = `?q=seoul`;
        this.fetchData();
      },
      fetchData: async function() {
        this.body.classList.remove('load');
        this.weather = await this.getFetch();
        await this.setUI();
      },
      getFetch: async function () {
        this.response = await fetch(`${URL}${this.queryString}${KEY}`);
        if (this.response.ok) this.data = await this.response.json();
        else this.data = null;
        this.loaderEl.classList.add('hidden');
        return this.data;
      },
      setUI: function () {
        console.log(this.weather);
        this.city = this.weather.name.replace('ŏ', 'o').toLowerCase();
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
        this.setStyle();
        this.setStyles();
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
        this.title =
          this.temp > 9 ? MIDDLE
            : this.temp > 22 ? SUMMER
            : WINTER;

        this.clothesTitleEl.textContent = `대충 ${this.title} 옷`;
      },
      setStyle: function() {
        this.styleIndex = Object.keys(TEMPS).map(Number).find(temp => {
          return temp >= this.temp.current;
        }, [1]);

        this.style = TEMPS[this.styleIndex];
        this.tempWrapEl.dataset.temp = this.style[FIRST].toLowerCase();
      },
      setStyles: function () {
        this.styles = this.style.splice(ONE, this.style.length - ONE).map((style =>
            `<li>${style}</li>`
        )).join('');
        this.clothesEl.innerHTML = this.styles;
      }
    };

    return SetWeather;
  })();

  utils.Layer = (function() {
    const Layer = function({
      trigger: trigger,
      el: el,
      btnClose: btnClose,
      toggleClass: toggleClass
    }) {
      if (!trigger) return;

      this.trigger = this.docSelector({el : trigger});
      this.el = this.docSelector({el: el});
      this.btnClose = this.el.querySelector(btnClose);
      this.toggleClass = toggleClass || 'on';
      this.trigger.addEventListener('click', this.open.bind(this));
      this.btnClose.addEventListener('click', this.close.bind(this));
    }

    Layer.prototype = {
      init: function() {
        console.log('init');
      },
      open: function() {
        this.trigger.classList.add(this.toggleClass);
        this.el.classList.add(this.toggleClass);
      },
      close: function() {
        this.el.classList.remove(this.toggleClass);
        this.trigger.classList.remove(this.toggleClass);
      }
    }
    return Layer;
  })();
  const domReady = () => {
    const {Prototype, UI_Prototype, SetWeather, Layer} = utils;
    const prototype = new Prototype();

    UI_Prototype.prototype = Object.assign(UI_Prototype.prototype, Prototype.prototype);
    const UI = new UI_Prototype();

    SetWeather.prototype = Object.assign(SetWeather.prototype, Prototype.prototype);
    new SetWeather();

    Layer.prototype = Object.assign(Layer.prototype, Prototype.prototype);
    new Layer({
      trigger: 'header .info',
      el: '.layer.cities',
      btnClose: '.buttonClose'
    });

    new Layer({
      trigger: 'header .addLocation',
      el: '.layer.cityAdd',
      btnClose: '.buttonClose'
    });
  };
  if (document.readyState === 'complete') {
    domReady();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady);
  }
})();
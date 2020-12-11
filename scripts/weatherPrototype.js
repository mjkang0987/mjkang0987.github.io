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
} from './constants.js';

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
    toggleClassMethod: function({
      el: el,
      methodType: methodType,
      toggleClass: toggleClass
    }) {
      el.classList[methodType](toggleClass);
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
    this.queryString = '';

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
    this.addCitiesEl = this.docSelector({el: '.cityAdd ul'});
    this.citiesEl = this.docSelector({el: '.cities ul'});

    this.addCitiesEl.addEventListener('click', this.getTargetItem.bind(this));
    this.citiesEl.addEventListener('click', this.getTargetItem.bind(this));
    this.init();
  };

  SetWeather.prototype = {
    init: function () {
      this.getItems();

      if (this.localItems === null) {
        this.city = 'seoul';
        localStorage.setItem('cities', JSON.stringify({
          default: this.city,
          list: [this.city]
        }));
      } else {
        this.city = this.localItems.default;
      }
      this.getLocation();
    },
    getLocation: function() {
      this.queryString = `?q=${this.city}`;
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
      const {temp, temp_max, temp_min} = this.weather.main;

      this.city = this.weather.name.replace('ŏ', 'o').toLowerCase();
      this.city = this.weather.name.replace(' City', '').toLowerCase();
      this.city = this.weather.name.replace('-si', '').toLowerCase();
      // 규식이....

      this.gemTemp = {
        current: temp,
        max: temp_max,
        min: temp_min
      };
      this.weatherState = this.weather.weather[FIRST].description;

      this.setCity();
      this.setTemp();
      this.setWeather();
      this.setItems();
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
      });

      this.style = TEMPS[this.styleIndex];
      this.tempWrapEl.dataset.temp = this.style[FIRST].toLowerCase();
    },
    setStyles: function () {
      this.styles = this.style.splice(ONE, this.style.length - ONE).map((style =>
          `<li>${style}</li>`
      )).join('');
      this.clothesEl.innerHTML = this.styles;
    },
    getItems: function() {
      this.localItems = JSON.parse(localStorage.getItem('cities'));
    },
    getTargetItem: function(e) {
      this.target = e.target;
      if (this.target.tagName !== 'BUTTON') return;
      this.targetCity = this.target.dataset.city;

      this.getItems();

      this[`${this.target.className}Items`]();
    },
    addItems: function() {
      if (this.localItems.list.indexOf(this.targetCity) > -1) {
        return alert(`${CITIES[this.targetCity]}, 이곳은 이미 추가된 도시입니다`);
      } else {
        this.localItems.default = this.targetCity;
        this.localItems.list.unshift(this.targetCity);
        localStorage.setItem('cities', JSON.stringify(this.localItems));
      }

      location.reload();
    },
    removeItems: function() {
      if (this.localItems.default === this.targetCity) return alert(`${CITIES[this.targetCity]}, 이곳은 현재 선택된 도시 입니다.\n현재 선택된 도시는 삭제할 수 없습니다.`);

      this.itemIndex = this.localItems.list.indexOf(this.targetCity);
      this.localItems.list.splice(this.itemIndex, ONE);

      localStorage.setItem('cities', JSON.stringify(this.localItems));

      this.itemWrap = this.target.closest('li');
      this.itemWrap.parentNode.removeChild(this.itemWrap);
    },
    loadItems: function() {
      this.itemIndex = this.localItems.list.indexOf(this.targetCity);
      this.localItems.list.splice(this.itemIndex, ONE);
      this.localItems.default = this.targetCity;
      this.localItems.list.unshift(this.targetCity);

      localStorage.setItem('cities', JSON.stringify(this.localItems));

      location.reload();
    },
    setItems: function() {
      this.getItems();
      if (!this.localItems) return;
        this.localItems.list.map((item, index) => {
        this.cityEl = this.createEl({tag: 'li'});
        this.cityEl.innerHTML = `
          <span>${CITIES[item]}
            ${index === 0 ?  `<span class="default">선택됨</span>` : ''}
          </span>
          <span>
            <button 
              type="button"
              class="load"
              data-city="${item}">
              조회
            </button>
            <button 
              type="button"
              class="remove"
              data-city="${item}">
              삭제
            </button>
          </span>
        `;
      this.citiesEl.append(this.cityEl);
      }).join('');
    },
  };

  return SetWeather;
})();

utils.Layer = (function() {
  const Layer = function({
    trigger: trigger,
    el: el,
    btnClose: btnClose,
    toggleClass: toggleClass,
    addCity: isAddCity
  }) {
    if (!trigger) return;

    this.trigger = this.docSelector({el : trigger});
    this.el = this.docSelector({el: el});
    this.citiesWrapEl = this.el.querySelector('ul');
    this.btnClose = this.el.querySelector(btnClose);
    this.toggleClass = toggleClass || 'on';
    this.isAddCity = isAddCity;
    this.btnText = this.isAddCity ? '추가' : '삭제';
    this.btnClass = this.isAddCity ? 'add' : 'remove';

    this.trigger.addEventListener('click', this.open.bind(this));
    this.btnClose.addEventListener('click', this.close.bind(this));

    if (this.isAddCity) {
      this.searchForm = this.el.querySelector('#search_city');
      this.searchForm.addEventListener('input', this.getKeyword.bind(this));
    }
  }

  Layer.prototype = {
    open: function() {
      this.toggleClassMethod({
        el: this.trigger,
        methodType: 'add',
        toggleClass: this.toggleClass
      });
      this.toggleClassMethod({
        el: this.el,
        methodType: 'add',
        toggleClass: this.toggleClass
      });
    },
    close: function() {
      this.toggleClassMethod({
        el: this.el,
        methodType: 'remove',
        toggleClass: this.toggleClass
      });
      this.toggleClassMethod({
        el: this.trigger,
        methodType: 'remove',
        toggleClass: this.toggleClass
      });

      if (this.isAddCity) this.searchForm.removeEventListener('input', this.search);
    },
    getKeyword: function(e) {
      this.value = e.target.value;
      if (!this.value || this.value === '') return this.resetCities();

      this.cities = Object.keys(FIRST_KEY).find(city => {
        return city === this.value;
      });

      this.setFirstKeyword();
    },
    setFirstKeyword: function() {
      this.resetCities();
      if (this.cities === undefined) return this.setKeyword();
      this.firstKeyCities = FIRST_KEY[this.cities];

      for (const [key, value] of Object.entries(FIRST_KEY_CITIES[this.firstKeyCities])) {
        this.cityEl = this.createEl({tag: 'li'});
        this.cityEl.innerHTML = `
          <span>${value}</span>
          <button 
            type="button"
            class="${this.btnClass}"
            data-city="${key}">
            ${this.btnText}
          </button>
        `;
        this.citiesWrapEl.append(this.cityEl);
      }
    },
    setKeyword: function() {
      this.currentCities = Object.entries(CITIES).filter(([key, value]) => {
        return value.indexOf(this.value) > -1;
      });

      this.currentCities.map(([key, value]) => {
        this.cityEl = this.createEl({tag: 'li'});
        this.cityEl.innerHTML = `
          <span>${value.replace(this.value, `<strong>${this.value}</strong>`)}</span>
          <button 
            type="button"
            class="${this.btnClass}"
            data-city="${key}">
            ${this.btnText}
          </button>
        `;
        this.citiesWrapEl.append(this.cityEl);
      }).join('');
    },
    resetCities: function() {
      this.citiesWrapEl.innerHTML = '';
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
  const citiesLayer = new Layer({
    trigger: 'header .info',
    el: '.layer.cities',
    btnClose: '.buttonClose'
  });

  const addCitiesLayer = new Layer({
    trigger: 'header .addLocation',
    el: '.layer.cityAdd',
    btnClose: '.buttonClose',
    addCity: true
  });
};
if (document.readyState === 'complete') {
  domReady();
} else if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', domReady);
}
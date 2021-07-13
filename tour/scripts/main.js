;(function() {
  document.addEventListener('touchstart', function() {}, false);

  const docSelector = (selector, all) => {
    if (all) {
      return document.querySelectorAll(selector);
    }
    return document.querySelector(selector);
  };

  const ELEMENT = {
    BODY: docSelector('body'),
    SHOP: docSelector('#page_main'),
    SHOP_HEADER: docSelector('#page_main .pageHeader'),
    BANNER: docSelector('.appBanner'),
    HEADER: docSelector('.fitHeader'),
    SEARCH: docSelector('.searchWrap'),
    MAIN: docSelector('.mainWrap'),
    CATEGORY_WRAP: docSelector('.categoryWrap'),
    CATEGORY: docSelector('.mainCategory'),
    TOP: docSelector('.buttonTop')
  };

  const {
    BODY,
    SHOP,
    SHOP_HEADER,
    BANNER,
    HEADER,
    MAIN,
    SEARCH,
    CATEGORY_WRAP,
    CATEGORY,
    TOP
  } = ELEMENT;

  let bannerHeight = null;
  let headerHeight = null;
  let mainMarginTop = null;
  let searchHeight = null;
  let shoppingHeaderHeight = null;
  let categoryHeight = null;
  let contentTop = null;
  let personalSlide = null;
  let discountSlide = null;

  const lazyLoad = _ => {
    const lazyLoadImages = Array.prototype.slice.call(document.querySelectorAll('.lazy'));
    const imgObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imgObserver.unobserve(img);
        }
      });
    });

    lazyLoadImages.forEach(img => {
      imgObserver.observe(img);
    });
  };

  const calculatorTop = _ => {
    bannerHeight = !BANNER || BANNER.classList.contains('hidden') || SHOP ? 0 : BANNER.offsetHeight;
    headerHeight = HEADER ? HEADER.offsetHeight : 0;
    shoppingHeaderHeight = SHOP_HEADER ? SHOP_HEADER.offsetHeight : 0;
    searchHeight = SEARCH ? SEARCH.offsetHeight : 0;
    categoryHeight = CATEGORY_WRAP ? CATEGORY_WRAP.offsetHeight : 0;
    mainMarginTop = bannerHeight + headerHeight;
    contentTop = searchHeight + categoryHeight + shoppingHeaderHeight;
  };

  const changeTop = _ => {
    MAIN.style.marginTop = mainMarginTop + 'px';
  };

  const offBodyScroll = _ => {
    window.removeEventListener('scroll', scrollClass);

    const scrollTop = window.scrollY;

    if (scrollTop >= contentTop) {
      CATEGORY.classList.add('fixed');
      TOP.classList.add('active');
    }

    BODY.classList.add('noScroll');
    BODY.style.top = -(scrollTop) + 'px';
  };

  const onBodyScroll = _ => {
    const bodyTop = (BODY.style.top).replace('px', '');
    BODY.classList.remove('noScroll');
    window.scroll(0, Number(-1 * (bodyTop)));
    BODY.style.top = 0 + 'px';

    window.addEventListener('scroll', scrollClass);
  };

  const showElement = ({
    trigger: trigger,
    element: el,
    type: type,
    toggleClass: toggleClass,
    touchClose: isTouchClose,
    callback: cb
  }) => {
    if (!el) {
      return;
    }

    if (trigger) {
      trigger.addEventListener('click', _ => {
        el.classList[type](toggleClass);
        if (cb) {
          cb();
        }
      });
    } else {
      el.classList[type](toggleClass);
      if (cb) {
        cb();
      }
    }

    if (isTouchClose) {
      touchClose({
        target: el,
        element: el,
        toggleClass: toggleClass,
        callback: _ => {
          onBodyScroll();
        }
      });
    }
  };

  const hiddenElement = ({
    trigger: trigger,
    element: el,
    type: type,
    toggleClass: toggleClass,
    callback: cb
  }) => {
    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', _ => {
      el.classList[type](toggleClass);
      if (cb) {
        cb();
      }
    });
  };

  const toggleElement = ({
    trigger: trigger,
    element: element,
    toggleClass: toggleClass,
    touchClose: isTouchClose
  }) => {
    trigger.addEventListener('click', _ => {
      const classes = element.getAttribute('class');
      if (classes.indexOf(toggleClass) < 0) {
        element.classList.add(toggleClass);
      } else {
        element.classList.remove(toggleClass);
      }

      if (isTouchClose) {
        touchClose({
          target: trigger,
          element: element,
          toggleClass: toggleClass
        });
      }
    });
  };

  const touchClose = ({
    target: target,
    element: element,
    toggleClass: toggleClass,
    callback: cb
  }) => {
    window.addEventListener('touchstart', e => {
      let windowTarget = e.target;
      if (target === element && target === windowTarget) {
        element.classList.remove(toggleClass);
        if (cb) {
          cb();
        }
      }
      while (windowTarget !== undefined && windowTarget.parentNode) {
        if (windowTarget === target) {
          return false;
        }
        windowTarget = windowTarget.parentNode;
      }
      element.classList.remove(toggleClass);
    }, true);
  };

  const removeClassAll = ({
    list: list,
    class: toggleClass,
    parent: parent
  }) => {
    Array.prototype.map.call(list, (el) => {
      if (parent === true) {
        el.parentNode.classList.remove(toggleClass);
      } else {
        el.classList.remove(toggleClass);
      }
    });
  };

  const scrollClass = _ => {
    const methodCategoryClass = window.scrollY >= contentTop ? 'add' : 'remove';
    CATEGORY.classList[methodCategoryClass]('fixed');
    TOP.classList[methodCategoryClass]('active');
  };

  const fetchData = (loadData) => {
    return fetch(loadData).then(response => {
      return response.json();
    });
  };

  const changeColor = ({
    data: data
  }) => {
    const loadContent = data;
    const wrapper = docSelector('.personalWrap');
    wrapper.dataset.color = loadContent;
  };

  const setPagination = ({
    wrap: wrap,
    current: current,
    total: total
  }) => {
    wrap.innerHTML = `
      <span class="current">${current}</span>
      <span class="total">${total}</span>
    `;
  };

  const bindSwiper = ({
    element: el,
    slide: slide,
    slider: slider,
    space: space,
    initialSlide: index,
    view: view,
    pagination: pagination,
    loop: loop,
    auto: auto,
    callback: cb
  }) => {
    let newSlide = null;
    newSlide = new Swiper(el, {
      speed: 400,
      slidesPerView: view || 'auto',
      spaceBetween: (typeof space !== 'undefined') ? space : 15,
      wrapperClass: slide,
      slideClass: slider,
      slideToClickedSlide: true,
      initialSlide: index || 0,
      beforeDestroy: true,
      autoHeight: true,
      lazyLoading: true,
      pagination: pagination || false,
      loop: loop || false,
      autoplay: auto || false,
      onSlideChangeEnd: _ => {
        if (!cb) {
          return;
        }

        if (cb.end) {
          switch (cb.end) {
          case 'pagination':
            const clone = loop ? 2 : 0;
            const total = Number(el.querySelectorAll(`.${slider}`).length - clone);
            setPagination({
              wrap: el.querySelector('.paginationWrap'),
              current: 1,
              total: total
            });
            if (!newSlide) {
              return;
            }
            const wrap = newSlide.container[0].querySelector('.paginationWrap');
            const current = newSlide.activeIndex > total ? 1 : newSlide.activeIndex;
            setPagination({
              wrap: wrap,
              current: current,
              total: total
            });
            break;
          default:
            return new Error();
          }
        }
      }
    });
  };

  const setUI = ({
    wrap: wrap,
    apiList: apiList,
    type: type,
    callback: cb
  }) => {
    const filterList = type !== 'all' ? apiList.list.filter(list => list.type === type) : apiList.list;
    const errorSrc = '//openimage.interpark.com/tour-mobile/pages/tour/main/transparent.png';
    const src = './images/img-sample.png';
    const ui = filterList.map(list => {
      return `<li
      class="discountContentSlider"
      data-type="${list.type}">
      <a 
        href="#"
        class="linkInfo">
        <span class="imgWrap">
         <img
           src=""
           class="lazy"
           data-src="${src}"
           onerror="this.src='${errorSrc}'"
           alt="">
        </span>
        <div class="infoWrap">
          <span class="badge">
          ${list.type === 'package'
    ? '패키지'
    : list.type === 'travel'
      ? '여행'
      : list.type === 'domestic'
        ? '국내숙박'
        : '호텔'}
            </span>
            <strong class="infoTitle">${list.title}</strong>
            <div class="infoPriceWrap">
              <span class="infoPrice">${list.price}</span>
              <em>원~</em>
            </div>
          </div>
        </a>
      </li>`;
    }).join('');
    docSelector(`.${wrap}`).innerHTML = ui;
    if (cb) {
      lazyLoad();
      cb();
    }
  };

  const setFilter = ({
    wrap: wrap,
    button: el,
    class: toggleClass,
    data: data,
    callback: cb
  }) => {
    if (cb) {
      cb();
    }
    const listButton = wrap.querySelectorAll(el);
    Array.prototype.map.call(listButton, (button, index) => {
      button.addEventListener('click', e => {
        removeClassAll({
          list: listButton,
          class: toggleClass,
          parent: true
        });
        e.preventDefault();
        const dataFilter = button.dataset.filter;

        setUI({
          wrap: 'discountContentSlide',
          apiList: data,
          type: dataFilter,
          callback: _ => {
            const opts = {
              element: docSelector('.discountContentSlideWrap'),
              slide: 'discountContentSlide',
              slider: 'discountContentSlider'
            };

            if (discountSlide) {
              discountSlide.destroy(true, true);
            }

            discountSlide = new Swiper(opts.element, {
              speed: 400,
              slidesPerView: opts.view || 'auto',
              spaceBetween: (typeof opts.space !== 'undefined') ? opts.space : 15,
              wrapperClass: opts.slide,
              slideClass: opts.slider,
              slideToClickedSlide: true,
              beforeDestroy: true,
              autoHeight: true,
              initialSlide: 0,
              pagination: opts.pagination || false,
              loop: opts.loop || false,
              autoplay: opts.auto || false
            });
          }
        });

        button.parentNode.classList.add(toggleClass);
      });
    });
  };

  const setPersonal = ({
    wrap: wrap,
    button: el,
    content: content,
    class: toggleClass,
    random: random,
    callback: cb,
    load: load
  }) => {
    const listButton = wrap.querySelectorAll(el);
    const listContent = wrap.querySelectorAll(content);
    const initIndex = random === true ? random : 0;

    listButton[initIndex].parentNode.classList.add(toggleClass);
    listContent[initIndex].classList.add(toggleClass);

    if (load) {
      cb[load]();
    }

    if (!cb) {
      return;
    }

    if (cb.changeColor) {
      let colorName = listContent[0].dataset.content === 'my'
        ? listContent[0].querySelector('.personalContentSlider').dataset.content
        : listButton[0].dataset.color;
      changeColor({data: colorName});
    }

    Array.prototype.map.call(listButton, (button) => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const dataContent = button.dataset.tabContent;
        const contentElement = docSelector(`${content}[data-content="${dataContent}"]`);

        if (!cb) {
          return;
        }

        if (cb.changeColor) {
          let tabColorName = e.target.parentNode.dataset.color === 'my'
            ? listContent[0].querySelector('.personalContentSlider').dataset.content
            : e.target.parentNode.dataset.color;

          changeColor({data: tabColorName});
        }

        removeClassAll({
          list: listContent,
          class: toggleClass,
          parent: false
        });

        removeClassAll({
          list: listButton,
          class: toggleClass,
          parent: true
        });

        button.parentNode.classList.add(toggleClass);
        contentElement.classList.add(toggleClass);

        if (cb) {
          cb.first();
        }
      });
    });
  };

  const scrollTop = _ => {
    $('html, body').animate({
      scrollTop: 0
    }, 500);
  };

  const domReady = () => {
    calculatorTop();
    changeTop();

    window.addEventListener('scroll', scrollClass);

    hiddenElement({
      trigger: docSelector('.appBanner .closeButton'),
      element: docSelector('.appBanner'),
      type: 'add',
      toggleClass: 'hidden',
      callback: _ => {
        calculatorTop();
        changeTop();
      }
    });

    showElement({
      element: docSelector('.bottomLayer.reviews'),
      type: 'add',
      toggleClass: 'active',
      touchClose: true,
      callback: _ => {
        offBodyScroll();
      }
    });

    hiddenElement({
      trigger: docSelector('.bottomLayer.reviews .buttonLayerClose'),
      element: docSelector('.bottomLayer.reviews'),
      type: 'remove',
      toggleClass: 'active',
      callback: _ => {
        onBodyScroll();
      }
    });

    showElement({
      trigger: docSelector('.personalLocation .buttonList'),
      element: docSelector('.bottomLayer.cities'),
      type: 'add',
      toggleClass: 'active',
      touchClose: true,
      callback: _ => {
        offBodyScroll();
      }
    });

    hiddenElement({
      trigger: docSelector('.bottomLayer.cities .buttonLayerClose'),
      element: docSelector('.bottomLayer.cities'),
      type: 'remove',
      toggleClass: 'active',
      callback: _ => {
        onBodyScroll();
      }
    });

    showElement({
      trigger: docSelector('.buttonCouponDownload[data-popup="coupon-price-1000"]'),
      element: docSelector('.couponLayer.coupon-price-1000'),
      type: 'add',
      toggleClass: 'active',
      callback: _ => {
        offBodyScroll();
      }
    });

    hiddenElement({
      trigger: docSelector('.couponLayer.coupon-price-1000 .buttonClose'),
      element: docSelector('.couponLayer.coupon-price-1000'),
      type: 'remove',
      toggleClass: 'active',
      callback: _ => {
        onBodyScroll();
      }
    });

    showElement({
      trigger: docSelector('.buttonCouponDownload[data-popup="coupon-discount-10"]'),
      element: docSelector('.couponLayer.coupon-discount-10'),
      type: 'add',
      toggleClass: 'active',
      callback: _ => {
        offBodyScroll();
      }
    });

    hiddenElement({
      trigger: docSelector('.couponLayer.coupon-discount-10 .buttonClose'),
      element: docSelector('.couponLayer.coupon-discount-10'),
      type: 'remove',
      toggleClass: 'active',
      callback: _ => {
        onBodyScroll();
      }
    });

    showElement({
      trigger: docSelector('.eventWrap .linkMore'),
      element: docSelector('.layerFull.banners'),
      type: 'add',
      toggleClass: 'active',
      callback: _ => {
        offBodyScroll();
      }
    });

    hiddenElement({
      trigger: docSelector('.layerFull.banners .buttonLayerClose'),
      element: docSelector('.layerFull.banners'),
      type: 'remove',
      toggleClass: 'active',
      callback: _ => {
        onBodyScroll();
      }
    });

    toggleElement({
      trigger: docSelector('.bottomLayer.cities .buttonTooltip'),
      element: docSelector('.bottomLayer.cities .tooltipCities'),
      toggleClass: 'active',
      touchClose: true
    });

    bindSwiper({
      element: docSelector('.personalSlideWrap'),
      slide: 'personalSlide',
      slider: 'personalSlider',
      space: 20
    });

    setPersonal({
      wrap: docSelector('.personalWrap'),
      button: '.buttonPersonalTab',
      content: '.personalContent',
      class: 'active',
      random: false,
      load: 'first',
      callback: {
        first: _ => {
          const opts = {
            element: docSelector('.personalContent.active .personalContentSlideWrap'),
            slide: 'personalContentSlide',
            slider: 'personalContentSlider',
            speed: 1000,
            space: 15,
            callback: {
              start: 'changeColor'
            }
          };

          if (personalSlide) {
            personalSlide.destroy(true, true);
          }

          personalSlide = new Swiper(opts.element, {
            speed: 200,
            slidesPerView: opts.view || 'auto',
            spaceBetween: 10,
            wrapperClass: opts.slide,
            slideClass: opts.slider,
            slideToClickedSlide: true,
            beforeDestroy: true,
            autoHeight: true,
            initialSlide: 0,
            pagination: opts.pagination || false,
            loop: opts.loop || false,
            autoplay: opts.auto || false,
            onTransitionStart: _ => {
              const colorInfo = personalSlide.slides[personalSlide.activeIndex].dataset.content;
              changeColor({data: colorInfo});
            }
          });
        },
        changeColor: true
      }
    });

    bindSwiper({
      element: docSelector('.popularSlideWrap'),
      slide: 'popularSlide',
      slider: 'popularSlider'
    });

    bindSwiper({
      element: docSelector('.recommendSlideWrap'),
      slide: 'recommendSlide',
      slider: 'recommendSlider',
      space: 20,
      pagination: '.recommendPagination',
      view: 1
    });

    bindSwiper({
      element: docSelector('.impendingSlideWrap'),
      slide: 'impendingSlide',
      slider: 'impendingSlider',
      space: 13,
      auto: 3000
    });

    bindSwiper({
      element: docSelector('.eventSlideWrap'),
      slide: 'eventSlide',
      slider: 'eventSlider',
      space: 0,
      view: 1,
      auto: false,
      loop: true,
      callback: {
        end: 'pagination'
      }
    });

    fetchData('./data/discount.json').then(data => {
      setUI({
        wrap: 'discountContentSlide',
        apiList: data,
        type: 'all',
        callback: _ => {
          const opts = {
            element: docSelector('.discountContentSlideWrap'),
            slide: 'discountContentSlide',
            slider: 'discountContentSlider'
          };

          discountSlide = new Swiper(opts.element, {
            speed: 400,
            slidesPerView: opts.view || 'auto',
            spaceBetween: (typeof opts.space !== 'undefined') ? opts.space : 15,
            wrapperClass: opts.slide,
            slideClass: opts.slider,
            slideToClickedSlide: true,
            beforeDestroy: true,
            autoHeight: true,
            initialSlide: 0,
            pagination: opts.pagination || false,
            loop: opts.loop || false,
            autoplay: opts.auto || false
          });
        }
      });

      setFilter({
        wrap: docSelector('.discountSlideWrap'),
        button: '.buttonDiscountFilter',
        class: 'active',
        data: data,
        callback: _ => {
          bindSwiper({
            element: docSelector('.discountSlideWrap'),
            slide: 'discountSlide',
            slider: 'discountSlider'
          });
        }
      });
    });

    bindSwiper({
      element: docSelector('.secretList'),
      slide: 'items',
      slider: 'item',
      pagination: '.secretPagination',
      space: 0,
      view: 1
    });

    bindSwiper({
      element: docSelector('.couponSlideWrap'),
      slide: 'couponSlide',
      slider: 'couponSlider',
      space: 10
    });

    bindSwiper({
      element: docSelector('.specialSlideWrap'),
      slide: 'specialSlide',
      slider: 'specialSlider'
    });

    bindSwiper({
      element: docSelector('.bannerSlideWrap'),
      slide: 'bannerSlide',
      slider: 'bannerSlider',
      space: 0,
      view: 1,
      auto: 3000,
      loop: true,
      callback: {
        end: 'pagination'
      }
    });

    bindSwiper({
      element: docSelector('.mallSlideWrap'),
      slide: 'mallSlide',
      slider: 'mallSlider'
    });

    TOP.addEventListener('click', scrollTop);
  };

  if (document.readyState === 'complete') {
    domReady();
  } else {
    document.addEventListener('DOMContentLoaded', domReady);
  }
})();


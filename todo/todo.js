const mainJS = (_ => {
    const SELECTOR = {
        BG       : '.background',
        TIME     : '.time',
        FORM_NAME: '.form-name',
        FORM_TODO: '.form-todo',
        NAME     : '[name="name"]',
        TODO     : '[name="toDo"]',
        TODO_LIST: '.toDoList',
        LOCATION : '.location',
        CITY     : '.city',
        TEMP     : '.temp',
        WEATHER  : '.weather',
    };

    const API = {
        URL: 'https://api.openweathermap.org/data/2.5/weather',
        KEY: '&appid=8d0fba684264cc55f9b735566611ac78',
    };

    const user = {
        name: null,
        todo: [],
    };

    const {
        URL,
        KEY,
    } = API;
    const element = {};
    const timing = 1000;
    let timer = null;

    const setElement = _ => {
        const selectorKeys = Object.keys(SELECTOR);
        selectorKeys.map(selector => {
            element[selector.toLowerCase()] = document.querySelector(SELECTOR[selector]);
        });
    };

    const setStorage = _ => {
        localStorage.setItem('user', JSON.stringify(user));
    };

    const getStorage = _ => {
        const userInfo = JSON.parse(localStorage.getItem('user'));

        if (userInfo === null) {
            return setStorage();
        }

        user.name = userInfo.name;
        user.todo = userInfo.todo;

        if (user.name === null || user.todo.length === 0) {
            return;
        }

        setName();
        setTodo();
    };

    const removeTodo = e => {
        const target = e.target;
        const targetParent = target.parentNode;
        const allTodo = element.todo_list.querySelectorAll('li');
        const index = [...allTodo].indexOf(targetParent);
        user.todo.splice(index, 1);
        targetParent.remove();
        setStorage();
    };

    const addTodo = ({num}) => {
        const todo = document.createElement('li');
        const btnDelete = document.createElement('button');

        btnDelete.setAttribute('type', 'button');
        btnDelete.textContent = '삭제';

        todo.innerHTML = `${user.todo[num]}`;
        todo.insertAdjacentElement('beforeend', btnDelete);
        element.todo_list.insertAdjacentElement('beforeend', todo);

        btnDelete.addEventListener('click', removeTodo);
    };

    const setName = e => {
        if (e !== undefined && e.type === 'submit') {
            e.preventDefault();
            user.name = element.name.value;
            setStorage();
        }

        element.name.value = `Hello! ${user.name} 👋`;
        element.name.disabled = true;
    };

    const setTodo = e => {
        if (e !== undefined && e.type === 'submit') {
            e.preventDefault();
            user.todo = [...user.todo, element.todo.value];

            addTodo({num: user.todo.length - 1});
            setStorage();
            return element.todo.value = '';
        }

        user.todo.map((todo, i) => addTodo({num: i}));
    };

    const setBackground = _ => {
        const imgNumber = Math.floor(Math.random() * 5);
        element.bg.setAttribute('style', `background: url("./images/img-${imgNumber}.jpg") no-repeat 50% 50%`);
    };

    const getTime = _ => {
        const today = new Date();
        const time = {
            hour  : today.getHours().toString(),
            minute: today.getMinutes().toString(),
            second: today.getSeconds().toString(),
        };

        const timeKeys = Object.keys(time);
        timeKeys.map(keys => {
            time[keys] = time[keys].length === 1 ? '0' + time[keys] : time[keys];
        });

        element.time.innerText = `${time.hour}:${time.minute}:${time.second}`;
    };

    const getLocation = () => {
        const success = position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `${URL}?lat=${lat}&lon=${lon}&units=metric${KEY}`;

            fetch(url).then(res => res.json()).then(data => {
                const city = data.name;
                const temp = data.main.temp.toFixed(1);
                const weather = data.weather[0].main;

                element.city.textContent = `${city}, `;
                element.temp.textContent = `${temp}℃`;
                element.weather.textContent = weather;
            });
        };

        const error = () => {
            console.error('Unable to retrieve your location');
        };

        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    };

    const init = _ => {
        setElement();
        getTime();
        setBackground();
        getStorage();
        getLocation();

        element.form_name.addEventListener('submit', setName);
        element.form_todo.addEventListener('submit', setTodo);

        timer = setInterval(getTime, timing);
    };

    return {
        init,
    };
})();

if (document.readyState === 'complete') {
    mainJS.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', mainJS.init);
}
'use strict';

let myMap,
    clusterer,
    content;

ymaps.ready(init);

/**
 * Инициализация карты, создание кластеризатора
 */
function init() {
    myMap = new ymaps.Map('map', {
        center: [59.91, 30.31],
        zoom: 11
    }, {
        searchControlProvider: 'yandex#search'
    });



    const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="ballon__header">
            <div class="title">{{ properties.place }}</div>
            <button class="address">{{ properties.address }}</button>
        </div>
        <div class="ballon__body">{{ properties.comment }}</div>`, {
            build: function () {
                customItemContentLayout.superclass.build.call(this);
                const elemAddress = this.getElement().querySelector(".address");
                const coords = this.getData().geoObject.geometry.getCoordinates();


                ymaps.geocode(coords).then((result) => {
                    return result.geoObjects.get(0).getAddressLine();
                }).then(address => {
                    elemAddress.innerText = address;
                });
                elemAddress.addEventListener("click", event => {
                    event.preventDefault();
                    openForm(coords);
                });
            }
        }
    );

    clusterer = new ymaps.Clusterer({
        preset: "islands#invertedVioletClusterIcons",
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        hideIconOnBalloonOpen: false,
        openBalloonOnClick: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        clusterBalloonItemContentLayout: customItemContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 150,
        clusterBalloonPagerSize: 5
    });

    myMap.geoObjects.add(clusterer);

    myMap.events.add('click', function (event) {

        try {
            openForm(event.get('coords'));
        } catch (event) {
            console.error(event);
        }

    });

    myMap.geoObjects.events.add("click", function (event) {
        if (event.get("target").balloon) {
            event.preventDefault();
            openForm(event.get("target").geometry.getCoordinates());
        }
    });

    content = loadContent();
}

/**
 * Загрузка и отрисовка отзывов из хранилища
 */
function loadContent() {
    let reviewsMap = localStorage.getItem("content") || `{"list": []}`;
    let data = JSON.parse(reviewsMap);
    if (data.list.length !== 0) {
        data.list.forEach(element => {
            const myPlacemark = createPlacemark(element);
            clusterer.add(myPlacemark);
        });
    }
    return data;
}

/**
 * Генерация и обработка формы в зависимости от координат
 * @param {array} coords 
 */
function openForm(coords) {
    myMap.balloon.close();

    myMap.setCenter(coords);

    ymaps.geocode(coords).then((result) => {
        return result.geoObjects.get(0).getAddressLine();
    }).then(address => {

        let contentPlace = {
            list: []
        };
        content.list.forEach(element => {
            if (element.coords[0] === coords[0] && element.coords[1] === coords[1]) {
                contentPlace.list.push(element);
            }
        });

        let template = getTemplate(contentPlace);
        let root = document.querySelector('#mainBox');

        if (root) {
            root.innerHTML = template;
        } else {
            root = document.createElement("div");
            root.id = "mainBox";

            root.innerHTML = template;
            map.appendChild(root);
        }

        let form = root.querySelector(".dropbox__overlay");
        form.style.position = "absolute";
        form.style.left = document.body.offsetWidth / 2 - 290 + "px";
        form.style.top = document.body.offsetHeight / 2 - 150 + "px";

        let addressField = root.querySelector(".dropbox__title");
        addressField.innerHTML = address;

        const buttonClose = root.querySelector(".dropbox__close");
        const buttonSave = root.querySelector(".myreviews__add");

        buttonClose.addEventListener("click", () => root.remove());
        buttonSave.addEventListener("click", event => {
            event.preventDefault();
            let name = root.querySelector(".myreviews__name");
            let place = root.querySelector(".myreviews__place");
            let impression = root.querySelector(".myreviews__impression");

            let review = {
                name: name.value,
                place: place.value,
                text: impression.value,
                date: new Date()
                    .toJSON()
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("."),
                coords: coords
            };

            if (review.name && review.place && review.text) {
                const myPlacemark = createPlacemark(review);
                clusterer.add(myPlacemark);
                content.list.push(review);
                localStorage.setItem("content", JSON.stringify(content));
            } else {
                alert("Вы заполнили не все поля");
            }
            openForm(coords);
        });
    }).catch((error) => {
        console.error(error);
    });
}


/**
 * Создает разметку из шаблона и данных
 * @param {object} data 
 */
function getTemplate(data) {
    const card = document.querySelector("#dropbox-form").innerHTML;
    var template = Handlebars.compile(card);
    var cardHTML = template(data);
    return cardHTML;
}

/**
 * Создает метку с переданными значениями
 * @param {object} data 
 */
function createPlacemark(data) {

    let placemark = new ymaps.Placemark(data.coords, {
        place: data.place,
        comment: data.text,
        data: data.date
    }, {
        balloonShadow: false,
        balloonPanelMaxMapArea: 0,
        hideIconOnBalloonOpen: false,
        preset: "islands#violetDotIcon"
    });


    placemark.events.add('click', function (event) {

        try {
            openForm(event.get('coords'));
        } catch (event) {
            console.error(event);
        }
    }, placemark);
    return placemark;
}
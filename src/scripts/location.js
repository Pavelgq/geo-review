var myMap;
var clusterer;
// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init() {
    myMap = new ymaps.Map('map', {
        center: [59.91, 30.31], // Москва
        zoom: 11
    }, {
        searchControlProvider: 'yandex#search'
    });

    clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        //clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
        // Настройка внешнего вида нижней панели.
        // Режим marker рекомендуется использовать с небольшим количеством элементов.
        // clusterBalloonPagerType: 'marker',
        // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
        // clusterBalloonCycling: false,
        // Можно отключить отображение меню навигации.
        // clusterBalloonPagerVisible: false
    });

    clusterer.add(placemarks);
    myMap.geoObjects.add(clusterer);

    myMap.events.add('click', function (event) {
        (async () => {
            try {
                openForm(event);
            } catch (event) {
                console.error(event);
            }
        })();
    })

    // myMap.events.add('click', openForm.bind(event));
}

var placemarks = [];



var context = {
    list: [{
            name: 'Pavel',
            place: 'Буквоед',
            date: new Date(),
            text: 'Тут норм'
        },
        {
            name: 'Lol1',
            place: 'lol',
            date: new Date(),
            text: '1234'
        }
    ]
};

const card = document.querySelector("#dropbox-form").innerHTML;


function openForm(event) {
    const coords = event.get('coords');
    const pagePx = event.get('pagePixels');
    const x = pagePx[0].toPrecision(6);
    const y = pagePx[1].toPrecision(6);

    let myPlacemark = createPlacemark(coords);
    placemarks.push(myPlacemark);
    myMap.geoObjects.add(myPlacemark);
    clusterer.add(myPlacemark);
    //myMap.geoObjects.clusterer.add(myPlacemark);

    let root = document.createElement('div');

    root.innerHTML = getTemplate();

    map.appendChild(root);

    let block = root.querySelector('.dropbox__overlay');
    block.style.top = y + 'px';
    block.style.left = x + 'px';

    let addressContain = root.querySelector('.dropbox__title');
    getAddress(coords, addressContain);


    const close = root.querySelector(".dropbox__close");
    const save = root.querySelector(".myreviews__add");

    close.onclick = closeModal;
    save.onclick = makeReview;
}

/**
 * Модернизирует шаблон под данные
 */
function getTemplate() {
    var template = Handlebars.compile(card);
    var cardHTML = template(context);
    return cardHTML;
}


function createPlacemark(coords) {
    let placemark =  new ymaps.Placemark(coords, {
        openBalloonOnClick: false,
        balloonContentHeader: "newReview.place",
        balloonContentLink: "point.address",
        balloonContentBody: "newReview.textReview",
        balloonContentFooter: "newReview.date",
        balloonContentCoords: "point.coords",
    }, {
        preset: 'islands#darkOrangeIcon'
    });

   placemark.events.add('click', openPlacemark(event));
    return placemark;
}

function openPlacemark(event) {
    // const coords = event.get('coords');
    // const pagePx = event.get('pagePixels');
    // const x = pagePx[0].toPrecision(6);
    // const y = pagePx[1].toPrecision(6);

    // let root = document.createElement('div');

    // root.innerHTML = getTemplate();

    // map.appendChild(root);

    // let block = root.querySelector('.dropbox__overlay');
    // block.style.top = y + 'px';
    // block.style.left = x + 'px';

    // let addressContain = root.querySelector('.dropbox__title');

    console.log(event)
}

function placeCheck(event) {

    console.log("click");

    var coords = event.get('coords');

    myGeoObject = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [coords[0].toPrecision(6), coords[1].toPrecision(6)]
        }, // Свойства.
        properties: {
            // Контент метки.
            iconContent: '',
            hintContent: ''
        }
    }, {
        // Опции.
        // Иконка метки будет растягиваться под размер ее содержимого.
        preset: 'islands#icon',
        iconColor: '#0095b6'
    });

}

// Определяем адрес по координатам (обратное геокодирование).
function getAddress(coords, addressContain) {
    ymaps.geocode(coords).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);

        addressContain.innerText = firstGeoObject.getAddressLine();
    });
}

function closeModal(event) {
    let box = event.currentTarget.closest(".dropbox__overlay");
    box = box.parentNode;
    map.removeChild(box);

    event.currentTarget.removeEventListener('click', closeModal);
}

function makeReview(event) {


    let box = event.currentTarget.closest(".dropbox__overlay");
    box = box.parentNode;
    map.removeChild(box);

    event.currentTarget.removeEventListener('click', makeReview);

}
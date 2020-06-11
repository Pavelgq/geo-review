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
                openForm(event, initialState);
            } catch (event) {
                console.error(event);
            }
        })();
    })

    // myMap.events.add('click', openForm.bind(event));
}

var placemarks = [];

var initialState = {
    list: [
    ]
};

var context = {
    list: [
    ]
};

const card = document.querySelector("#dropbox-form").innerHTML;


function openForm(event, content) {
    let box = document.querySelector(".dropbox__overlay");

    if (box !== null) {
        box = box.parentNode;
        map.removeChild(box);
    }

    const coords = event.get('coords');
    const pagePx = event.get('pagePixels');
    const x = pagePx[0].toPrecision(6);
    const y = pagePx[1].toPrecision(6);



    let root = document.createElement('div');

    root.innerHTML = getTemplate(content);

    map.appendChild(root);

    let block = root.querySelector('.dropbox__overlay');
    block.style.top = y + 'px';
    block.style.left = x + 'px';

    let addressContain = root.querySelector('.dropbox__title');
    getAddress(coords, addressContain);

    const close = root.querySelector(".dropbox__close");
    const save = root.querySelector(".myreviews__add");

    save.addEventListener('click', function (e) {
        makeReview(e, event, coords);

    });
    close.onclick = closeModal;
}

/**
 * Модернизирует шаблон под данные
 */
function getTemplate(content) {
    var template = Handlebars.compile(card);
    var cardHTML = template(content);
    return cardHTML;
}


function createPlacemark(coords, data) {
    let addressContain = document.querySelector('.dropbox__title');
    getAddress(coords, addressContain);

    let placemark = new ymaps.Placemark(coords, {
        openBalloonOnClick: false,
        balloonContentHeader: data.place,
        balloonContentBody: `<a class="balloon__address_link">${addressContain.innerText}</a><br><br> ${data.text}`,
        balloonContentFooter: data.date,
        balloonContentCoords: data.coords,
    }, {
        preset: 'islands#darkOrangeIcon'
    });


    placemark.events.add('click', function (event) {
        (async () => {
            try {
                openPlacemark(event);
            } catch (event) {
                console.error(event);
            }
        })();
    }, placemark);
    return placemark;
}

function openPlacemark(event, coords) {
    if (coords === undefined) {
        coords = event.get('coords');
    }
    
    let content = {
        list: []
    }

    context.list.forEach(element => {
        if (element.coords.x === coords.x && element.coords.y === coords.y) {
            content.list.push(element);
        }
    });
    openForm(event, content); 
}


// Определяем адрес по координатам (обратное геокодирование).
function getAddress(coords, addressContain) {
    ymaps.geocode(coords).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);

        addressContain.innerText = firstGeoObject.getAddressLine();
    });
}

function closeModal(event) {
    let box = document.querySelector(".dropbox__overlay");
    box = box.parentNode;
    map.removeChild(box);

    event.currentTarget.removeEventListener('click', closeModal);
}

function makeReview(event, mapEvent, coords) {
    let root = document.querySelector('.dropbox__overlay');
    let name = root.querySelector(".myreviews__name");
    let place = root.querySelector(".myreviews__place");
    let impression = root.querySelector(".myreviews__impression");

    if (name.value && place.value && impression.value) {
        let data = {
            name: name.value,
            place: place.value,
            date: new Date(),
            text: impression.value,
            coords: coords
        };
        let myPlacemark = createPlacemark(coords, data);
        placemarks.push(myPlacemark);
        myMap.geoObjects.add(myPlacemark);
        clusterer.add(myPlacemark);

        let link = document.querySelectorAll(".balloon__address_link");
        if (link.length !== 0) {
            link.forEach(element => {
                element.addEventListener('click', function (e) {
                    openPlacemark(mapEvent, coords);
                });
            });
        }
        

        context.list.push(data);

        console.log(event);

        console.log(mapEvent);

        let box = document.querySelector(".dropbox__overlay");
        box = box.parentNode;
        map.removeChild(box);

        

        openPlacemark(mapEvent, coords);
    } else {
        alert('Вы не заполнили все поля');
    }




}
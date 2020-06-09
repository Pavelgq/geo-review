var myMap;

// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init() {
    myMap = new ymaps.Map('map', {
        center: [59.91, 30.31], // Москва
        zoom: 11
    }, {
        searchControlProvider: 'yandex#search'
    });

    myMap.events.add('click', addReview.bind(event));
}

var context = {
    list: [{
            name: 'Lol',
            place: 'lol',
            date: new Date(),
            text: '1234'
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



function getTemplate() {
    var template = Handlebars.compile(card);
    var cardHTML = template(context);
    return cardHTML;
}

function addReview(event) {
    var coords = event.get('coords');
    var pagePx = event.get('pagePixels');
    var x = pagePx[0].toPrecision(6);
    var y = pagePx[1].toPrecision(6);

    var adress = getAddress(coords);
    var root = document.createElement('div');
    
    root.innerHTML = getTemplate();
    var adr = root.querySelector('.dropbox__title');
    adr.innerHTML = adress;
    map.appendChild(root);
    var block = root.querySelector('.dropbox__overlay');
    block.style.top =  y + 'px';
    block.style.left = x + 'px';
    
    var close = root.querySelector(".dropbox__close"); 
    console.log(close);
    var save = root.querySelector(".myreviews__add");

    close.onclick = closeModal;
    save.onclick = saveReview;
}

function placeCheck(event) {

    console.log("click");

    var coords = e.get('coords');

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
function getAddress(coords) {
    ymaps.geocode(coords).then(function (res) {
        firstGeoObject = res.geoObjects.get(0);
    });
    var adress = firstGeoObject.getAddressLine();
    return adress;
}

function closeModal(event) {
    let box = event.currentTarget.closest(".dropbox__overlay");
    box = box.parentNode;
    map.removeChild(box);

    event.currentTarget.removeEventListener('click', closeModal);
}

function saveReview(event) {
    map.removeChild(event.currentTarget);

    event.currentTarget.removeEventListener('click', saveReview);

}
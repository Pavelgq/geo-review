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

myMap.events.add('click', addReview(event));

const card = document.querySelector("#review-list").innerHTML;



function getTemplate() {
    var template = Handlebars.compile(card);
    var cardHTML = template(context);
    return cardHTML.innerHTML;
}

function addReview(event) {
    var coords = event.get('coords');

    var x = coords[0].toPrecision(6);
    var y = coords[1].toPrecision(6);

    var block = document.createElement('div');
    block.style.position = 'absolute';
    block.style.top = '' + x;
    block.style.left = '' + y;
    
    block.innerHTML = getTemplate();
    map.appendChild(block);
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

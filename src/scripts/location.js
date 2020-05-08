var myMap;

// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init).then(balloonQ());

function init() {
    myMap = new ymaps.Map('map', {
        center: [59.91, 30.31], // Москва
        zoom: 11
    }, {
        searchControlProvider: 'yandex#search'
    });

    var nowCoordinate = {
        x: 0,
        y: 0
    };
    // document.getElementById('destroyButton').onclick = function () {
    //     myMap.destroy();
    // };

    
    myMap.events.add('click', function (e) {

        var coords = e.get('coords');
        nowCoordinate.x = coords[0].toPrecision(6);
        nowCoordinate.y = coords[1].toPrecision(6);
        console.log("click"); 
        myGeoObject = new ymaps.GeoObject({
            geometry: {
                type: "Point",
                coordinates: [nowCoordinate.x, nowCoordinate.y]
            }, // Свойства.
            properties: {
                // Контент метки.
                iconContent: 'Я тащусь',
                hintContent: 'Ну давай уже тащи'
            }
        }, {
            // Опции.
            // Иконка метки будет растягиваться под размер ее содержимого.
            preset: 'islands#blackStretchyIcon',
            draggable: false
        });

        // var DateFormats = {
        //     short: "DD MMMM - YYYY",
        //     long: "dddd DD.MM.YYYY HH:mm"
        // };

        // Handlebars.registerHelper("formatDate", function(datetime, format) {

        // // Use UI.registerHelper..
        // UI.registerHelper("formatDate", function(datetime, format) {
        //     if (moment) {
        //     // can use other formats like 'lll' too
        //     format = DateFormats[format] || format;
        //     return moment(datetime).format(format);
        //     }
        //     else {
        //     return datetime;
        //     }
        // });

        var context = {
            list: [{
                name: '',
                place: '',
                date: new Date(),
                text: ''
            }]
        };
        var card = document.querySelector("#review-list").innerHTML;
        console.log(card); 

        var template = Handlebars.compile(card);
        console.log(template); 
        var cardHTML = template(context);

       
       
        var placemark = new ymaps.Placemark(myMap.getCenter(), {
            // Зададим содержимое заголовка балуна.
            balloonContentHeader: '<a href = "#">Адрес</a><br>' +
                '<span class="description">Блабла</span>',
            // Зададим содержимое основной части балуна.
            balloonContentBody: cardHTML,
            // Зададим содержимое нижней части балуна.
            balloonContentFooter: 'Фоотер"',
            // Зададим содержимое всплывающей подсказки.
            hintContent: 'Лалки'
        });
            // Создание вложенного макета содержимого балуна.
            // MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            //     '<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
            //     '<div class="popover-content">$[properties.balloonContent]</div>'
            // ),

            // // Создание метки с пользовательским макетом балуна.
            // myPlacemark = window.myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
            //     balloonHeader: 'Заголовок балуна',
            //     balloonContent: 'Контент балуна'
            // }, {
            //     balloonShadow: false,
            //     balloonLayout: MyBalloonLayout,
            //     balloonContentLayout: MyBalloonContentLayout,
            //     balloonPanelMaxMapArea: 0
            //     // Не скрываем иконку при открытом балуне.
            //     // hideIconOnBalloonOpen: false,
            //     // И дополнительно смещаем балун, для открытия над иконкой.
            //     // balloonOffset: [3, -40]
            // });

        myMap.geoObjects.add(placemark);
        placemark.balloon.open();
        // myMap.geoObjects.add(myGeoObject);
        // myGeoObject.geoObjects.add.open();
    });



}

function balloonQ() {
    console.log("load off"); 

 

    
}
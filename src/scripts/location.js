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
        let tmpl = document.createElement('div');
        tmpl.append(dropbox-template.content.cloneNode(true));
        // Создание макета балуна на основе Twitter Bootstrap.
        MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                tmpl.innerHTML +
                '<div class="popover top">' +
                '<a class="close" href="#">&times;</a>' +
                '<div class="arrow"></div>' +
                '<div class="popover-inner">' +
                '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
                '</div>' +
                '</div>', {
                    /**
                     * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                     * @function
                     * @name build
                     */
                    build: function () {
                        this.constructor.superclass.build.call(this);

                        this._$element = $('.popover', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.close')
                            .on('click', $.proxy(this.onCloseClick, this));
                    },

                    /**
                     * Удаляет содержимое макета из DOM.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                     * @function
                     * @name clear
                     */
                    clear: function () {
                        this._$element.find('.close')
                            .off('click');

                        this.constructor.superclass.clear.call(this);
                    },

                    /**
                     * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onSublayoutSizeChange
                     */
                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                        this.events.fire('shapechange');
                    },

                    /**
                     * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name applyElementOffset
                     */
                    applyElementOffset: function () {
                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                        });
                    },

                    /**
                     * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onCloseClick
                     */
                    onCloseClick: function (e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },

                    /**
                     * Используется для автопозиционирования (balloonAutoPan).
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                     * @function
                     * @name getClientBounds
                     * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                     */
                    getShape: function () {
                        if (!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top],
                            [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                            ]
                        ]));
                    },

                    /**
                     * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                     * @function
                     * @private
                     * @name _isElement
                     * @param {jQuery} [element] Элемент.
                     * @returns {Boolean} Флаг наличия.
                     */
                    _isElement: function (element) {
                        return element && element[0] && element.find('.arrow')[0];
                    }
                }),

            // Создание вложенного макета содержимого балуна.
            MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                '<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
                '<div class="popover-content">$[properties.balloonContent]</div>'
            ),

            // Создание метки с пользовательским макетом балуна.
            myPlacemark = window.myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
                balloonHeader: 'Заголовок балуна',
                balloonContent: 'Контент балуна'
            }, {
                balloonShadow: false,
                balloonLayout: MyBalloonLayout,
                balloonContentLayout: MyBalloonContentLayout,
                balloonPanelMaxMapArea: 0
                // Не скрываем иконку при открытом балуне.
                // hideIconOnBalloonOpen: false,
                // И дополнительно смещаем балун, для открытия над иконкой.
                // balloonOffset: [3, -40]
            });

        myMap.geoObjects.add(myPlacemark);
        // myMap.geoObjects.add(myGeoObject);
        // myGeoObject.geoObjects.add.open();
    });



}
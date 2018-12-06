// DOM Elements
let bodyEl = $('body'),
    navbarEl = $('#navbar'),
    datepickerInputEl = $('[data-toggle="datepicker"]'),
    inputContainerEl = $('#inputContainer'),
    userInputScreenEl = $('#userInputScreen'),
    accommSummaryScreenEl = $('#accommSummaryScreen'),
    inputTitleEl = $('#inputTitle'),
    leftArrowEl = $('#leftArrow'),
    rightArrowEl = $('#rightArrow'),
    finishButtonEl = $('#finishButton'),
    whenInputEl = $('#whenInput'),
    whereInputEl = $('#whereInput'),
    whoInputEl = $('#whoInput'),
    noOfGuestsEl = $('#noOfGuests'),
    moreGuestsEl = $('#moreGuests'),
    fewerGuestsEl = $('#fewerGuests'),
    whatInputEl = $('#whatInput'),
    backToFormBtnEl = $('#backToFormBtn');

// Data
let accommData, mealData,
    inputTitles = ["WHEN?", "WHERE?", "WHO?", "WHAT?"];

// Misc variables
let currDate = Date.now(),
    currInputScreen = 0;



function init() {
    $.getJSON('json/accommodation.json', function (options) {
        accommData = options;
    });
    $.getJSON('json/meals.json', function (options) {
        mealData = options;
    });

    // Datepicker
    datepickerInputEl.datepicker({
        // FIX this!!
        isDisabled: function (date) {
            return date.valueOf() < currDate ? true : false;
        }
    });

    // Set up map
    setUpMap();

    
    checkInputIsStart();
    checkInputIsEnd();
    rightArrowEl.on('click', slideInputContainerForwards);
    leftArrowEl.on('click', slideInputContainerBackwards);
    moreGuestsEl.on('click', increaseNoOfGuests);
    fewerGuestsEl.on('click', decreaseNoOfGuests);
    noOfGuestsEl.on('blur', checkWhoInput);
    finishButtonEl.on('click', showSummary);
    backToFormBtnEl.on('click', backToForm);
};

function slideInputContainerForwards() {
    currInputScreen++;
    checkInputIsStart();
    checkInputIsEnd();
    inputTitleEl.html(inputTitles[currInputScreen]);
    whenInputEl.animate({ left: '-=400px' });
    whereInputEl.animate({ left: '-=400px' });
    whoInputEl.animate({ left: '-=400px' });
    whatInputEl.animate({ left: '-=400px' });
};

function slideInputContainerBackwards() {
    currInputScreen--;
    checkInputIsStart();
    checkInputIsEnd();
    inputTitleEl.html(inputTitles[currInputScreen]);
    whenInputEl.animate({ left: '+=400px' });
    whereInputEl.animate({ left: '+=400px' });
    whoInputEl.animate({ left: '+=400px' });
    whatInputEl.animate({ left: '+=400px' });
};

function checkInputIsStart() {
    if (currInputScreen == 0) {
        leftArrowEl.css("visibility", "hidden");
    } else {
        leftArrowEl.css("display", "block");
        leftArrowEl.css("visibility", "visible");
    }
};

function checkInputIsEnd() {
    if (currInputScreen == 3) {
        finishButtonEl.css('display', 'block');
        rightArrowEl.css('display', 'none');
    } else {
        finishButtonEl.css('display', 'none');
        rightArrowEl.css('display', 'block');
    }
};

function setUpMap() {
    // Map variables
    var GeoSearchControl = window.GeoSearch.GeoSearchControl,
        OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider,
        provider = new OpenStreetMapProvider();
    
        var baseMap = new L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaG9sbHlqbnoiLCJhIjoiY2pvbnBuc2ZhMWVkYzNqcGNvNnBjeDI2aiJ9.esIDISrS1QjPynfQs4sKKA'
    });
    // var baseMapIndex = {
    //     "Map": baseMap
    // };
    var map = L.map('map', {
        center: [-40.9, 173],
        zoom: 4,
        layers: baseMap
    });
    // var control = L.control.layers(baseMapIndex);
    var searchControl = new GeoSearchControl({
        provider: provider,
    });
    // control.addTo(map);
    searchControl.addTo(map);

    var htmlObject = searchControl.getContainer();
    function setParent(el, newParent) {
        newParent.append(el);
    }
    setParent(htmlObject, inputContainerEl);
    
    // L.control.layers(baseMap, searchControl).addTo(map);
    // map.addControl(searchControl);
};

function increaseNoOfGuests() {
    noOfGuestsEl.val(function (i, prev) {
        return ++prev;
    });
}

function decreaseNoOfGuests() {
    if (!(noOfGuestsEl.val() == 0)) {
        noOfGuestsEl.val(function (i, prev) {
            return --prev;
        });
    }
}

function checkWhoInput() {
    let guests = noOfGuestsEl.val();
    if (guests < 0 || !(Math.floor(guests) == guests && $.isNumeric(guests))) {
        noOfGuestsEl.val('0');
    };
}

function showSummary() {
    userInputScreenEl.removeClass('active');
    accommSummaryScreenEl.addClass('active');
    bodyEl.css('background-image', 'url(../../img/aspiring2.JPG)');
    navbarEl.css('visibility', 'visible');
};

function backToForm() { 
    userInputScreenEl.addClass('active');
    accommSummaryScreenEl.removeClass('active');
    bodyEl.css('background-image', 'url(../../img/sunrise2.JPG)');
    navbarEl.css('visibility', 'hidden');
};

init();
// DOM Elements
let bodyEl = $('body'),
    navbarEl = $('#navbar'),
    datepickerInputEl = $('[data-toggle="datepicker"]'),
    dateFromEl = $('#dateFrom'),
    dateToEl = $('#dateTo'),
    inputContainerEl = $('#inputContainer'),
    userInputScreenEl = $('#userInputScreen'),
    summaryScreenEl = $('#summaryScreen'),
    summaryScreenContainerEl = $('#summaryContainer'),
    summaryScreenContentContainerEl = $('#summaryContentContainer'),
    inputTitleEl = $('#inputTitle'),
    leftArrowEl = $('#leftArrow'),
    inputNavBtnEl = $('#inputNavBtn'),
    rightArrowEl = $('#rightArrow'),
    finishButtonEl = $('#finishButton'),
    whenInputEl = $('#whenInput'),
    whereInputEl = $('#whereInput'),
    whoInputEl = $('#whoInput'),
    noOfGuestsEl = $('#noOfGuests'),
    moreGuestsEl = $('#moreGuests'),
    fewerGuestsEl = $('#fewerGuests'),
    whatInputEl = $('#whatInput'),
    backToFormBtnEl = $('#backToFormBtn'),
    contentEl = $('#content'),
    blurbEl = $('#blurb'),
    noBookingsEl = $('#noBookings'),
    // Modal
    // NEED: More info button
    modalCloseBtnEl = $('.modal-overlay-close');

// Data
let accommData, mealData,
    inputTitles = ["WHEN?", "WHERE?", "WHO?", "WHAT?"],
    filteredAccommodation,
    selectedLocation;

// Misc variables
let currDate, currInputScreen = 0;

/**
 * Initialise app
 */
function init() {
    currDate = Date.now();
    filteredAccommodation = [];
    $.getJSON('json/accommodation.json', function (options) {
        accommData = options.accommodation;
    });
    $.getJSON('json/meals.json', function (options) {
        mealData = options.meals;
    });
    // Datepicker: FIX the past date issue!!!
    $('[data-toggle="datepicker"]').datepicker({
        // isDisabled: function (date) {
        //     console.log(date.valueOf());
        //     return date.valueOf() < currDate ? true : false;
        // },
        isDisabled: function (date) {
            return date.getDay() === 3 ? true : false;
        },
        format: 'dd/mm/yyyy',
        autoHide: true,
    });
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
    $('.geosearch .results').on('click', function (e) {
        selectedLocation = $(e.target).text();
    });
};

/**
 * Slides user input container forwards for each field.
 */
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

/**
 * Slides user input container backwards for each field.
 */
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

/**
 * Checks whether the input form state is the first field.
 */
function checkInputIsStart() {
    if (currInputScreen == 0) {
        leftArrowEl.css("visibility", "hidden");
        inputNavBtnEl.css("visibility", "hidden");
    } else {
        inputNavBtnEl.css("visibility", "visible");
        leftArrowEl.css("display", "block");
        leftArrowEl.css("visibility", "visible");
    }
};

/**
 * Checks whether the input form state is the final field.
 */
function checkInputIsEnd() {
    if (currInputScreen == 2) {
        finishButtonEl.css('display', 'block');
        rightArrowEl.css('display', 'none');
    } else {
        finishButtonEl.css('display', 'none');
        rightArrowEl.css('display', 'block');
    }
};

/**
 * Sets up the location (search) functionality.
 */
function setUpMap() {
    // Map variables
    var GeoSearchControl = window.GeoSearch.GeoSearchControl,
        OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider,
        provider = new OpenStreetMapProvider(),
        baseMap = new L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiaG9sbHlqbnoiLCJhIjoiY2pvbnBuc2ZhMWVkYzNqcGNvNnBjeDI2aiJ9.esIDISrS1QjPynfQs4sKKA'
        });
    var map = L.map('map', {
        center: [-40.9, 173],
        zoom: 4,
        layers: baseMap
    });
    var searchControl = new GeoSearchControl({
        provider: provider,
    });
    searchControl.addTo(map);

    var htmlObject = searchControl.getContainer();
    function setParent(el, newParent) {
        newParent.append(el);
    }
    setParent(htmlObject, whereInputEl);

    // Geosearch input
    var leafletBarPartEl = $('.leaflet-bar-part'),
        geosearchFormEl = $('.geosearch form'),
        geosearchResetEl = $('.geosearch .reset'),
        geosearchGlassEl = $('.geosearch .glass'),
        geosearchGlassContentEl = $('.geosearch .glass div'),
        geosearchResultsEl = $('.geosearch .results');

    // Deal with html/styling
    leafletBarPartEl.html('<i class="fas fa-search"></i>');
    geosearchResetEl.html('<i class="fas fa-redo-alt"></i>');
    geosearchGlassEl.attr("placeholder", "Enter town/city");

    // Deal with user input/selection
    geosearchGlassEl.on('click', function () {
        geosearchFormEl.css('height', '25vh').css('overflow-y', 'scroll');
        geosearchResultsEl.css('display', 'block');
    });
    geosearchResetEl.on('click', resetForm).on('click', function () {
        geosearchGlassEl.focus();
    });
    geosearchResultsEl.on('click', function () {
        geosearchResultsEl.removeClass('active');
        geosearchResultsEl.css('display', 'none');
        geosearchFormEl.removeClass('active');
        resetForm();
    });
    // geosearchFormEl.on('blur', function () {
    //     geosearchGlassContentEl.on('blur', resetForm);
    // });
    function resetForm() {
        geosearchFormEl.css('height', '2em').css('overflow-y', 'hidden');
    };
};

/**
 * Increases the value of number of guests input.
 */
function increaseNoOfGuests() {
    noOfGuestsEl.val(function (i, prev) {
        return ++prev;
    });
};

/**
 * Decreases the value of number of guests input.
 */
function decreaseNoOfGuests() {
    if (!(noOfGuestsEl.val() == 0)) {
        noOfGuestsEl.val(function (i, prev) {
            return --prev;
        });
    }
};

/**
 * Checks whether the number of guests is valid and resets if not.
 */
function checkWhoInput() {
    let guests = noOfGuestsEl.val();
    if (guests < 0 || !(Math.floor(guests) == guests && $.isNumeric(guests))) {
        noOfGuestsEl.val('0');
    };
};

/**
 * Changes screen to show summary.
 */
function showSummary() {
    let dateRegex = /([0-2][0-9]|[3][0-1])\/([0-9][1-2])\/((19|20)[0-9]{2})/,
        locationRegex = /\w*[a-zA-Z]\w*/,
        geosearchGlassEl = $('.geosearch .glass');
    if (!(dateFromEl.val().match(dateRegex)) || !(dateToEl.val().match(dateRegex))) {
        slideInputContainerBackwards();
        slideInputContainerBackwards();
        alert("Please enter valid dates.");
    } else if (!geosearchGlassEl.val().match(locationRegex)) {
        slideInputContainerBackwards();
        alert("Please enter a valid location.");
    } else if (noOfGuestsEl.val() <= 0) {
        alert("Please enter a valid number of guests.");
    } else {
        filteredAccommodation = filterByUserInput();
        bodyEl.css('background-image', 'url(../../img/beach.JPG)');
        navbarEl.css('visibility', 'visible');
        setUpGrid(filteredAccommodation);
        userInputScreenEl.removeClass('active');
        summaryScreenEl.addClass('active');
        // Modal
        // Book now button on click e listener
        // summaryGridImgEl.on('click', function() {
        // var selectedImg = $(this);
        // var modalImg = $('.modal-img');
        // var newSrc = selectedImg.attr('src').replace('300/200', '560/360');
        // modalImg.attr('src', newSrc);
        //     $('.closed').removeClass('closed');
        // });
        modalCloseBtnEl.on('click', function () {
            $('.modal-overlay').addClass('closed');
            $('.modal').addClass('closed');
        });
    }
};

/**
 * Changes screen to return to user input form.
 */
function backToForm() {
    filteredAccommodation = [];
    // Instead: set hide and show class on content so it doesn't recreate it every time!!!!!!!
    summaryScreenContentContainerEl.html('');
    summaryScreenContentContainerEl.addClass('hidden');
    userInputScreenEl.addClass('active');
    summaryScreenEl.removeClass('active');
    bodyEl.css('background-image', 'url(../../img/sunrise2.JPG)');
    navbarEl.css('visibility', 'hidden');
    blurbEl.removeClass('hidden');
};

/**
 * Changes screen to return to user input form.
* @returns {Array} filteredAccommodation
    */
function filterByUserInput() {
    var days = calcDays();
    var guests = noOfGuestsEl.val();
    var location = selectedLocation.split(/[ ,]+/)[0];
    filteredAccommodation = accommData.filter(function (option) {
        return days <= option.maxNights && guests <= option.maxGuests && location == option.location;
    });
    return filteredAccommodation;
};

/**
 * Calculates the number of days between user's selected dates.
 * @returns {number} days
        */
function calcDays() {
    var dates = [dateFromEl.val().split('/'), dateToEl.val().split('/')];
    console.log(dates);
    var t1 = new Date((dates[0])[2], (dates[0])[1], (dates[0])[0]).getTime();
    var t2 = new Date((dates[1])[2], (dates[1])[1], (dates[1])[0]).getTime();
    var difference = t2 - t1;
    var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days;
};

/**
 * Sets up the HTML grid for summary screen.
*  @param {Array} filteredAccommodation
*/
function setUpGrid(filteredAccommodation) {
    blurbEl.addClass('hidden');
    if (filteredAccommodation == null || filteredAccommodation.length == 0) {
        noBookingsEl.removeClass('hidden');
        summaryScreenContentContainerEl.addClass('hidden');
    } else {
        noBookingsEl.addClass('hidden');
        summaryScreenContentContainerEl.removeClass('hidden');
        let htmlString = '';
        $.each(filteredAccommodation, function (i, option) {
            htmlString += getAccommodationSummaryHTML(option);
        });
        summaryScreenContentContainerEl.html(htmlString);
    }
};

/**
 * Get the summary HTML for the accommodation options.
* @param {Object} option
* @returns {String}
    */
function getAccommodationSummaryHTML(option) {
    let guest = 'guest',
        guests = 'guests',
        night = 'night',
        nights = 'nights';
    if (noOfGuestsEl.val() > 1) {
        if (calcDays() > 1) {
            return getAccommodationSummaryWithPlurals(option, guests, nights);
        } return getAccommodationSummaryWithPlurals(option, guests, night);
    } else if (calcDays() > 1) {
        return getAccommodationSummaryWithPlurals(option, guest, nights);
    } return getAccommodationSummaryWithPlurals(option, guest, night);
};

/**
 * Get the summary HTML for the accommodation options on the basis of whether the guests and days are plural or not.
* @param {Object} option
* @param {number} guests
* @param {number} nights
* @returns {String}
*/
function getAccommodationSummaryWithPlurals(option, guests, nights) {
    return `<div class="option">
                <div class="option-container">
                    <img class="summary-img" src="${option.imgSrc}" alt="${option.name}">
                </div>
                <hr>
                <div class="option-container">
                    <div class="info">
                        <h2 class="title">${option.name}</h2>
                        <h3 class="location-type">${option.location} | ${option.type}</h3>
                        <h3 class="guests">${noOfGuestsEl.val()} ${guests} | ${calcDays()} ${nights}</h3>
                        <h3 class="price">$${calcDays() * option.unitPrice} | $${option.unitPrice} per night</h3>
                        <h3 class="meals">${option.mealsAvailable}</h3>
                    </div>
                    <button class="button">Book now!</button>
                </div>
            </div>`;
}

init();
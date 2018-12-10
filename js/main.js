// DOM Elements
let bodyEl = $('body'),
    navbarEl = $('#navbar'),
    datepickerInputEl = $('[data-toggle="datepicker"]'),
    dateFromEl = $('#dateFrom'),
    dateToEl = $('#dateTo'),
    inputContainerEl = $('#inputContainer'),
    userInputScreenEl = $('#userInputScreen'),
    accommSummaryScreenEl = $('#accommSummaryScreen'),
    accommSummaryScreenContainerEl = $('#accommSummaryScreen .summary-container'),
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
    // Modal
    // NEED: More info button
    modalCloseBtnEl = $('.modal-overlay-close');

// Data
let accommData, mealData,
    inputTitles = ["WHEN?", "WHERE?", "WHO?", "WHAT?"],
    filteredAccommodation,
    selectedLocation;

// Misc variables
let currDate = Date.now(),
    currInputScreen = 0;

/**
 * Initialise app
 */
function init() {
    filteredAccommodation = [];
    $.getJSON('json/accommodation.json', function (options) {
        accommData = options.accommodation;
    });
    $.getJSON('json/meals.json', function (options) {
        mealData = options.meals;
    });
    // Datepicker: FIX the past date issue!!!
    datepickerInputEl.datepicker({
        isDisabled: function (date) {
            return date.valueOf() < currDate ? true : false;
        }
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
    geosearchResetEl.on('click', resetForm);
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
    contentEl.prepend('<a id="summary-logo" class="summary-logo" href="index.html"><img src="img/client-logo-site.png" alt="All Abroad"></a>');
    blurbEl.html("Explore your accommdation options");
    filteredAccommodation = filterByUserInput();
    console.log(filteredAccommodation);
    userInputScreenEl.removeClass('active');
    accommSummaryScreenEl.addClass('active');
    bodyEl.css('background-image', 'url(../../img/aspiring2.JPG)');
    navbarEl.css('visibility', 'visible');
    setUpGrid(filteredAccommodation);
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
};

/**
 * Changes screen to return to user input form.
 */
function backToForm() {
    filteredAccommodation = [];
    accommSummaryScreenContainerEl.html('');
    userInputScreenEl.addClass('active');
    accommSummaryScreenEl.removeClass('active');
    bodyEl.css('background-image', 'url(../../img/sunrise2.JPG)');
    navbarEl.css('visibility', 'hidden');
    blurbEl.html("Short-term stays in New Zealand");
    $('#summary-logo').remove();
};

/**
 * Changes screen to return to user input form.
* @returns {Array} filteredAccommodation
    */
function filterByUserInput() {
    var days = calcDays();
    var guests = noOfGuestsEl.val();
    var location = selectedLocation.split(/[ ,]+/)[0];
    console.log(guests + " days:" + days + " " + location);
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
    var t1 = new Date((dates[0])[2], (dates[0])[0], (dates[0])[1]).getTime();
    var t2 = new Date((dates[1])[2], (dates[1])[0], (dates[1])[1]).getTime();
    var difference = t2 - t1;
    var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days;
};

/**
 * Sets up the HTML grid for summary screen.
*  @param {Array} filteredAccommodation
*/
function setUpGrid(filteredAccommodation) {
    if(filteredAccommodation == null || filteredAccommodation.length == 0) {
        contentEl.append('<h2>Sorry, no options available!</h2><a class="button" href="index.html">New Booking</a>');
    } else {
        let htmlString = '';
        $.each(filteredAccommodation, function (i, option) {
            htmlString += getAccommodationSummaryHTML(option);
        });
        accommSummaryScreenContainerEl.html(htmlString);
    }
};

/**
 * Get the summary HTML for the accommodation options.
* @param {Object} option
* @returns {String}
    */
function getAccommodationSummaryHTML(option) {
    return `<div class="option">
            <img class="summary-img" src="${option.imgSrc}" alt="${option.name}">
                <h2 class="title">${option.name}</h2>
                <div class="info">
                    <h3>Type: ${option.type}</h3>
                    <h3>Price: $${option.unitPrice}</h3>
                </div>
                <button class="button">Book now!</button>
            </div>`;
};

init();
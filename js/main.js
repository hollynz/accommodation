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
    modalEl = $('#modal'),
    modalCloseBtnEl = $('.modal-overlay-close');

// Data
let accommData,
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
    $('[data-toggle="datepicker"]').datepicker({
        isDisabled: function (date) {
            return date.valueOf() < currDate ? true : false;
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
 * Checks whether the state of the input form is the first field and toggles navigation elements to match.
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
 * Checks whether the state of the input form is the final field and toggles navigation elements to match.
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
    var GeoSearchControl = window.GeoSearch.GeoSearchControl,
        OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider,
        provider = new OpenStreetMapProvider(),
        baseMap = new L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiaG9sbHlqbnoiLCJhIjoiY2pvbnBuc2ZhMWVkYzNqcGNvNnBjeDI2aiJ9.esIDISrS1QjPynfQs4sKKA'
        });
    var map = L.map('map');
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
    if (noOfGuestsEl.val() != 0) {
        noOfGuestsEl.val(function (i, prev) {
            return --prev;
        });
    };
};

/**
 * Checks whether the number of guests is valid (greater than zero and an integer) and resets if not.
 */
function checkWhoInput() {
    let guests = noOfGuestsEl.val();
    if (guests < 0 || !(Math.floor(guests) == guests && $.isNumeric(guests))) {
        noOfGuestsEl.val('0');
    };
};

/**
 * Determines whether user entered required inputs; finds available accommodtion options on basis of user inputs; sets up modal dialog.
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
        modalEl.iziModal({
            radius: 10,
            width: 800,
            overlayColor: 'rgba(0, 0, 0, 0.7)'
        });
        $('.more-info-button').on('click', function (event) {
            showModal(event);
            modalEl.iziModal('open');
        }).on('.trigger', function (event) {
            showModal(event);
            modalEl.iziModal('open');
        });
    };
};

/**
 * Display modal for user-selected accommodation option.
* @param {event}
    */
function showModal(event) {
    event.preventDefault();
    var selectedOptionId = $(event.target).val();
    setModalHTML(selectedOptionId);
    setTimeout(function () {
        var modalOptionHeight = parseInt($('#modalOption').css('height').slice(0, -2));
        modalEl.css('height', `${modalOptionHeight*1.2}px`).css('display', 'flex');
        $('#modalOption').css('align-self', 'center');
    }, 50);
};

/**
 * Sets HTML for modal given the ID for the user-selected accommodation option.
* @param {String} selectedOptionId
    */
function setModalHTML(selectedOptionId) {
    var selectedOption = getSelectedOption(selectedOptionId);
    var states = getPluralStates();
    modalEl.html(`<button class="modal-close" data-izimodal-close="">
                    </button>
                    <div id="modalOption" class="option">
                        <div class="top-container">
                            <div class="columns">
                                <div class="column is-half">
                                    <h2 class="title">${selectedOption.name}</h2>
                                    <span class="info-item location-type"><i class="fas fa-map-marker-alt"></i><h3>${selectedOption.location} | ${selectedOption.type}</h3></span>
                                    <div class="info">
                                        <span class="info-item"><i class="fas fa-users"></i><h3 class="guests">${noOfGuestsEl.val()} ${states[0]} | ${calcDays()} ${states[1]}</h3></span>
                                        <span class="info-item"><i class="fas fa-utensils"></i><h3 class="meals">${selectedOption.mealsAvailable}</h3></span>
                                        <span class="info-item price"><i class="fas fa-dollar-sign"></i><h3>$${calcDays() * selectedOption.unitPrice} | $${selectedOption.unitPrice} per night</h3></span>
                                    </div>
                                </div>
                                <div class="column is-half">
                                    <img class="summary-img" src="${selectedOption.imgSrc}" alt="${selectedOption.name}">
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="bottom-container">
                            <p>${selectedOption.info}</p>
                        </div>
                        <a class="booking-button" href="#">
                            <button class="button">Book now!</button>
                        </a>
                    </div>`);
};

/**
 * Gets the object for the user-selected accommodation option by ID.
* @param {String} selectedOptionId
* @returns {Object} selectedOption
    */
function getSelectedOption(selectedOptionId) {
    var selectedOption;
    $.each(accommData, function (i, option) {
        if (accommData[i].id === parseInt(selectedOptionId)) {
            selectedOption = accommData[i];
            return false;
        };
    });
    return selectedOption;
};

/**
 * Changes screen to return to user input form.
 */
function backToForm() {
    filteredAccommodation = [];
    summaryScreenContentContainerEl.html('');
    summaryScreenContentContainerEl.addClass('hidden');
    userInputScreenEl.addClass('active');
    summaryScreenEl.removeClass('active');
    bodyEl.css('background-image', 'url(../../img/sunrise2.JPG)');
    navbarEl.css('visibility', 'hidden');
    blurbEl.removeClass('hidden');
};

/**
 * Filters all accommodation options according to user inputs.
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
 * Gets the summary HTML for the accommodation options.
* @param {Object} option
* @returns {String}
    */
function getAccommodationSummaryHTML(option) {
    let states = getPluralStates();
    return getAccommodationSummaryWithPlurals(option, states[0], states[1]);
};

/**
 * Determines which of "guests"/"guest" and "nights"/"night" should be displayed.
* @returns {Array} [guest, night]
    */
function getPluralStates() {
    let guest = 'guest',
        guests = 'guests',
        night = 'night',
        nights = 'nights';
    if (noOfGuestsEl.val() > 1) {
        if (calcDays() > 1) {
            return [guests, nights];
        } return [guests, night];
    } else if (calcDays() > 1) {
        return [guest, nights];
    } return [guest, night];
}

/**
 * Get the summary HTML for the accommodation options according to which of "guests"/"guest" and "nights"/"night" should be displayed.
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
                        <span class="info-item location-type"><i class="fas fa-map-marker-alt"></i><h3>${option.location} | ${option.type}</h3></span>
                        <span class="info-item"><i class="fas fa-users"></i><h3 class="guests">${noOfGuestsEl.val()} ${guests} | ${calcDays()} ${nights}</h3></span>
                        <span class="info-item"><i class="fas fa-utensils"></i><h3 class="meals">${option.mealsAvailable}</h3></span>
                        <span class="info-item"><i class="fas fa-dollar-sign"></i><h3 class="price">$${calcDays() * option.unitPrice} | $${option.unitPrice} per night</h3></span>
                    </div>
                    <button class="more-info-button button" value="${option.id}">More info!</button>
                </div>
            </div>`;
};

init();
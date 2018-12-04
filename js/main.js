// DOM Elements
let datepickerInputEl = $('[data-toggle="datepicker"]'),
    inputContainerEl = $('#inputContainer'),
    inputTitleEl = $('#inputTitle'),
    leftArrowEl = $('#leftArrow'),
    rightArrowEl = $('#rightArrow'),
    whenInputEl = $('#whenInput'),
    whereInputEl = $('#whereInput'),
    whoInputEl = $('#whoInput');

// Data
let accommData, mealData, 
    inputTitles = ["WHEN?", "WHERE?", "WHO?", "WHAT?"];

// Misc variables
let currDate = Date.now(), currInputScreen = 0;

function init() {
    $.getJSON('json/accommodation.json', function (options) {
        accommData = options;
        // console.log(accommData);
    });
    $.getJSON('json/meals.json', function (options) {
        mealData = options;
        // console.log(mealData);
    });
    datepickerInputEl.datepicker({
        isDisabled: function (date) {
            return date.valueOf() < currDate ? true : false;
        }
    });
    checkInputStart ()
    rightArrowEl.on('click', slideInputContainerForwards);
    leftArrowEl.on('click', slideInputContainerBackwards);
};

function slideInputContainerForwards () {
    currInputScreen++;
    checkInputStart ();
    inputTitleEl.html(inputTitles[currInputScreen]);
    whenInputEl.animate({left:'-=400px'});
    whereInputEl.animate({left:'-=400px'});
    whoInputEl.animate({left:'-=400px'});
};

function slideInputContainerBackwards () {
    currInputScreen--;
    checkInputStart ();
    inputTitleEl.html(inputTitles[currInputScreen]);
    whenInputEl.animate({left:'+=400px'});
    whereInputEl.animate({left:'+=400px'});
    whoInputEl.animate({left:'+=400px'});
};

function checkInputStart () {
    if(currInputScreen == 0) {
        leftArrowEl.css("visibility", "hidden");
    } else {
        leftArrowEl.css("display", "block");
        leftArrowEl.css("visibility", "visible");
    }
};

init();
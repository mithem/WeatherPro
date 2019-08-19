// APIkey for the openweathermap.org current & 5d/3h-forecast APIs
const APIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

// declaring (/init) timeIndex for forcast & forecast data 'object'
var timeIndex = 0
var forecastData;
var wObj;

// declaring clock (to transform)
var clock = document.getElementById("clock");

// utilities for math, dates and http-requests (and more)

function deDay(day) {
    switch (day) {
        case 1:
            return "Mo";
        case 2:
            return "Di";
        case 3:
            return "Mi";
        case 4:
            return "Do";
        case 5:
            return "Fr";
        case 6:
            return "Sa";
        case 7:
            return "So";
    }
}

function Celsius(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

function kph(ms) {
    return Math.round(ms * 3.6 * 100) / 100;
}

async function getCurrentWeather(city, country) {
    req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + APIkey, true);
    req.onload = function() {
        plotCurrentWeather(JSON.parse(this.response));
    }
    req.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
    }
    req.send();
}
async function getForecastWeather(city, country) {
    requ = new XMLHttpRequest();
    await requ.open("GET", "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&APPID=" + APIkey, true);
    requ.onload = function() {
        forecastData = JSON.parse(this.response);
    }
    requ.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
    }
    requ.send();
}

function toUTCTime(unix) {
    d = toUTCDate(unix);
    return d.getHours() + ":" + d.getMinutes();
}

function toUTCDate(unix) {
    return new Date(unix * 1000);
}

// functions for plotting the weather

function plotCurrentWeather(data) {

    document.querySelector(".box-left .locationDescription .weatherIcon").innerHTML = "";
    data.weather.forEach(i => {
        document.querySelector(".box-left .locationDescription .weatherIcon").innerHTML += "<img class='weatherIcon' src='https://openweathermap.org/img/wn/" + i.icon + "@2x.png' alt='" + i.main + "' title='" + i.description + "' > ";
    });

    document.querySelector(".box-left .locationAdress .city").textContent = data.name;
    document.querySelector(".box-left .locationAdress .country").textContent = data.sys.country;

    document.querySelector(".box-left .weatherDetails .temp div .value").textContent = Celsius(data.main.temp);
    document.querySelector(".box-left .weatherDetails .tempLo div .value").textContent = Celsius(data.main.temp_min);
    document.querySelector(".box-left .weatherDetails .tempHi div .value").textContent = Celsius(data.main.temp_max);
    document.querySelector(".box-left .weatherDetails .pressure div .value").textContent = data.main.pressure;
    document.querySelector(".box-left .weatherDetails .wind div p").textContent = data.wind.speed;
    try {
        document.querySelector(".box-left .weatherDetails .wind div img").style.transform = "rotate(" + (data.wind.deg - 90).toString() + "deg)";
        document.querySelector(".box-left .weatherDetails .wind div img").alt = data.wind.deg.toString() + "°";
    } catch {
        console.warn("Error while parsing wind. Probably no wind direction available due to low speed");
    }
    document.querySelector(".box-left .weatherDetails .humidity div .value").textContent = data.main.humidity;
    document.querySelector(".box-left .weatherDetails .cloudiness div .value").textContent = data.clouds.all;
    document.querySelector(".box-left .weatherDetails .visibility div .value").textContent = data.visibility;
    document.querySelector(".box-left .weatherDetails .sunrise div .value").textContent = toUTCTime(data.sys.sunrise);
    document.querySelector(".box-left .weatherDetails .sunset div .value").textContent = toUTCTime(data.sys.sunset);
}

function plotForecast(id) {
    wObj = forecastData.list[id];
    date = toUTCDate(wObj.dt);

    document.querySelector(".box-right .weatherDetails .temp div .value").textContent = Celsius(wObj.main.temp);
    document.querySelector(".box-right .weatherDetails .tempLo div .value").textContent = Celsius(wObj.main.temp_min);
    document.querySelector(".box-right .weatherDetails .tempHi div .value").textContent = Celsius(wObj.main.temp_max);
    document.querySelector(".box-right .weatherDetails .pressure div .value").textContent = wObj.main.pressure;
    document.querySelector(".box-right .weatherDetails .wind div p").textContent = wObj.wind.speed;
    document.querySelector(".box-right .weatherDetails .wind div img").style.transform = "rotate(" + (wObj.wind.deg - 90).toString() + "deg)";
    document.querySelector(".box-right .weatherDetails .wind div img").alt = wObj.wind.deg.toString() + "°";
    document.querySelector(".box-right .weatherDetails .humidity div .value").textContent = wObj.main.humidity;
    document.querySelector(".box-right .weatherDetails .cloudiness div .value").textContent = wObj.clouds.all;

    document.querySelector(".box-right .weatherDetails .visibility").innerHTML = "";
    wObj.weather.forEach(i => {
        document.querySelector(".box-right .weatherDetails .visibility").innerHTML += "<img class='weatherIcon' src='https://openweathermap.org/img/wn/" + i.icon + "@2x.png' alt='" + i.main + "' title='" + i.description + "' > ";
    });

    document.querySelector(".box-right .weatherDetails .sunrise div .value").textContent = document.querySelector(".box-left .weatherDetails .sunrise div .value").textContent;
    document.querySelector(".box-right .weatherDetails .sunset div .value").textContent = document.querySelector(".box-left .weatherDetails .sunset div .value").textContent;

    // console.debug("current forecast:\nid: " + id + "\n\ntimestamp: " + wObj.dt + "\nnormalised: " + toUTCDate(wObj.dt) + "\n\nforecastHour: " + forecastHour.toString() + "\nfiveDayTracker: " + fiveDayTracker.toString() + "\ncurrentDay: " + currentDay);
}

// getting current weather & displaying it
getCurrentWeather("Lohmar", "de");

// getting forecast data & saving it
forecastData = getForecastWeather("Lohmar", "de");

// initializing vars for handling day-switching
var d0 = new Date();
var d1 = new Date();
var d2 = new Date();
var d3 = new Date();
var d4 = new Date();
var d5 = new Date();
d0.setDate(d0.getDate() + 0);
d1.setDate(d1.getDate() + 1);
d2.setDate(d2.getDate() + 2);
d3.setDate(d3.getDate() + 3);
d4.setDate(d4.getDate() + 4);
d5.setDate(d5.getDate() + 5);

// handling mousewheel-movement to 'scroll' through weather forecast
function moveTimestamp(delta) {
    if ((timeIndex === 0 && delta === -1) || (timeIndex === 39 && delta === 1)) {

    } else {
        timeIndex += delta;
        plotForecast(timeIndex);
        document.getElementById("clock").style.transform += "rotate(" + delta * 90 + "deg)";
    }
    document.querySelector(".clockContainer p").textContent = toUTCTime(wObj.dt) + "0";
    document.querySelector(".is-active").classList.remove("is-active");
    switch (toUTCDate(wObj.dt).getDay()) {
        case d0.getDay():
            document.querySelector(".d1").classList.add("is-active");
            break;
        case d1.getDay():
            document.querySelector(".d2").classList.add("is-active");
            break;
        case d2.getDay():
            document.querySelector(".d3").classList.add("is-active");
            break;
        case d3.getDay():
            document.querySelector(".d4").classList.add("is-active");
            break;
        case d4.getDay():
            document.querySelector(".d5").classList.add("is-active");
            break;
        default:
            alert("Dies ist ein " + deDay(d5.getDay()))
            break;
    }
}

document.body.addEventListener("wheel", () => {
    const delta = Math.sign(event.deltaY);
    moveTimestamp(delta);
});


//
//
// for css media queries
//
//

// checking wether device has iOS
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    document.querySelector(".selectionModule").innerHTML += "<div class='mobile-btn-container'><div class='mobile-btn mobile-btn-plus' onclick='return moveTimestamp(1)' > + </div><div class='mobile-btn mobile-btn-minus' onclick='return moveTimestamp(-1)' > - </div></div>";
}
// APIkey for the openweathermap.org current & 5d/3h-forecast APIs
const APIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

// declaring (/init) timeIndex for forcast & forecast data 'object'
var timeIndex = 0
var forecastData;
var wObj;

// declaring clock (to transform)
var clock = document.getElementById("clock");

// utilities for math, dates and http-requests (and more)

function refreshPage() {
    var city = forecastData.city.name;
    var country = forecastData.city.country;
    getCurrentWeather(city, country);
    getForecastWeather(city, country);
}

function gerDay(day) {
    switch (day) {
        case 0:
            return "So";
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
    }
}

function temp(k) {
    var unit = getCookie("temperature");
    switch (unit) {
        case "Fahrenheit":
            return Fahrenheit(k);
        case "Kelvin":
            return k;
        default:
            return Celsius(k);
    }
}

function Celsius(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

function Fahrenheit(k) {
    return Math.round(((k - 273.15) * 9 / 5 + 32) * 100) / 100;
}

function press(hPa) {
    if (getCookie("pressure") !== "hPa") {
        return Bar(hPa);
    } else {
        return hPa;
    }
}

function Bar(hPa) {
    return hPa / 1000;
}

function windy(ms) {
    var unit = getCookie("wind");
    switch (unit) {
        case "ms":
            return ms;
        case "mph":
            return mph(ms);
        case "knots":
            return knots(ms);
        default:
            return kph(ms);
    }
}

function kph(ms) {
    return Math.round(ms * 3.6 * 10) / 10;
}

function mph(ms) {
    return Math.round((ms * 2.237) * 10) / 10;
}

function knots(ms) {
    return Math.round((ms * 1.944) * 10) / 10
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

async function getCurrentWeather(city, country) {
    req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + APIkey, true);
    req.onload = function() {
        plotCurrentWeather(JSON.parse(this.response));
    }
    req.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getCurrent): " + req.statusText);
    }
    req.send();
}
async function getForecastWeather(city, country) {
    requ = new XMLHttpRequest();
    await requ.open("GET", "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&APPID=" + APIkey, true);
    requ.onload = function() {
        forecastData = JSON.parse(this.response);
        moveTimestamp(1);
        moveTimestamp(-1);
    }
    requ.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getForecast): " + req.statusText);
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

    document.querySelector(".box-left .weatherDetails .temp div .value").textContent = temp(data.main.temp);
    document.querySelector(".box-left .weatherDetails .tempLo div .value").textContent = temp(data.main.temp_min);
    document.querySelector(".box-left .weatherDetails .tempHi div .value").textContent = temp(data.main.temp_max);
    document.querySelector(".box-left .weatherDetails .pressure div .value").textContent = press(data.main.pressure);
    document.querySelector(".box-left .weatherDetails .wind div p").textContent = windy(data.wind.speed);
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

    document.querySelector(".box-right .weatherDetails .temp div .value").textContent = temp(wObj.main.temp);
    document.querySelector(".box-right .weatherDetails .tempLo div .value").textContent = temp(wObj.main.temp_min);
    document.querySelector(".box-right .weatherDetails .tempHi div .value").textContent = temp(wObj.main.temp_max);
    document.querySelector(".box-right .weatherDetails .pressure div .value").textContent = press(wObj.main.pressure);
    document.querySelector(".box-right .weatherDetails .wind div p").textContent = windy(wObj.wind.speed);
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
    try {
        document.querySelector(".is-active").classList.remove("is-active");
    } catch (error) {
        console.info(error);
    }
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
            alert("Dies ist ein " + gerDay(d5.getDay()))
            break;
    }
}

// event listeners for scrubbing the wheel
document.addEventListener("wheel", () => {
    const delta = Math.sign(event.deltaY);
    moveTimestamp(delta);
});
document.addEventListener("touchmove", function() {
    const delta = Math.sign(event.deltaY);
    moveTimestamp(delta);
});
// event listener for changing location
document.querySelector(".locationAdress").addEventListener("click", () => {
    var loc = prompt("Neuer Ort:\nBsp: Los Angeles,us", forecastData.city.name);
    try {
        reqLocation = loc.split(",");
    } catch (error) {
        alert("Bitte gültiges Ortsformat verwenden (siehe Beispiel im prompt)");
    }
    getCurrentWeather(reqLocation[0], reqLocation[1]);
    getForecastWeather(reqLocation[0], reqLocation[1]);
});
// event listeners for navbar icons (refresh, settings, about)
document.getElementById("refresh").addEventListener("click", () => {
    refreshPage();
});

document.getElementById("settings").addEventListener("click", () => {
    document.querySelector("div.settingsPanel").classList.toggle("settingsOpened");
});
document.getElementById("settings-save-btn").addEventListener("click", () => {
    var settingsData = new FormData(document.querySelector(".settingsPanel form"));
    document.cookie = "temperature=" + settingsData.get("temperature");
    document.cookie = "pressure=" + settingsData.get("pressure");
    document.cookie = "wind=" + settingsData.get("wind");
    refreshPage();
});

// giving daySelector the correct days & setting it's tooltip to the correct date
document.querySelector(".d1").textContent = gerDay(d0.getDay());
document.querySelector(".d2").textContent = gerDay(d1.getDay());
document.querySelector(".d3").textContent = gerDay(d2.getDay());
document.querySelector(".d4").textContent = gerDay(d3.getDay());
document.querySelector(".d5").textContent = gerDay(d4.getDay());

document.querySelector(".d1").title = d0.getDate();
document.querySelector(".d2").title = d1.getDate();
document.querySelector(".d3").title = d2.getDate();
document.querySelector(".d4").title = d3.getDate();
document.querySelector(".d5").title = d4.getDate();



//
//
// for css media queries
//
//

// checking wether device has iOS / macOS
// (backup to touchmove event)
if (/iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && !window.MSStream) {
    document.querySelector(".selectionModule").innerHTML += "<div class='mobile-btn-container'><div class='mobile-btn mobile-btn-plus' onclick='return moveTimestamp(1)' > + </div><div class='mobile-btn mobile-btn-minus' onclick='return moveTimestamp(-1)' > - </div></div>";
}
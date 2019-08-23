// APIkey for the openweathermap.org current & 5d/3h-forecast APIs
const APIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

// declaring (/init) timeIndex for forcast & forecast data 'object' as well as other stuff
var timeIndex = 0
var forecastData;
var wObj;
var settingsData = new FormData(document.querySelector(".settingsPanel form"));
var darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");



// declaring clock (to transform)
var clock = document.getElementById("clock");

// utilities for math, dates and http-requests (and more)

function getSettings() {
    settingsData = new FormData(document.querySelector(".settingsPanel form"));
}
//
// dark & light mode toggling
//

checkColorScheme();


function checkColorScheme() {
    if (getCookie("colorScheme") === "Auto") {
        darkModeQuery.matches ? changeColorScheme("dark") : changeColorScheme("light");
        activateAutoScheme();
    } else {
        deactivateAutoScheme();
        changeColorScheme(getCookie("colorScheme"));
    }
}

function changeColorScheme(scheme) {
    var imgs = document.querySelectorAll(".detail img");
    switch (scheme.toLowerCase()) {
        case "light":
            document.getElementById("light").disabled = false;
            document.getElementById("dark").disabled = true;
            imgs.forEach(i => {
                i.src = i.src.replace("DarkMode", "LightMode");
            });
            break;
        default:
            document.getElementById("light").disabled = true;
            document.getElementById("dark").disabled = false;
            imgs.forEach(i => {
                i.src = i.src.replace("LightMode", "DarkMode");
            });
    }
}


function autoSchemeChange() {
    !darkModeQuery.matches ? changeColorScheme("light") : changeColorScheme("dark");
}

function activateAutoScheme() {
    darkModeQuery.addListener(autoSchemeChange);
}

function deactivateAutoScheme() {
    darkModeQuery.removeListener(autoSchemeChange);
}

function refrData() {
    try {
        var city = forecastData.city.name;
        var country = forecastData.city.country;
        getCurrentWeather(city, country);
        getForecastWeather(city, country);
    } catch (error) {
        try {
            getUserLocation();
            alert("hohoho");
        } catch (error) {
            alert("hahahah");
            getCurrentWeather("Berlin", "de");
            getForecastWeather("Berlin", "de");
        };
    }

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
        return Math.round(hPa * 10) / 10;
    }
}

function Bar(hPa) {
    return Math.round(hPa / 100) / 10;
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
    var req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + APIkey, true);
    req.onload = function() {
        plotCurrentWeather(JSON.parse(this.response));
        console.info("current weather repsonse: " + this.statusText);
    }
    req.onerror = function(e) {
        console.error("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getCurrent): " + req.statusText);
    }
    req.send();
}
async function getForecastWeather(city, country) {
    var req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&APPID=" + APIkey, true);
    req.onload = function() {
        forecastData = JSON.parse(this.response);
        console.info("forecast weather repsonse: " + this.statusText);
        plotForecast(0);
    }
    req.onerror = function(e) {
        console.error("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getForecast): " + req.statusText);
    }
    req.send();
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
        document.querySelector(".box-left .weatherDetails .wind div img").path.stroke = "#00FF00";
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
}

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

// giving the dayselector the correct days
function initDaysOfDaySelector() {
    document.querySelector(".d1").textContent = gerDay(d0.getDay());
    document.querySelector(".d2").textContent = gerDay(d1.getDay());
    document.querySelector(".d3").textContent = gerDay(d2.getDay());
    document.querySelector(".d4").textContent = gerDay(d3.getDay());
    document.querySelector(".d5").textContent = gerDay(d4.getDay());
}

initDaysOfDaySelector();

// handling mousewheel-movement to 'scroll' through weather forecast
function moveTimestamp(delta) {
    if ((timeIndex === 0 && delta === -1) || (timeIndex === 39 && delta === 1)) {

    } else {
        timeIndex += delta;
        plotForecast(timeIndex);
        document.getElementById("clock").style.transform = "rotate(" + toUTCDate(wObj.dt).getHours() * 30 + "deg)";
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

// changing the location

function changeLocation() {
    var loc
    try {
        loc = prompt("Neuer Ort:\nBsp: Los Angeles,us", forecastData.city.name);
    } catch (error) {
        loc = prompt("Neuer Ort:\nBsp: Los Angeles,us", "Berlin,de");
    }
    if (loc) {
        try {
            reqLocation = loc.split(",");
            getCurrentWeather(reqLocation[0], reqLocation[1]);
            getForecastWeather(reqLocation[0], reqLocation[1]);
        } catch (error) {
            alert("Bitte gültiges Ortsformat verwenden (siehe Beispiel im prompt)");
        }
    }
}


function applySettings() {
    settingsData = new FormData(document.querySelector(".settingsPanel form"));
    document.cookie = "temperature=" + settingsData.get("temperature");
    document.cookie = "pressure=" + settingsData.get("pressure");
    document.cookie = "wind=" + settingsData.get("wind");
    document.cookie = "colorScheme=" + settingsData.get("colorScheme");
    checkColorScheme();
}


function toggleSettingsPanel() {
    document.querySelector("div.settingsPanel").classList.toggle("panelOpened");
}

function toggleInfoPanel() {
    document.querySelector("div.infoPanel").classList.toggle("panelOpened");
}


//
// geolaction for locating the user
//

var userLatitude;
var userLongitude;

function getWeatherAtCoords(position) {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    getCurrentWeatherCoords(userLatitude, userLongitude);
    getForecastWeatherCoords(userLatitude, userLongitude);
}

function handlePositionErrors(e) {
    var msg = "GeoLocationError:\n\nStatusCode: " + e.code + "\nMessage: " + e.message;
    console.error(msg);
    alert(msg);
    changeLocation();
}

function getUserLocation() {
    if (navigator.geolocation) {
        try {
            navigator.geolocation.getCurrentPosition(getWeatherAtCoords, handlePositionErrors);
        } catch (error) {
            alert(error);
        }
    } else {
        alert("Standort kann nicht ermittelt werden. Bitte Stadt eingeben");
        changeLocation();
    }
}




// getCurrentWeather("Berlin", "de");
// getForecastWeather("Berlin", "de");
// plotForecast(0);



async function getCurrentWeatherCoords(lat, long) {
    var req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&APPID=" + APIkey, true);
    req.onload = function() {
        plotCurrentWeather(JSON.parse(this.response));
        console.info("current weather repsonse (coords): " + this.statusText);
    }
    req.onerror = function(e) {
        console.error("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getCurrentWeatherByCoords): " + req.statusText);
    }
    req.send();
}

async function getForecastWeatherCoords(lat, long) {
    var req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + long + "&APPID=" + APIkey, true);
    req.onload = function() {
        console.info("forecast weather repsonse (coords): " + this.statusText);
        forecastData = JSON.parse(this.response);
        plotForecast(0);
    }
    req.onerror = function(e) {
        console.error("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler (getForecastWeatherByCoords): " + req.statusText + "(" + e + ")");
    }
    req.send();
}

getUserLocation();

//
// for css media queries
//

// checking wether device has iOS / macOS
// (backup to touchmove event)
if (/iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && !window.MSStream) {
    document.querySelector(".selectionModule").innerHTML += "<div class='mobile-btn-container'><div class='mobile-btn mobile-btn-plus' onclick='return moveTimestamp(1)' > + </div><div class='mobile-btn mobile-btn-minus' onclick='return moveTimestamp(-1)' > - </div></div>";
}


if (!getCookie("cookieWarning")) {
    var cookieWarning = document.createElement("div");
    cookieWarning.className = "cookieWarning";
    document.body.appendChild(cookieWarning);
    cookieWarning.innerHTML = "<p>Diese Seite verwendet Cookies zum Speichern der Einstellungen und Google Analytics</p><button>ok</button>";
    document.getElementsByClassName("cookieWarning")[0].addEventListener("click", () => {
        document.cookie = "cookieWarning=true;";
        document.getElementsByClassName("cookieWarning")[0].style.display = "none";
    })
}

//
// event listeners
//

// event listeners for scrubbing the wheel
document.addEventListener("wheel", () => {
    const delta = Math.sign(event.deltaY);
    moveTimestamp(delta);
});
document.addEventListener("touchmove", function() {
    const delta = Math.sign(event.deltaY);
    moveTimestamp(delta);
});

// for changing location
document.querySelector(".logoContainer").addEventListener("click", changeLocation);
document.querySelector(".locationAdress").addEventListener("click", changeLocation);

// Navbar icons
document.getElementById("refresh").addEventListener("click", refrData);
document.getElementById("settings").addEventListener("click", toggleSettingsPanel);
document.getElementById("settings-save-btn").addEventListener("click", () => {
    applySettings();
    toggleSettingsPanel();
});
document.getElementById("about").addEventListener("click", toggleInfoPanel);
document.getElementById("location").addEventListener("click", getUserLocation);
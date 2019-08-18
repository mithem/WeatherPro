const currentAPIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

function Celsius(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

async function getCurrentWeather(city, country) {
    var data;
    req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + currentAPIkey, true);
    req.onload = function() {
        data = JSON.parse(this.response);
        plotCurrentWeather(data);
    }
    req.onerror = function(e) {
        console.error(req.statusText);
        Window.alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
        return;
    }
    req.send();
}

function toUTCTime(unix) {
    var d = new Date(unix * 1000);
    return d.getHours() + ":" + d.getMinutes();
}

var Pdata;

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
    Pdata = data;
}


getCurrentWeather("Lohmar", "DE");

var currentDay = "d1";
document.querySelectorAll(".day").forEach(i => {
    i.addEventListener("click", () => {
        forecastHour = 0;
        currentDay = i.classList[1].toString();
        try {
            document.querySelector(".is-active").classList.remove("is-active");
        } catch (e) {
            console.warn("css classes messed up: " + e);
        }
        i.classList.add("is-active");
        switch (i.classList[1]) {
            case "d1":
                break;
            case "d2":
                fiveDayTracker = 8;
                break;
            case "d3":
                fiveDayTracker = 16;
                break;
            case "d4":
                fiveDayTracker = 24;
                break;
            case "d5":
                fiveDayTracker = 32;
                break;
        }
        document.querySelector("#clock").style.transform = "rotate(0deg)";
        document.querySelector(".clockContainer p").textContent = "00:00";
        // animateClock();
    })
});


document.querySelector(".box-left .locationAdress").addEventListener("click", () => {
    currentLoc = (Pdata.name + "," + Pdata.sys.country).toString();
    var loc = prompt("Neuen Ort eingeben: \nLos Angeles,us", currentLoc);
    try {
        var location = loc.split(",");
    } catch (error) {
        Window.alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + error);
    }
    getCurrentWeather(location[0], location[1]);
    getForecastWeather(location[0], location[1]);
});

function animateClock() {
    const delta = Math.sign(event.deltaY);
    if (forecastHour === 21 && delta === 1) {

    } else if (forecastHour === 0 && delta === -1) {

    } else {
        clock.style.transform += "rotate(" + (delta * 90).toString() + "deg)";
        forecastHour += 3 * delta;
        fiveDayTracker += delta;
    }
    drawForecast(fiveDayTracker);
    document.querySelector(".clockContainer p").textContent = forecastHour.toString() + ":00";
}

var forecastHour = 0;
var fiveDayTracker = 1;

var clock = document.getElementById("clock");
window.addEventListener("wheel", animateClock); //event => {
//     const delta = Math.sign(event.deltaY);
//     if (forecastHour === 21 && delta === 1) {

//     } else if (forecastHour === 0 && delta === -1) {

//     } else {
//         clock.style.transform += "rotate(" + (delta * 90).toString() + "deg)";
//         forecastHour += 3 * delta;
//         fiveDayTracker += delta;
//     }
//     drawForecast(fiveDayTracker);
//     document.querySelector(".clockContainer p").textContent = forecastHour.toString() + ":00";
// });

function drawForecast(id) {
    if (id !== "he") {
        wObj = forecastData.list[id];
    }
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
}

var forecastData;
async function getForecastWeather(city, country) {
    requ = new XMLHttpRequest();
    await requ.open("GET", "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&APPID=" + currentAPIkey, true);
    requ.onload = function() {
        forecastData = JSON.parse(this.response);
    }
    requ.onerror = function(e) {
        console.error(req.statusText);
        Window.alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
        return;
    }
    requ.send();
}

getForecastWeather("Lohmar", "de");
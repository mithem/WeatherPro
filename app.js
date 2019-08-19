const currentAPIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

function Celsius(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

function kph(ms) {
    return Math.round(ms * 3.6 * 100) / 100;
}

var forecastHour = 0;
var fiveDayTracker = 1;
var data;


async function getCurrentWeather(city, country) {
    req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + currentAPIkey, true);
    req.onload = function() {
        data = JSON.parse(this.response);
        plotCurrentWeather(data);
    }
    req.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
        return;
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
    document.querySelector(".box-left .weatherDetails .wind div p").textContent = kph(data.wind.speed);
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
        currentDay = i.classList[1].toString();
        if (currentDay !== "d1") {
            forecastHour = 0;
        }
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
                console.debug("fiveDaytracker before: " + fiveDayTracker);
                fiveDayTracker = 8 - Math.floor(parseInt(toUTCDate(forecastData.list[fiveDayTracker].dt).getHours()));
                console.debug("fiveDayTracker after: " + fiveDayTracker);
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
        clock.style.transform = "rotate(0deg)";
        forecastReset();
    })
});

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


function setup() {
    document.body.addEventListener("wheel", () => {
        const delta = Math.sign(event.deltaY);

        if (forecastHour >= 21 && delta === 1) {

        } else if (forecastHour === 0 && delta === -1) {

        } else if (fiveDayTracker === 0 && delta === -1) {

        } else {
            clock.style.transform = "rotate(" + ((forecastHour) * 30).toString() + "deg)";
            forecastHour += 3 * delta;
            fiveDayTracker += delta;
        }
        if (currentDay === "d1") {
            if (forecastHour < parseInt(toUTCDate(forecastData.list[fiveDayTracker].dt).getHours())) {
                forecastHour = parseInt(toUTCDate(forecastData.list[fiveDayTracker].dt).getHours());
            } else {
                clock.style.transform = "rotate(" + ((forecastHour) * 30).toString() + "deg)";
                forecastHour += 3 * delta;
                fiveDayTracker += delta;
            }
        }

        drawForecast(fiveDayTracker);
        document.querySelector(".clockContainer p").textContent = forecastHour.toString() + ":00";
    });
    document.querySelector(".d1").textContent = deDay(toUTCDate(forecastData.list[0].dt).getDay());
    document.querySelector(".d2").textContent = deDay(toUTCDate(forecastData.list[9].dt).getDay());
    document.querySelector(".d3").textContent = deDay(toUTCDate(forecastData.list[17].dt).getDay());
    document.querySelector(".d4").textContent = deDay(toUTCDate(forecastData.list[25].dt).getDay());
    document.querySelector(".d5").textContent = deDay(toUTCDate(forecastData.list[33].dt).getDay());

    document.querySelector(".d1").title = toUTCDate(forecastData.list[0].dt).getDate();
    document.querySelector(".d2").title = toUTCDate(forecastData.list[9].dt).getDate();
    document.querySelector(".d3").title = toUTCDate(forecastData.list[17].dt).getDate();
    document.querySelector(".d4").title = toUTCDate(forecastData.list[25].dt).getDate();
    document.querySelector(".d5").title = toUTCDate(forecastData.list[33].dt).getDate();

    forecastHour = parseInt(toUTCDate(forecastData.list[0].dt).getHours());
}

function forecastReset() {
    forecastHour = 0;
    document.querySelector(".clockContainer p").textContent = "00:00";
    drawForecast(fiveDayTracker);
}


document.querySelector(".box-left .locationAdress").addEventListener("click", () => {
    currentLoc = (Pdata.name + "," + Pdata.sys.country).toString();
    var loc = prompt("Neuen Ort eingeben: \nLos Angeles,us", currentLoc);
    try {
        var location = loc.split(",");
    } catch (error) {
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + error);
    }
    getCurrentWeather(location[0], location[1]);
    getForecastWeather(location[0], location[1]);
});

var clock = document.getElementById("clock");

function drawForecast(id) {
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

    console.debug("current forecast:\nid: " + id + "\n\ntimestamp: " + wObj.dt + "\nnormalised: " + toUTCDate(wObj.dt) + "\n\nforecastHour: " + forecastHour.toString() + "\nfiveDayTracker: " + fiveDayTracker.toString() + "\ncurrentDay: " + currentDay);
}

var forecastData;
async function getForecastWeather(city, country) {
    requ = new XMLHttpRequest();
    await requ.open("GET", "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&APPID=" + currentAPIkey, true);
    requ.onload = function() {
        forecastData = JSON.parse(this.response);
        setup();
    }
    requ.onerror = function(e) {
        console.error(req.statusText);
        alert("Es trat ein Fehler auf. Bitte Eingabe auf Formatierung überprüfen und Netzwerkverbindung sicherstellen.\n\nFehler: " + req.statusText);
        return;
    }
    requ.send();
}

getForecastWeather("Lohmar", "de");
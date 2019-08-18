const currentAPIkey = "3a1fcf20bd2c469656a9ab0e1c686428";

function Celsius(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

function Fahrenheit(k) {
    return Math.round((k - 273.15) * 100) / 100;
}

async function getCurrentWeather(city, country) {
    var data;
    req = new XMLHttpRequest();
    await req.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&APPID=" + currentAPIkey, true);
    req.onload = function() {
        data = JSON.parse(this.response);
        plotWeather(data);
    }
    req.onerror = function(e) {
        console.error(req.statusText);
    }
    req.send();
}
var Pdata;

function plotWeather(data) {
    var dR = new Date(data.sys.sunrise * 1000);
    var sunriseTime = dR.getHours() + ":" + dR.getMinutes();
    var dS = new Date(data.sys.sunset * 1000);
    var sunsetTime = dS.getHours() + ":" + dS.getMinutes();
    document.querySelector(".box-left .locationAdress .city").textContent = data.name;
    document.querySelector(".box-left .locationAdress .country").textContent = data.sys.country;

    document.querySelector(".temp div .value").textContent = Celsius(data.main.temp);
    document.querySelector(".tempLo div .value").textContent = Celsius(data.main.temp_min);
    document.querySelector(".tempHi div .value").textContent = Celsius(data.main.temp_max);
    document.querySelector(".pressure div .value").textContent = data.main.pressure;
    document.querySelector(".wind div p").textContent = data.wind.speed;
    document.querySelector(".wind div img").style.transform = "rotate(" + (data.wind.deg - 90).toString() + "deg)";
    document.querySelector(".wind div img").alt = data.wind.deg.toString() + "°";
    document.querySelector(".humidity div .value").textContent = data.main.humidity;
    document.querySelector(".cloudiness div .value").textContent = data.clouds.all;
    document.querySelector(".visibility div .value").textContent = data.visibility;
    document.querySelector(".sunrise div .value").textContent = sunriseTime;
    document.querySelector(".sunset div .value").textContent = sunsetTime;
    Pdata = data;
}


getCurrentWeather("Lohmar", "DE");
document.querySelector(".box-left .locationAdress").addEventListener("click", function changeLocation() {
    currentLoc = (Pdata.name + "," + Pdata.sys.country).toString();
    console.log(currentLoc);
    var loc = prompt("Enter new location like this: \nLos Angeles,uk", currentLoc);
    var location = loc.split(",");
    getCurrentWeather(location[0], location[1]);
});
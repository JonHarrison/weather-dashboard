$(document).ready(function () {
    // Constants
    const formHeadingEl = $('#form-heading');
    const searchFormEl = $('#search-form');
    const searchInputEl = $('#search-input');
    const searchButtonEl = $('#search-button');
    const historyEl = $('#history');
    const todayEl = $('#today');
    const forecastEl = $('#forecast');

    const APIKey = "8143ac5be27f4f44b6e5d03ce390686b"; // my personal KEY

    const methods = { fetch: 1, async: 2 };
    const method = methods.fetch;

    const units = { default: "standard", metric: "metric", imperial: "imperial" };
    const apiUnit = units.default; // returns temperature in Kelvin, wind speed in m/s

    // convert API units to MPH
    function windSpeedToDisplay(speed) {
        switch (apiUnit) {
            case units.default:
                const ratioMsToMph = 3600 / (1760 * 3 * 12) * (1000 / 25.4); // m/s > m/h = 3600 , 1760 yards in a mile, 3 ft in a yard, 12 inches in a foot, 1000/25.4 inches in a meter
                return (speed * ratioMsToMph).toFixed(1) + ' MPH';
                break;
            default:
                // not implemented
                break;
        }
    }

    // convert API units to degrees Celsius
    function tempToDisplay(temp) {
        switch (apiUnit) {
            case units.default:
                // 0 Kelvin = -273.15 Celsius
                return (temp - 273.15).toFixed(2) + ' \xB0' + 'C' // 0xB0 is degree symbol
            default:
                // not implemented
                break;
        }
    }

    function displayCurrentWeather(data) {
        console.log(data);
        const { name, main: { temp, temp_min: tmin, temp_max: tmax, humidity: hum }, wind: { deg: wd, speed: ws }, ...rest } = data;
        todayEl.append([
            $('<div>', { class: 'row mr-0' }).append([
                $('<div>', { class: 'col-12 border border-dark m-3 rounded' }).append([
                    $('<h3>', { 'class': 'h3 display-4', 'text': `${name} (${moment().format('DD/MM/YYYY')})` }).append([
                        $('<img>', { 'src': `http://openweathermap.org/img/w/${data.weather[0].icon}.png`, 'alt': data.weather[0].description }),
                        $('<img>', { 'src': `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, 'alt': data.weather[0].description })
                    ]),
                    $('<p>', { 'class': 'h4', 'text': `Temp: ${tempToDisplay(temp)} (min: ${tempToDisplay(tmin)} max: ${tempToDisplay(tmax)})` }),
                    $('<p>', { 'class': 'h4', 'text': `Wind: ${windSpeedToDisplay(ws)} (direction ${wd} deg)` }),
                    $('<p>', { 'class': 'h4', 'text': `Wind: ${windSpeedToDisplay(ws)}` }).append([$('<i>', { 'class': `wi wi-wind towards-${wd}-deg` })]),
                    $('<p>', { 'class': 'h4', 'text': `Humidity: ${hum}%` })
                ])
            ])
        ]);
    }

    function getWeather(cityName) {

        let queryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${APIKey}`;

        switch (method) {
            case methods.async:
                const userAction = async () => {
                    const response = await fetch(queryURL);
                    const myJson = await response.json(); // extract JSON from the html response
                    console.log(myJson);
                }
                break;
            case methods.fetch:
                fetch(queryURL)
                    .then(function (response) {
                        if (response.ok) { return response.json(); } // convert data to JSON
                        throw new Error('fetch(' + queryURL + ') failed');
                    })
                    .then(function (response) {
                        let lat = response[0].lat;
                        let lon = response[0].lon;
                        // current weather API
                        let queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=${apiUnit}`;
                        fetch(queryURL)
                            .then(function (response) {
                                if (response.ok) { return response.json(); } // convert data to JSON
                                throw new Error('fetch(' + queryURL + ') failed');
                            })
                            .then(function (response) {
                                console.log(response);
                                displayCurrentWeather(response);
                            })
                            .catch(function (error) {
                                alert("name:" + error.name + " message:" + error.message);
                                // catch any errors
                            });
                    })
                    .catch(function (error) {
                        alert("name:" + error.name + " message:" + error.message);
                        // catch any errors
                    });
                break;
        }
    }

    getWeather('London');

});

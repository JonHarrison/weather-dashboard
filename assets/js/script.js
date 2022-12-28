"use strict";

$(document).ready(function () {
    // Constants
    const formHeadingEl = $('#form-heading');
    const searchFormEl = $('#search-form');
    const searchInputEl = $('#search-input');
    const searchButtonEl = $('#search-button');
    const historyEl = $('#history');
    const todayEl = $('#today');
    const forecastEl = $('#forecast');

    const LSKey = 'WeatherDashboard.History'; // localStorage KEY
    const APIKey = '8143ac5be27f4f44b6e5d03ce390686b'; // my personal KEY
    const FIVE_DAY_FORECAST_SELECTED_HOUR = 12; // select weather at midday for 5-day forecast

    const units = { default: "standard", metric: "metric", imperial: "imperial" };
    const apiUnit = units.default; // returns temperature in Kelvin, wind speed in m/s

    var searchHistory = JSON.parse(localStorage.getItem(LSKey)) ?? []; // null coalescing operator gives initial empty array

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

    function renderCurrentWeather(location, data) {
        console.log(location, data);
        const { main, main: { temp, temp_min: tmin, temp_max: tmax, humidity: hum }, wind: { deg: wd, speed: ws }, ...rest } = data;
        todayEl.empty();
        todayEl.append([
            $('<div>', { class: 'row' }).append([
                $('<div>', { class: 'col' }).append([
                    $('<div>', { class: 'card rounded border border-secondary' }).append([ // border border-dark
                        $('<div>', { class: 'card-body' }).append([
                            $('<p>', { 'class': 'card-title h2 font-weight-bold', 'text': `${location} (${moment().format('DD/MM/YYYY')})` }).append([
                                $('<img>', { 'src': `http://openweathermap.org/img/w/${data.weather[0].icon}.png`, 'alt': data.weather[0].description }),
                                // $('<img>', { 'src': `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, 'alt': data.weather[0].description })
                            ]),
                            $('<p>', { 'class': 'card-text h5', 'text': `Temp: ${tempToDisplay(temp)} (min: ${tempToDisplay(tmin)} max: ${tempToDisplay(tmax)})` }),
                            // $('<p>', { 'class': 'card-text h5', 'text': `Wind: ${windSpeedToDisplay(ws)} (direction ${wd} deg)` }),
                            $('<p>', { 'class': 'card-text h5', 'text': `Wind: ${windSpeedToDisplay(ws)} ` }).append([$('<i>', { 'class': `wi wi-wind towards-${wd}-deg` })]),
                            $('<p>', { 'class': 'card-text h5', 'text': `Humidity: ${hum}%` })
                        ])
                    ])
                ])
            ])
        ]);
    }

    function renderFiveDayWeather(data) {
        console.log(data);
        forecastEl.empty();
        forecastEl.append(
            $('<div>', { 'class': 'col-12 pt-3' }).append(
                $('<h4>', { 'class': 'font-weight-bold', 'text': '5-Day Forecast:' })
            )
        );

        // var fiveDayEl = $('<div class="row container-fluid">'); // d-flex flex-row justify-content-around 
        // forecastEl.append('<div class="row row-cols-5">'); // <div class="container-fluid"> row-cols-xs-1 row-cols-lg-6 d-flex flex-row justify-content-around
        data.list.forEach(function (entry, index) {
            var timestamp = moment.unix(entry.dt).format('DD/MM/YYYY HH:MM:SS');
            //console.log(`timestamp : ${timestamp}`);
            if (moment.unix(entry.dt).hours() === FIVE_DAY_FORECAST_SELECTED_HOUR) {
                console.log(`using entry ${index}`);
                const { main, main: { temp, humidity: hum }, wind: { deg: wd, speed: ws }, ...rest } = entry;
                forecastEl.append(
                    $('<div>', { class: 'col' }).append(
                        $('<div>', { class: 'card forecast' }).append( // border border-dark
                            $('<div>', { class: 'card-body' }).append([
                                $('<h4>', { 'class': 'card-title', 'text': `${moment.unix(entry.dt).format('DD/MM/YYYY')}` }),
                                $('<img>', { 'src': `http://openweathermap.org/img/w/${entry.weather[0].icon}.png`, 'alt': entry.weather[0].description }),
                                // $('<img>', { 'src': `http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`, 'alt': entry.weather[0].description }),
                                $('<p>', { 'class': 'card-text', 'text': `Temp: ${tempToDisplay(temp)}` }),
                                // $('<p>', { 'class': 'card-text', 'text': `Wind: ${windSpeedToDisplay(ws)} (direction ${wd} deg)` }),
                                $('<p>', { 'class': 'card-text', 'text': `Wind: ${windSpeedToDisplay(ws)} ` }).append([$('<i>', { 'class': `wi wi-wind towards-${wd}-deg` })]),
                                $('<p>', { 'class': 'card-text', 'text': `Humidity: ${hum}%` })
                            ])
                        )
                    )
                );
            }
        })
        forecastEl.append(fiveDayEl);
    }

    async function getGeocodeFromLocation(location) {
        // Geocoding API gets geographical location (name,state,country) and coordinates (lat, lon) from location
        let queryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${APIKey}`;
        let response = await fetch(queryURL)
            .then(function status(response) {
                if (!response.ok) {
                    return Promise.reject(new Error(response.statusText));
                }
                return Promise.resolve(response);
            })
            .then(function json(response) {
                return Promise.resolve(response.json());
            })
            .then(function (data) {
                console.log(data);
                return { name: data[0].name, state: data[0].state, country: data[0].country, lat: data[0].lat, lon: data[0].lon };
            })
            .catch(function (error) {
                console(error);
            });
        console.log(response);
        return response;
    }

    async function getCurrentWeatherForCoords(lat, lon) {
        // current weather API
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=${apiUnit}`;
        const response = await fetch(queryURL)
            .then(function (response) {
                if (response.ok) {
                    return response.json(); // convert data to JSON
                }
                throw new Error('fetch(' + queryURL + ') failed');
            })
            .then(function (data) {
                console.log(data);
                return (data);
            })
            .catch(function (error) {
                alert("name:" + error.name + " message:" + error.message);
                // catch any errors
            });
        console.log(response);
        return response;
    }

    async function getFiveDayThreeHourForecastForCoords(lat, lon) {
        // current weather API
        let queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=${apiUnit}`;
        const response = await fetch(queryURL)
            .then(function (response) {
                if (response.ok) {
                    return response.json(); // convert data to JSON
                }
                throw new Error('fetch(' + queryURL + ') failed');
            })
            .then(function (data) {
                console.log(data);
                return (data);
            })
            .catch(function (error) {
                alert("name:" + error.name + " message:" + error.message);
                // catch any errors
            });
        console.log(response);
        return response;
    }

    function displayWeatherForGeocode(geocode) {
        getCurrentWeatherForCoords(geocode.lat, geocode.lon)
            .then(function (weather) {
                let loc = `${geocode.name},${geocode.state} (${geocode.country})`; // format location string
                renderCurrentWeather(loc, weather);
            });
        getFiveDayThreeHourForecastForCoords(geocode.lat, geocode.lon)
            .then(function (weather) {
                renderFiveDayWeather(weather);
            });
    }

    searchButtonEl.on('click', function (event) {
        event.preventDefault();
        let location = searchInputEl.val().trim();
        getGeocodeFromLocation(location)
            .then(function (geocode) {
                // let entry = { name, state, country, coords }
                if (!searchHistory.find(geocode => (geocode.name === location))) { // only add if it isn't already in the history (match location)
                    searchHistory.push(geocode);
                    localStorage.setItem(LSKey, JSON.stringify(searchHistory));
                    // displayHistory();
                    renderHistoryButton(geocode, searchHistory.length);
                }
                // getWeather(location);
                displayWeatherForGeocode(geocode);
            });
    })

    historyEl.on('click', '.list-group-item', function (event) {
        event.preventDefault();
        let entry = event.target;
        // let location = entry.getAttribute('data-location');
        // getWeather(location);
        let geocode = JSON.parse(entry.getAttribute('data-geocode'));
        displayWeatherForGeocode(geocode);
    })

    function renderHistoryButton(geocode, index) {
        var btnEl = $('<button>', {
            class: 'list-group-item',
            id: `btn${index}`,
            text: `${geocode.name} (${geocode.country})`, // use city and country for uniqueness
            // 'data-location': entry.location,
            'data-geocode': JSON.stringify(geocode)
        });
        historyEl.prepend(btnEl);
    }

    function displayHistory() {
        // searchHistory = JSON.parse(localStorage.getItem(LSKey));
        historyEl.empty();
        searchHistory.forEach(function (entry, index) {
            renderHistoryButton(entry, index);
        })
    }

    function getWeather(location) {
        getGeocodeFromLocation(location)
            .then(function (geocode) {
                console.log(geocode);
                displayWeatherForGeocode(geocode);
            });
    }

    displayHistory();

});

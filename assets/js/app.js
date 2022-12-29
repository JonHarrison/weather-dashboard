"use strict";

$(document).ready(function () {

    // constants
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

    // logging
    const log_level = 1;
    var log = function() { if (log_level > 0) { console.log.apply(this,arguments); }}
    
    // variables
    var searchHistory = JSON.parse(localStorage.getItem(LSKey)) ?? []; // null coalescing operator gives initial empty array

    // convert API units to MPH
    function windSpeedToDisplay(speed) {
        switch (apiUnit) {
            case units.default:
                const ratioMsToMph = 3600 / (1760 * 3 * 12) * (1000 / 25.4); // m/s > m/h = 3600 , 1760 yards in a mile, 3 ft in a yard, 12 inches in a foot, 1000/25.4 inches in a meter
                return (speed * ratioMsToMph).toFixed(1) + ' MPH';
                break;
            default:
                // any other units, not currently implemented
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
                // any other units, not currently implemented
                break;
        }
    }

    // render current weather card
    function renderCurrentWeather(location, data) {
        log('renderCurrentWeather:', location, data);
        const { main, main: { temp, temp_min: tmin, temp_max: tmax, humidity: hum }, wind: { deg: wd, speed: ws }, ...rest } = data;
        todayEl.empty();
        todayEl.append([
            $('<div>', { class: 'row' }).append([
                $('<div>', { class: 'col' }).append([
                    $('<div>', { class: 'card rounded border border-secondary' }).append([
                        $('<div>', { class: 'card-body' }).append([
                            $('<h2>', { 'class': 'card-title font-weight-bold', 'text': `${location} (${moment().format('DD/MM/YYYY')})` }).append([
                                $('<img>', { 'src': `http://openweathermap.org/img/w/${data.weather[0].icon}.png`, 'alt': data.weather[0].description }),
                                // $('<img>', { 'src': `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, 'alt': data.weather[0].description })
                            ]),
                            $('<h5>', { 'class': 'card-text', 'text': `Temp: ${tempToDisplay(temp)} (min: ${tempToDisplay(tmin)} max: ${tempToDisplay(tmax)})` }),
                            // $('<p>', { 'class': 'card-text h5', 'text': `Wind: ${windSpeedToDisplay(ws)} (direction ${wd} deg)` }),
                            $('<h5>', { 'class': 'card-text', 'text': `Wind: ${windSpeedToDisplay(ws)} ` }).append([$('<i>', { 'class': `wi wi-wind towards-${wd}-deg`, 'style': 'font-size: 2rem;' })]),
                            $('<h5>', { 'class': 'card-text', 'text': `Humidity: ${hum}%` })
                        ])
                    ])
                ])
            ])
        ]);
    }

    // render five day weather cards
    function renderFiveDayWeather(data) {
        log('renderFiveDayWeather:', data);
        forecastEl.empty();
        forecastEl.append(
            $('<div>', { 'class': 'col-12 pt-3' }).append(
                $('<h4>', { 'class': 'font-weight-bold', 'text': '5-Day Forecast:' })
            )
        );
        data.list.forEach(function (entry, index) {
            var timestamp = moment.unix(entry.dt).format('DD/MM/YYYY HH:MM:SS');
            //log(`timestamp : ${timestamp}`);
            if (moment.unix(entry.dt).hours() === FIVE_DAY_FORECAST_SELECTED_HOUR) {
                log(`using entry ${index}`, entry);
                const { main, main: { temp, humidity: hum }, wind: { deg: wd, speed: ws }, ...rest } = entry;
                forecastEl.append(
                    $('<div>', { class: 'col' }).append(
                        $('<div>', { class: 'card forecast' }).append(
                            $('<div>', { class: 'card-body' }).append([
                                $('<h4>', { 'class': 'card-title', 'text': `${moment.unix(entry.dt).format('DD/MM/YYYY')}` }),
                                $('<img>', { 'src': `http://openweathermap.org/img/w/${entry.weather[0].icon}.png`, 'alt': entry.weather[0].description }),
                                // $('<img>', { 'src': `http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`, 'alt': entry.weather[0].description }),
                                $('<p>', { 'class': 'card-text', 'text': `Temp: ${tempToDisplay(temp)}` }),
                                // $('<p>', { 'class': 'card-text', 'text': `Wind: ${windSpeedToDisplay(ws)} (direction ${wd} deg)` }),
                                $('<p>', { 'class': 'card-text', 'text': `Wind: ${windSpeedToDisplay(ws)} ` }).append([$('<i>', { 'class': `wi wi-wind towards-${wd}-deg`, 'style': 'font-size: 2rem;' })]),
                                $('<p>', { 'class': 'card-text', 'text': `Humidity: ${hum}%` })
                            ])
                        )
                    )
                );
            }
        })
    }

    async function getGeocodeFromLocation(location) {
        log('getGeocodeFromLocation', location);
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
                log('fetch data:', data);
                const [d, ...rest] = data; // destructure data[0] as d
                return { name: d.name, state: d.state, country: d.country, lat: d.lat, lon: d.lon };
            })
            .catch(function (error) {
                // catch any errors
                log(error);
            });
        log('response:', response);
        return response;
    }

    async function getCurrentWeatherForCoords(lat, lon) {
        log('getCurrentWeatherForCoords', lat, lon);
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
                log('fetch data:', data);
                return (data);
            })
            .catch(function (error) {
                // catch any errors
                log(error);
            });
        log('response:', response);
        return response;
    }

    async function getFiveDayThreeHourForecastForCoords(lat, lon) {
        log('getFiveDayThreeHourForecastForCoords', lat, lon);
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
                log('fetch data:', data);
                return (data);
            })
            .catch(function (error) {
                // catch any errors
                log(error);
            });
        log('response:', response);
        return response;
    }

    function displayWeatherForGeocode(geocode) {
        log('displayWeatherForGeocode', geocode);
        getCurrentWeatherForCoords(geocode.lat, geocode.lon)
            .then(function (weather) {
                let location = `${geocode.name},${geocode.state} (${geocode.country})`; // format location string
                renderCurrentWeather(location, weather);
            });
        getFiveDayThreeHourForecastForCoords(geocode.lat, geocode.lon)
            .then(function (weather) {
                renderFiveDayWeather(weather);
            });
    }

    searchButtonEl.on('click', function (event) {
        event.preventDefault(); // prevent default behaviour; retain input value for now
        let location = searchInputEl.val().trim();
        if (location) { // check location was entered
            getGeocodeFromLocation(location)
            .then(function (geocode) {
                if (typeof geocode === 'undefined') { // handle state that location wasn't found
                    log(`location ${location} not found`);
                }
                else {
                    if (!searchHistory.find(function(element) {
                         return (element.name === geocode.name
                            && element.state === geocode.state
                            && element.country === geocode.country);
                        })) { // only add if it isn't already in the history (match full location - city,state,country)
                        searchHistory.push(geocode);
                        localStorage.setItem(LSKey, JSON.stringify(searchHistory));
                        renderHistoryButton(geocode, searchHistory.length);
                    }
                    displayWeatherForGeocode(geocode);
                }
            });
        }
        searchInputEl.val(""); // clear element now
    })

    historyEl.on('click', '.list-group-item', function (event) {
        event.preventDefault();
        let entry = event.target;
        let geocode = JSON.parse(entry.getAttribute('data-geocode'));
        displayWeatherForGeocode(geocode);
    })

    function renderHistoryButton(geocode, index) {
        log('renderHistoryButton', geocode, index);
        historyEl.prepend($('<button>', {
            class: 'list-group-item',
            id: `btn${index}`,
            text: `${geocode.name} (${geocode.country})`, // use city and country for uniqueness
            'data-geocode': JSON.stringify(geocode)
        }));
    }

    function displayHistory() {
        historyEl.empty();
        searchHistory.forEach(function (entry, index) {
            renderHistoryButton(entry, index);
        })
    }

    function getWeather(location) {
        getGeocodeFromLocation(location)
            .then(function (geocode) {
                log(geocode);
                displayWeatherForGeocode(geocode);
            });
    }

    displayHistory();

});

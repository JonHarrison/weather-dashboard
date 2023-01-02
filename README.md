# Module 8 Server-Side APIs: Weather Dashboard

## Title

A weather dashboard that allows the user to view the current weather and the five day forecast for a location of their choice.

## User Story

```text
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```

## Acceptance Criteria

IT IS DONE

  * When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history
  * When a user views the current weather conditions for that city they are presented with:
    * The city name
    * The date
    * An icon representation of weather conditions
    * The temperature
    * The humidity
    * The wind speed
  * When a user view future weather conditions for that city they are presented with a 5-day forecast that displays:
    * The date
    * An icon representation of weather conditions
    * The temperature
    * The humidity
  * When a user click on a city in the search history they are again presented with current and future conditions for that city

## Tasks Completed

* Implemented the required solution in the browser featuring dynamically updated HTML and CSS powered by jQuery and OpenWeatherMap APIs
* Divided the implementation into multiple logical functions
* Uses localStorage to maintain the location history in a JSON serialised array
* Implemented the current weather and five day forecast using jQuery and Bootstrap cards
* Use OpenWeatherMap APIs for geocoding, current weather and five day forecast
* Use of Moment.js to convert Unix time and extract hour for five day forecast at midday
* Use of Erik Flowers' Weather Icons for wind direction icon

## Challenges / Things I learnt

* Use of async functions to return object from fetch
* Fetch query error handling
* GitHub doesn't like deploying page icons with _ in the filename, - is okay though

## Website image

![Weather dashboard](https://user-images.githubusercontent.com/1043077/209961446-1a49c2d7-bb40-4f6d-b435-d2b3f094c310.png)

## Technologies Used

- HTML
- CSS
- Javascript
- Bootstrap v4.3.1
- jQuery v3.2.1
- Moment.js v2.29.4
- Weather Icons by Erik Flowers v2.0.12 https://github.com/erikflowers/weather-icons

## Links

* [Link to the deployed website](https://jonharrison.github.io/weather-dashboard/)
* [Link to the code repository](https://github.com/JonHarrison/weather-dashboard)

## Contact

If you have any questions, please contact me at :

* GitHub profile : [JonHarrison](https://github.com/JonHarrison)
* Email : [******]()
* LinkedIn : [******]()

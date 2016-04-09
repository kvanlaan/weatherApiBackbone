//test log to console
console.log(Backbone)


//global variables
var date = new Date() //date variable to find day of the week
var today = date.getDay() //create today variable with getDay method

//object to designate day for daily view
var week = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
}


//---ChangeView function, changes the location.hash based on the clicked button's value, trigging the router//
var changeView = function(clickEvent) {
    var route = window.location.hash.substr(1),
        routeParts = route.split('/'),
        newView = routeParts[0]
    if (routeParts.length > 2) {
        var lat = routeParts[1],
            lng = routeParts[2],
            buttonEl = clickEvent.target,
            newView = buttonEl.value
        location.hash = newView + "/" + lat + "/" + lng
    }

    if (routeParts.length < 3) {
        var Search = routeParts[1]
        location.hash = newView + "/" + Search
        var buttonEl = clickEvent.target,
            newView = buttonEl.value
        location.hash = newView + "/" + Search
    }


}

//Skycons ---animated weather icons corresponding to icon provided by forecast.io//
//full code is provided in skycons.js//
var doSkyconStuff = function(iconString, iconNumber) {
    console.log(iconString)
    var formattedIcon = iconString.toUpperCase().replace(/-/g, "_")
    var skycons = new Skycons({ "color": "pink" });
    // on Android, a nasty hack is needed: {"resizeClear": true}

    //Adding the canvases which will be drawn to
    //the currentSky
    skycons.add("currentSky", Skycons[formattedIcon]);
    //adding all the Daily Sky Ids
    skycons.add("dailySky" + iconNumber, Skycons[formattedIcon]);
    //the hourlySky
    skycons.add("hourlySky", Skycons[formattedIcon]);
    // kicks off the animation
    skycons.play();
}

//handling the search input and changing the location.hash accordingly
var searchQuery = function(keyEvent) {
    var inputEl = keyEvent.target
    if (keyEvent.keyCode === 13) {
        var newCity = inputEl.value
        var cityContainer = document.querySelector(".cityContainer") //write the city name to the top of the page
        cityContainer.innerHTML = '<p>' + newCity + '</p>'
        location.hash = "current/" + newCity
        inputEl.value = ''
    }
}



// Models //

//General URL model//
var WeatherModel = Backbone.Model.extend({
    _generateURL: function(lat, lng) {
        this.url = "https://api.forecast.io/forecast/95dd0186251e48c64682d50d1e64004c/" + lat + "," + lng + "?callback=?"
    }
})

//SearchModel//
//uses url "https://maps.googleapis.com/maps/api/geocode/json?address=" to convert input city to lat,lng
var SearchModel = Backbone.Model.extend({
    _generateURL: function(Search) {
        this.url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + Search
    }
})


//--Current Location Views--//
//Daily View//
var DailyView = Backbone.View.extend({

    el: "#container",

    initialize: function(inputModel) {
        this.model = inputModel
        var boundRender = this._render.bind(this) //bind render to the current model
        this.model.on("sync", boundRender)
    },

    _render: function() {
        var dayArray = this.model.attributes.daily.data
        console.log(dayArray)
        var newHtmlString = ""

        for (var i = 0; i < dayArray.length - 1; i++) {
            if (today < 7) {
                today = today + 1
            } else { today = 1 } //reset today to beginning of the week 
            var day = dayArray[i]
            var iconString = day.icon
            console.log(iconString)
            newHtmlString += '<div class = "day">'
            newHtmlString += '<h1>' + week[today] + ' </h1> ' + day.apparentTemperatureMax.toPrecision(2) + '&deg; F'
            newHtmlString += '<canvas class="daily" id="dailySky' + i + '"width="100" height="100" data-icon="' + iconString + '"></canvas>'
            newHtmlString += '</div>'
        }

        this.el.innerHTML = newHtmlString //change innerHtml of container div//

        //skycons
        var dailyIcons = document.querySelectorAll('canvas.daily')
        for (var i = 0; i < dailyIcons.length; i++) {
            var iconStuff = dailyIcons[i].dataset.icon
            doSkyconStuff(iconStuff, i)
        }
    }
})

//Hourly View//
var HourlyView = Backbone.View.extend({
    el: "#container",

    initialize: function(inputModel) {
        this.model = inputModel
        var boundRender = this._render.bind(this)
        this.model.on("sync", boundRender)
    },

    _render: function() {
        var hourArray = this.model.attributes.hourly.data
        var newHtmlString = ''
        for (var i = 0; i < 24; i++) {
            var hour = hourArray[i]
            newHtmlString += '<div class = "hour">'
            newHtmlString += '<h1> Hour ' + (i + 1) + ' </h1> ' + hour.apparentTemperature.toPrecision(2) + '&deg;'
            newHtmlString += 'F </div>'
        }
        this.el.innerHTML = newHtmlString //change innerHtml of container div//
    }
})


//Current View//
var CurrentView = Backbone.View.extend({
    el: "#container",

    initialize: function(inputModel) {
        this.model = inputModel
        var boundRender = this._render.bind(this)
        this.model.on("sync", boundRender)
    },

    _render: function() {
        var htmlString = ''
        htmlString = '<div class="current">' + this.model.attributes.currently.temperature.toPrecision(2) + " &deg;F <h2> ~ " + this.model.attributes.currently.summary + "~ <canvas id='currentSky' width='100' height='100'></canvas> </h2></div>"
        this.el.innerHTML = htmlString //change innerHtml of container div//
        var icons = this.model.attributes.currently.icon
        doSkyconStuff(icons)
    }
})

//--Search Views--//
//current view//
var CurrentSearchView = Backbone.View.extend({
    initialize: function(someModel) {
        this.model = someModel
        var boundRender = this.render.bind(this)
        this.model.on("sync", boundRender)
    },
    render: function(data) {
        console.log(data.attributes.results[0].geometry.location)
        var lat = data.attributes.results[0].geometry.location.lat
        var lng = data.attributes.results[0].geometry.location.lng
        console.log(lat)
        console.log(lng)
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new CurrentView(wm)
        wm.fetch()
    }
})

//daily view//
var DailySearchView = Backbone.View.extend({
    initialize: function(someModel) {
        this.model = someModel
        var boundRender = this.render.bind(this)
        this.model.on("sync", boundRender)
    },
    render: function(data) {
        console.log(data.attributes.results[0].geometry.location)
        var lat = data.attributes.results[0].geometry.location.lat
        var lng = data.attributes.results[0].geometry.location.lng
        console.log(lat)
        console.log(lng)
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new DailyView(wm)
        wm.fetch()
    }
})
var HourlySearchView = Backbone.View.extend({
        initialize: function(someModel) {
            this.model = someModel
            var boundRender = this.render.bind(this)
            this.model.on("sync", boundRender)
        },
        render: function(data) {
            console.log(data.attributes.results[0].geometry.location)
            var lat = data.attributes.results[0].geometry.location.lat
            var lng = data.attributes.results[0].geometry.location.lng
            console.log(lat)
            console.log(lng)
            var wm = new WeatherModel()
            wm._generateURL(lat, lng)
            var cv = new HourlyView(wm)
            wm.fetch()
        }
    })
    //end of views//


//--Router--with Backbone extend//
var WeatherRouter = Backbone.Router.extend({
    routes: {
        "current/:searchQuery": "handleCurrentSearch",
        "daily/:searchQuery": "handleDailySearch",
        "hourly/:searchQuery": "handleHourlySearch",
        "current/:lat/:lng": "handleCurrentView",
        "daily/:lat/:lng": "handleDailyView",
        "hourly/:lat/:lng": "handleHourlyView",
        "*default": "handleDefault"
    },

    //get data for current weather using lat and lng as input
    handleCurrentView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new CurrentView(wm)
        wm.fetch()
    },
    //get data for 7-day forecast using lat and lng as input
    handleDailyView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new DailyView(wm)
        wm.fetch()


    },

    //Geolocation--when page is first loaded, will prompt the user for their location
    handleDefault: function() {
        var successCallback = function(positionObject) {
            var lat = positionObject.coords.latitude
            var lng = positionObject.coords.longitude
            location.hash = "current/" + lat + "/" + lng
        }
        var errorCallback = function(error) {
            console.log(error)
        }
        window.navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    },
    //get data for 24 hour forecast using lat and lng as input
    handleHourlyView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new HourlyView(wm)
        wm.fetch()
    },
    //get search data
    handleCurrentSearch: function(query) {
        var sm = new SearchModel()
        sm._generateURL(query)
        var cv = new CurrentSearchView(sm)
        sm.fetch()
    },
    //get daily search data
    handleDailySearch: function(query) {
        var sm = new SearchModel()
        sm._generateURL(query)
        var cv = new DailySearchView(sm)
        sm.fetch()
    },
    // get hourly search data
    handleHourlySearch: function(query) {
        var sm = new SearchModel()
        sm._generateURL(query)
        var cv = new HourlySearchView(sm)
        sm.fetch()
    },

    initialize: function() {
        Backbone.history.start()

    }
})


//query Selectors//
var container = document.querySelector("#container")
var buttonsContainer = document.querySelector("#buttons")
buttonsContainer.addEventListener('click', changeView)
var search = document.querySelector("input")
search.addEventListener('keydown', searchQuery)


//kick things off!
var rtr = new WeatherRouter()

console.log(Backbone)

//ChangeView------------------------------------------
var changeView = function(clickEvent) {
    var route = window.location.hash.substr(1),
        routeParts = route.split('/'),
        lat = routeParts[1],
        lng = routeParts[2]

    var buttonEl = clickEvent.target,
        newView = buttonEl.value
    location.hash = newView + "/" + lat + "/" + lng
}

//

var WeatherModel = Backbone.Model.extend({
    _generateURL: function(lat, lng) {
        this.url = "https://api.forecast.io/forecast/95dd0186251e48c64682d50d1e64004c/" + lat + "," + lng + "?callback=?"
    }
})

////Skycons

var doSkyconStuff = function(iconString) {

    console.log(iconString)
    var formattedIcon = iconString.toUpperCase().replace(/-/g, "_")

    var skycons = new Skycons({ "color": "pink" });
    // on Android, a nasty hack is needed: {"resizeClear": true}

    // you can add a canvas by it's ID...
    skycons.add("currentSky", Skycons[formattedIcon]);
    //adding all the Daily Sky Ids
    skycons.add("dailySky0", Skycons[formattedIcon]);
    skycons.add("dailySky1", Skycons[formattedIcon]);
    skycons.add("dailySky2", Skycons[formattedIcon]);
    skycons.add("dailySky3", Skycons[formattedIcon]);
    skycons.add("dailySky4", Skycons[formattedIcon]);
    skycons.add("dailySky5", Skycons[formattedIcon]);
    skycons.add("dailySky6", Skycons[formattedIcon]);
    skycons.add("dailySky7", Skycons[formattedIcon]);
    skycons.add("dailySky8", Skycons[formattedIcon]);

    skycons.add("hourlySky", Skycons[formattedIcon]);


    // start animation!
    skycons.play();
}


///


//Daily View-----------------------------------------
var DailyView = Backbone.View.extend({

    el: "#container",

    initialize: function(inputModel) {
        this.model = inputModel
        var boundRender = this._render.bind(this)
        this.model.on("sync", boundRender)
    },

    _render: function() {
        var dayArray = this.model.attributes.daily.data
        console.log(dayArray)
        var newHtmlString = ''

        for (var i = 0; i < dayArray.length; i++) {
            var day = dayArray[i]
            newHtmlString += '<div class = "day"> <h1> Day ' + (i + 1) + ' </h1> ' + day.apparentTemperatureMax + '&deg; F <canvas id="dailySky' + i + '"width="100" height="100"></canvas></div>'


        }
        this.el.innerHTML = newHtmlString
            ///Skyconstuff
        var icons = ""
        for (var i = 0; i < dayArray.length; i++) {
            icons = this.model.attributes.daily.icon
            doSkyconStuff(icons)

        }


    }
})

//Hourly View--------------------------------

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
            newHtmlString += '<div class = "hour"><h1> Hour ' + (i + 1) + ' </h1> ' + hour.apparentTemperature + '&deg; F </div>'
            var iconString = this.model.attributes.currently.icon
        }
        this.el.innerHTML = newHtmlString


    }

})


//Current View------------------------------
var CurrentView = Backbone.View.extend({
    el: "#container",

    initialize: function(inputModel) {
        this.model = inputModel
        var boundRender = this._render.bind(this)
        this.model.on("sync", boundRender)
    },

    _render: function() {
        var htmlString = ''
        htmlString = '<div class="current">' + this.model.attributes.currently.temperature + " &deg;F <h2> ~ " + this.model.attributes.currently.summary + "~ <canvas id='currentSky' width='100' height='100'></canvas> </h2></div>"
        this.el.innerHTML = htmlString
        var icons = this.model.attributes.currently.icon
        doSkyconStuff(icons)
    }
})


///----Router----with Backbone extend//

var WeatherRouter = Backbone.Router.extend({
    routes: {
        "current/:lat/:lng": "handleCurrentView",
        "daily/:lat/:lng": "handleDailyView",
        "hourly/:lat/:lng": "handleHourlyView",
        "*default": "handleDefault"
    },

//get current data
    handleCurrentView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new CurrentView(wm)
        wm.fetch()
    },
//get daily data
    handleDailyView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new DailyView(wm)
        wm.fetch()


    },
//geolocation
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
//get hourly data
    handleHourlyView: function(lat, lng) {
        var wm = new WeatherModel()
        wm._generateURL(lat, lng)
        var cv = new HourlyView(wm)
        wm.fetch()
    },

    initialize: function() {
        Backbone.history.start()

    }
})



//query Selectors//
var container = document.querySelector("#container")
var buttonsContainer = document.querySelector("#buttons")
buttonsContainer.addEventListener('click', changeView)


var rtr = new WeatherRouter()

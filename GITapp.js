"use strict";

function initMap() {
    const geocoder = new google.maps.Geocoder();
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    var slider = document.getElementById("slider");
    var selector = document.getElementById("selector");
    var SelectValue = document.getElementById("SelectValue");
    var latLngList = {};
    var markerPlaceList = {};
    var route = '';
    var markerList = [];
    // Calculate and display the distance between markers
  
    const CONFIGURATION = {
        "ctaTitle": "SUBMIT",
        "loading": "async",
        "mapOptions": {"center":{"lat":40.12150192260742,"lng":-100.45039367675781},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":true,"zoom":4,"zoomControl":true,"maxZoom":22,"mapId":""},
        "mapsApiKey": "API_KEY_HERE",
        "capabilities": {"addressAutocompleteControl":true,"mapDisplayControl":true,"ctaControl":true}
    };
    const componentForm = [
        'location',
        'locality',
        'administrative_area_level_1',
        'country',
        'postal_code',
    ];

    // Map
    const getFormInputElement = (component) => document.getElementById(component + '-input');
    const map = new google.maps.Map(document.getElementById("gmp-map"), {
        zoom: CONFIGURATION.mapOptions.zoom,
        center: { lat: 40.12150192260742, lng: -100.45039367675781 },
        mapTypeControl: false,
        fullscreenControl: CONFIGURATION.mapOptions.fullscreenControl,
        zoomControl: CONFIGURATION.mapOptions.zoomControl,
        streetViewControl: CONFIGURATION.mapOptions.streetViewControl,
        styles: {
          default: [],
          hide: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
          ],
        },
      hiding: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    directionsRenderer.setMap(map);
    // Start location
    const marker1 = new google.maps.Marker({map: map, draggable: false});
    const autocompleteInput = getFormInputElement('location');
    const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
        fields: ["address_components", "geometry", "name"],
        types: ["address"],
        componentRestrictions: { country: "us" }
    });
    autocomplete.addListener('place_changed', async function () {
        marker1.setVisible(false);
        const place = autocomplete.getPlace();
        if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert('No details available for input: \'' + place.name + '\'');
        return;
        }
        else {
          renderAddressStart(place);
          route = await calcRoute(directionsService, directionsRenderer);
        }
        //fillInAddressStart(place);
    });

    function renderAddressStart(place) {
        map.setCenter(place.geometry.location);
        marker1.setPosition(place.geometry.location);
        marker1.setVisible(true);
    }
    // End location
    const marker2 = new google.maps.Marker({map: map, draggable: false});
    const autocompleteEndInput = getFormInputElement('locationEnd');
    const autocompleteEnd = new google.maps.places.Autocomplete(autocompleteEndInput, {
        fields: ["address_components", "geometry", "name"],
        types: ["address"],
        componentRestrictions: { country: "us" }
    });

    autocompleteEnd.addListener('place_changed', async function () {
        marker2.setVisible(false);
        const place = autocompleteEnd.getPlace();
        if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert('No details available for input: \'' + place.name + '\'');
        return;
        }
        else {
          renderAddressEnd(place);
          route = await calcRoute(directionsService, directionsRenderer);
        }
      
        //fillInAddressEnd(place);
    });

    function renderAddressEnd(place) {
        map.setCenter(place.geometry.location);
        marker2.setPosition(place.geometry.location);
        marker2.setVisible(true);
    }
    async function testing() {
      var start = document.getElementById('location-input').value;
      var end = document.getElementById('locationEnd-input').value;
      const url = `https://.roadtripcreator.com//user`;
      //const url = `http://127.0.0.1:5000//user`;

      const data = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(latLngList),
      })
        .then((r) => {return r.json()});
      var counter = 1;
      console.log(data);
      for(var stop in data.data) {
        
        const stopLabel = document.getElementById(`stopLabel${counter}`);
        const lodging_Info = document.getElementById(`lodgingInfo${counter}`);
        const restaurantInfo = document.getElementById(`restInfo${counter}`); 
        const attractionInfo = document.getElementById(`attractInfo${counter}`);
        lodging_Info.innerHTML = "";
        restaurantInfo.innerHTML = "";
        attractionInfo.innerHTML = "";
        if(markerPlaceList[stop]) {
          stopLabel.innerHTML = `Stop ${counter}- ${markerPlaceList[stop]}`;
        }
        else {
          stopLabel.innerHTML = `Stop ${counter}- ${data.data[stop].location}`
        }

        if (data.data[stop].stop.lodging != null) {
          for(var lodging of Object.keys(data.data[stop].stop.lodging)){
          
            lodging_Info.innerHTML += `<a href="${data.data[stop].stop.lodging[lodging]["links"]}" target=”_blank”>${lodging}</a><br><br>`;
          }
        }
        else {
          lodging_Info.innerHTML = "No lodging found in this area.";
        }

        if (data.data[stop].stop.restaurants !=null) {
          for(var rest of Object.keys(data.data[stop].stop.restaurants)){
            restaurantInfo.innerHTML += `<a href="${data.data[stop].stop.restaurants[rest]["links"]}" target=”_blank”>${rest}</a> <br><br>`;
          }
        }
        else {
          restaurantInfo.innerHTML = "No restaurants found in this area.";
        }
        
        if (data.data[stop].stop.attractions != null) {
          for(var attract of Object.keys(data.data[stop].stop.attractions)) {

            attractionInfo.innerHTML += `<a href="${data.data[stop].stop.attractions[attract]["links"]}" target=”_blank”>${attract}</a> <br><br>`;
          }
        }
        else {
          attractionInfo.innerHTML = "No attractions found in this area.";
        }
        
        counter+=1;
      }

      document.getElementById('loading').style.visibility = "hidden";
      clearTimeout(timeout);
    }

    function result1() {
      document.getElementById('loading').style.visibility = "hidden";
      document.getElementById('alertPop').style.visibility = "visible";
    }

    let timeout;
    function result2() {
      timeout = setTimeout(result1, 60000);
    }
    
    async function SubmitBtn() {
      var rec = document.getElementById("RecList");
      rec.innerHTML = "";
      document.getElementById('alertPop').style.visibility = "hidden";
      document.getElementById('loading').style.visibility = "visible";
      result2();
      latLngList = {};
      var stops = route.routes[0].overview_path.length/(parseInt(slider.value)+1);
      var num = stops;

      for (var item in markerList) {
        markerList[item].setMap(null);
      }
      for (var i = 1; i <= slider.value; i++) {
        const stopMarkers = new google.maps.Marker({map: map, draggable: false, label: {text: (i).toString(), color: "white"}});
        stopMarkers.setPosition(route.routes[0].overview_path[num|0]);
        const latlngString = route.routes[0].overview_path[num|0].toString();
        const latLngSplit = latlngString.replace("(","").replace(")","").split(",");
        
        const latlng = {
          lat: parseFloat(latLngSplit[0]),
          lng: parseFloat(latLngSplit[1]),
        };
       await geocoder
        .geocode({ location: latlng })
        .then((response) => {
          for(const res in response.results) {
            if(response.results[res].plus_code) {
              if("compound_code" in response.results[res].plus_code) {
                const splitCity = response.results[res].plus_code.compound_code.split(" ");
                splitCity.shift();
                const city = splitCity.join(" ");
                
                markerPlaceList["stop" + (i)] = city;
              }
            }
        }
        });                           
        stopMarkers.setVisible(true);
        markerList.push(stopMarkers);
        latLngList["stop" + (i + 1)] = String(route.routes[0].overview_path[num|0]);
        num += stops;
      }
      for (var i = 1; i <= slider.value; i++) {
        rec.innerHTML += `<li>
          <input type= "checkbox" name = "accordion" id = "stop${i}">
          <label id="stopLabel${i}" for="stop${i}">Stop ${i}</label>
          <div class = "information">
            <ul class = "info" id = "recommnedation${i}">
              <li class = "tinyBox">
              <input type= "checkbox" name = "info" id = "Lodging${i}">
              <label for="Lodging${i}">Lodging</label>
              <div class = "information">
                  <p id="lodgingInfo${i}">Sorry, something went wrong.</p>
              </div>
              </li>
              <li class = "tinyBox">
              <input type= "checkbox" name = "info" id = "Resturants${i}">
              <label for="Resturants${i}">Restaurants</label>
              <div class = "information">
                  <p id="restInfo${i}">Sorry, something went wrong.</p>
              </div>
              </li>
              <li class = "tinyBox">
              <input type= "checkbox" name = "info" id = "Attractions${i}">
              <label for="Attractions${i}">Attractions</label>
              <div class = "information">
                  <p id="attractInfo${i}">Sorry, something went wrong.</p>
              </div>
              </li>
            </ul>
          </div>
        </li>`
      }
    }

    function recTab(event) {
      const tabs = document.querySelectorAll('.tab_btn');
      
      const all_content= document.querySelectorAll('.content');

      tabs.forEach((tab, index)=> {

        tabs.forEach(tab=>{tab.classList.remove('active')});
        tab.classList.add('active');

        // var line= document.querySelector('.line');
        // line.style.width = event.target.offsetWidth + "px";
        // line.style.left = event.target.offsetLeft + "px";

        all_content.forEach(content=>{content.classList.remove('active')})
        all_content[index].classList.add('active');
      })
    }

    async function logSubmit(event) {
      event.preventDefault();
      text.style.display='none';
      await SubmitBtn();
      await testing();
      recTab(event);
    }
    var text = document.getElementById("header");
    const form = document.getElementById("form");
    form.addEventListener("submit", logSubmit);
    
    var currentInfoWin = null;
    async function calcRoute(directionsService, directionsRenderer) {
      var start = document.getElementById('location-input').value;
      var end = document.getElementById('locationEnd-input').value;
      var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
      }
      for (var item in markerList) {
        markerList[item].setMap(null);
      }
      var route = await directionsService.route(request, function(result, status) {
        if (status == 'OK'); {
          directionsRenderer.setDirections(result);
          var directionsData = result.routes[0].legs[0];
          
          var center_point = result.routes[0].overview_path.length/2;
          var infowindow = new google.maps.InfoWindow();
          infowindow.setContent(`<div style = "color: black"> ${result.routes[0].legs[0].duration.text}<br><center>${result.routes[0].legs[0].distance.text}</center></div>`);
          infowindow.setPosition(result.routes[0].overview_path[center_point|0]);
          if (currentInfoWin) {
            currentInfoWin.close();
          }
          infowindow.open(map);
          currentInfoWin = infowindow;
          return result;
        }
      });
      return route;
    }
}
/* 
var number = document.getElementById("number")
number.addEventListener(slider, numberOfStops)*/

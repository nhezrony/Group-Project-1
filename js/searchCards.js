var airports = {};
var respAirports = {}

function dataBaseSetup() {
    var config = {
        apiKey: "AIzaSyCaBbxHqXrTLz2fGKLGqQoLplQY4LgdtmQ",
        authDomain: "flight-tracker-2018.firebaseapp.com",
        databaseURL: "https://flight-tracker-2018.firebaseio.com",
        projectId: "flight-tracker-2018",
        storageBucket: "flight-tracker-2018.appspot.com",
        messagingSenderId: "594780032348"
    };

    firebase.initializeApp(config);
    var database = firebase.database();

    var airportsRef = database.ref('airports')
    airportsRef.on('value', gotAirportData, error)

    function gotAirportData(data) {
        respAirports = data.val().airports;
        for (airport in respAirports) {
            if (respAirports[airport].classification == 1 || respAirports[airport].classification == 2 || respAirports[airport].classification == 3) {
                airports[`${respAirports[airport].name}`] =
                    `http://www.countryflags.io/${respAirports[airport].countryCode}/flat/64.png`
            }
        }
    }

    function error(error) {
        console.log('Error!')
    }
    return airports
}

function initializeButtons() {
    // initialize the date picker
    $('#SBRDate').datepicker({
        defaultDate: 'date',
        format: 'dd mmm yyyy'
    });
    $('#SBRDate').on('change', function () {
        userInput['date'] = moment($(this).val()).format('YYYY/MM/DD');
        console.log(userInput)
    });
    // initialize the autocomplete for the departure airport
    $("#SBRDepartureAirport").on('click', function () {
        $('input.departureAirport-autocomplete').autocomplete({
            data: airports
        });
    });
    $('.departureAirport-autocomplete').on('change', function () {
        for (airport in respAirports) {
            if (respAirports[airport].name === $(this).val()) {
                userInput['departureAirportCode'] = respAirports[airport].fs
            }
        }
        console.log(userInput)
    })
    // initialize the autocomplete for the arival airport
    $("#SBRArivalAirport").on('click', function () {
        $('input.arivalAirport-autocomplete').autocomplete({
            data: airports
        });
    });
    $('.arivalAirport-autocomplete').on('change', function () {
        for (airport in respAirports) {
            if (respAirports[airport].name === $(this).val()) {
                userInput['arivalAirportCode'] = respAirports[airport].fs
            }
        }
        console.log(userInput)
    })
    // initialize the search button
    $('#SBRBtn').on('click', function () {
        getFlightByRoute(userInput)
    });
}




function getFlightByRoute(userInput) {
    var queryURL =
        `https://api.flightstats.com/flex/schedules/rest/v1/json/from/${userInput.departureAirportCode}/to/${userInput.arivalAirportCode}/arriving/${userInput.date}?appId=e1696e2b&appKey=f99f0637eebb7f44ead254e9fc6e8cd6`
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        displayFlight(response.scheduledFlights, response.appendix.airlines, response.appendix.airports[0])
    })
}

function displayFlight(scheduledFlights, airlines, airport) {
    $('#searchByRouteContainer').hide()
    console.log(airport.longitude)
    console.log(airport.latitude)

    function getCarrier(airlineFsCode) {
        for (airline in airlines) {
            if (airlineFsCode == airlines[airline].fs) {
                return airlines[airline].name
            }
        }
    }

    function renderCard(flight) {
        var $container = $("<div>", {
            class: "container grey lighten-3",
        });
        var $col = $("<div>", {
            class: "col s12",
        });
        var $card_horizontal = $("<div>", {
            class: "card horizontal",
        });
        var $card_image = $("<div>", {
            class: "card-image",
        });
        var $img = $("<img>", {
            id: 'carrierImg',
            src: `http://pics.avs.io/100/190/${flight.carrierFsCode}.png`,
        });
        var $card_stacked = $("<div>", {
            class: 'cardStacked',
        });
        var $carrierImg = $("<div>", {
            class: "card-stacked",
        });
        var $card_content = $("<div>", {
            class: "card-content",
        });
        var $row_1 = $("<div>", {
            class: "row",
        });
        var $flightNumber = $("<div>", {
            class: "col s4",
            id: "flightNumber",
            text: `Flight Number: ${flight.flightNumber}`
        });
        var $departureTime = $("<div>", {
            class: "col s4",
            id: "departureTime",
            text: `Departure Time: ${moment(flight.departureTime).format('HH:mm A')}`
        });
        var $arivalTerminal = $("<div>", {
            class: "col s4",
            id: "arivalTerminal",
            text: `Arival Terminal: ${flight.arrivalTerminal}`
        });
        var $row_2 = $("<div>", {
            class: "row",
        });
        var $flightCarrier = $("<div>", {
            class: "col s4",
            id: "flightCarrier",
            text: `Flight Carrier: ${getCarrier(flight.carrierFsCode)}`
        });
        var $arivalTime = $("<div>", {
            class: "col s4",
            id: "arivalTime",
            text: `Arival Time: ${moment(flight.arrivalTime).format('HH:mm A')}`
        });
        var $delays = $("<div>", {
            class: "col s4",
            id: "delays",
            text: 'Delays: None'
        });
        var $card_action = $("<div>", {
            class: "col s4",
            id: "cardAction",
        });
        var $selectBtn = $("<a>", {
            class: 'grey lighten-1 btn-small',
            text: 'Get Directions For This Flight'
        }).attr('onClick', `directions(${airport.latitude}, ${airport.longitude})`);
        $row_1.append($flightNumber, $departureTime, $arivalTerminal);
        $row_2.append($flightCarrier, $arivalTime, $delays);
        $('.scheduledFlights').append($container.append($col.append($card_horizontal.append($card_image.append($img), $card_stacked.append($card_content.append($row_1, $row_2, $card_action.append($selectBtn)))))))
    }


    if (scheduledFlights.length > 0) {
        for (flight in scheduledFlights) {
            renderCard(scheduledFlights[flight]);
        }
    } else {
        var $noFlightsFound = $("<div>", {
            class: "NoFlightsFound",
        });
        var $h4 = $("<h4>", {
            text: "Sorry No Flights Found",
            style: 'text-align: center;'
        });

        $('.scheduledFlights').append($noFlightsFound.append($h4));
    }
}


$(document).ready(function () {
    dataBaseSetup()
});
initializeButtons()





function directions(lat, long) {
    $('.scheduledFlights').hide()
    var $container = $("<div>", {
        class: "container",
    });

    var $input_field = $('<div>', {
        class: 'input-field col s6',
    })
    var $input = $('<input>', {
        placeholder: "Location From which You Wish to Leave",
        id: 'pac-input',
        type: "text",
        class: "validate",
    })

    // <input id="pac-input" type="text" placeholder="Enter a location">

    $('body').append($container.append($input_field.append($input)))

    initMap()

    userLocation = {
        lat: 51.7519,
        lng: -1.2578
    }
    airportLocation = {
        lat: 50.8429,
        lng: -0.1313
    }
    getMap(userLocation, airportLocation);

}

var userAddress = {};

function initMap() {
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(
        ['geometry']);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);


    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            alert(`No details available for input`);
            return;
        } else if (place.geometry) {
            userAddress['lat'] = place.geometry.viewport.b.b
            userAddress['lng'] = place.geometry.viewport.f.f
        }
    });
}

function getMap(userLocation) {
    var pointA = new google.maps.LatLng(userLocation.lat, userLocation.lng),
        pointB = new google.maps.LatLng(airportLocation.lat, airportLocation.lng),
        myOptions = {
            zoom: 7,
            center: pointA
        },
        map = new google.maps.Map(document.getElementById('map-canvas'), myOptions),
        // Instantiate a directions service.
        directionsService = new google.maps.DirectionsService,
        directionsDisplay = new google.maps.DirectionsRenderer({
            map: map
        }),
        markerA = new google.maps.Marker({
            position: pointA,
            title: "point A",
            label: "A",
            map: map
        }),
        markerB = new google.maps.Marker({
            position: pointB,
            title: "point B",
            label: "B",
            map: map
        });

    // get route from A to B
    calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);

}
// getMap()



function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
    directionsService.route({
        origin: pointA,
        destination: pointB,
        avoidTolls: true,
        avoidHighways: false,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}





var userInput = {};
var scheduledFlights = {};
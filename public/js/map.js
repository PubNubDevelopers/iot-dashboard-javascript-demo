const GOOGLE_MAP_KEY = "AIzaSyBCgXgeJdrT-4A84hwbZJTtLQ0A1CiFcDw";
var map = null;

var initialize = function() {
    var myLatlng = new google.maps.LatLng(37.7749,-122.4194);
    map  = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 5,
        center: myLatlng
    });
    //bounds  = new google.maps.LatLngBounds();
    
/*
    const iconBase =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
    marker = new google.maps.Marker({
        map,
        custom_id: '123',
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: { lat: 37.7749, lng: -122.4194 },
        icon: iconBase + 'parking_lot_maps.png',
      });
      marker.addListener("click", toggleBounce);
    }
*/
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
          console.log(marker.custom_id);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
  }
      
  function focusOnMarker(deviceId)
  {
    map.setZoom(10);
    map.setCenter(iotDevices[deviceId].marker.getPosition());
    populateSelectedDeviceTable(deviceId);
  }

  function moveMapMarker(deviceId, populateSelectedDeviceTable)
      {
          const iconBase =
          "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
          var theAnimation = null;
          if (iotDevices[deviceId].marker == null)    
            theAnimation = google.maps.Animation.DROP

          //  todo - efficiencies here... don't create a new marker if the position hasn't changed.  Don't create a new object every time?
          if (iotDevices[deviceId].marker == null)
          {
            iotDevices[deviceId].marker = new google.maps.Marker({
              map,
              custom_id: '123',
              draggable: false,
              animation: theAnimation,
              position: { lat: iotDevices[deviceId].lat, lng: iotDevices[deviceId].long }
            });
            iotDevices[deviceId].marker.addListener("click", () => {
              map.setZoom(10);
              map.setCenter(iotDevices[deviceId].marker.getPosition());
              populateSelectedDeviceTable(deviceId);
            });
          }
          else
          {
            //  Move the existing marker
            iotDevices[deviceId].marker.setPosition(
              { lat: iotDevices[deviceId].lat, lng: iotDevices[deviceId].long }
            );
            //map.setCenter(iotDevices[deviceId].marker.getPosition());
          }


/*
            console.log(iotDevices[deviceId].lat);
            const iconBase =
            "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
                marker = new google.maps.Marker({
                map,
                custom_id: '123',
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: { lat: iotDevices[deviceId].lat, lng: iotDevices[deviceId].long }
              });
*/  
          }
   
window.initialize = initialize;
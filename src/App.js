import React, { Component } from 'react';
import './App.css';
//import SightList from './SightList'
import Sights from './Sights.json'

let markers = [];
let marker = "";
let infowindows = [];
let map = "";

class App extends Component {
  constructor (props){
    super (props);
    this.state = {
      //alllocations:[],
      map:"",
      marker:""
    }
    this.drawMap = this.drawMap.bind(this)
    this.generateMarkers = this.generateMarkers.bind(this)
  }


  componentDidMount() {

    window.drawMap = this.drawMap;
    // Asynchronously load the Google Maps script, passing in the callback reference
    loadJS(
      "https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyCvh4MPgNXk8lsld9nOxy-LVLY2JK3I0Ac&callback=drawMap"
    );
  }


  drawMap() {
    let sofia = new window.google.maps.LatLng(42.697708,23.321868)

    map = new window.google.maps.Map(document.getElementById('map'), {
      center: sofia,
      zoom: 14,
      mapTypeId: 'roadmap'
    })


    this.setState({ map: map })
    this.generateMarkers(map);
    }

  generateMarkers(map) {

    let self = this;

    const largeInfowindow = new window.google.maps.InfoWindow({});
    // Style the markers a bit. This will be our listing marker icon.
    let defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    let highlightedIcon = makeMarkerIcon('FFFF24');

    for (let i = 0; i < Sights.length; i++) {
      // Get the position from the location array.
      let position = Sights[i].location;
      let title = Sights[i].name;
      let id = Sights[i].id
      // Create a marker per location, and put into markers array.
      let marker = new window.google.maps.Marker({
        map: map,
        position: position,
        title: title,
        icon: defaultIcon,
        animation: window.google.maps.Animation.DROP,
        id: id
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      this.setState({map,marker})
    }


    /*function hideMarkers(markers) {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }*/

    function makeMarkerIcon(markerColor) {
        let markerImage = new window.google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new window.google.maps.Size(21, 34),
          new window.google.maps.Point(0, 0),
          new window.google.maps.Point(10, 34),
          new window.google.maps.Size(21,34));
        return markerImage;
      }

      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);
          });
          var streetViewService = new window.google.maps.StreetViewService();
          var radius = 35;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == window.google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = window.google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new window.google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }
  }


  render(){
    return (
      <div className='App' role='main'>
        <section className="right-column" >
          <header className="header" aria-label="Application Header">
            <h1>Popular Sights in Sofia, Bulgaria</h1>
          </header>
        </section>
        <section ref="map" className="map" id="map" role="application"></section>
        <div className="sidebar">
          <h3>Search sights in Sofia...</h3>
          {/*<SightList
          key="100"
            alllocations={this.state.alllocations}
            openInfoWindow={this.openInfoWindow}
            closeInfoWindow={this.closeInfoWindow}
          />*/}
        </div>
      </div>
    );
  }
}

export default App

//this appends the map API to the dom
function loadJS(src) {
  let ref = window.document.getElementsByTagName("script")[0];
  let script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  script.onerror = function () {
      document.write("Google Maps can't be loaded");
  };
  ref.parentNode.insertBefore(script, ref);
}

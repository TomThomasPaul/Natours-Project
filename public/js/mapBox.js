 console.log("This is client side js");
 const locations = JSON.parse(document.getElementById('map').dataset.locations);
 console.log(locations);
 mapboxgl.accessToken = 'pk.eyJ1IjoidG9tdGhvbWFzcGF1bCIsImEiOiJja29haDdvbGcyZDlxMnJvaTByNGl6YmwyIn0.xhSDsI2J2MxHWlz_PJ8l5Q';
let map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/tomthomaspaul/ckoahlao805ez17qhxlyh12er',
scrollZoom : false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc=>{
//create marker for each location
const el = document.createElement('div');
el.className='marker';

//Add marker
new mapboxgl.Marker({

element : el,
anchor: 'bottom'

}).setLngLat(loc.coordinates).addTo(map);

//add popup

new mapboxgl.Popup({
    offset : 30
})
.setLngLat(loc.coordinates)
.setHTML(`<P>Day ${loc.day}: ${loc.description}</p>`)
.addTo(map);

//extend  map bounds to include current locations
bounds.extend(loc.coordinates);

});

map.fitBounds(bounds, {
padding:{
top :200,
bottom: 150,
left :100,
right: 100


}


});
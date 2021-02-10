      function addMarkers(map, places){
        map.markers = [];
        places.forEach( place => {
          addMarker(map, place);
        });
      }

      function addMarker(map, place){
        const marker = new mapboxgl.Marker({
          properties: { title: 'foo' }
}).setLngLat([place.lng*1, place.lat*1]);
        marker.id = place.id;
        marker.addTo(map);
        map.markers.push(marker);
      }

      function setBounds(map, places){
        const bounds = new mapboxgl.LngLatBounds();
        places.forEach( place => {
          const { lat, lng } = place;
          bounds.extend([lng* 1, lat * 1]);
        });
        if(places.length){
          map.fitBounds(bounds);
        }
      }

function removeMarker(map, place){
            const marker = this.map.markers.find( marker => marker.id === place.id);
            marker.remove();
            this.map.markers = this.map.markers.filter(m => m !== marker);
}

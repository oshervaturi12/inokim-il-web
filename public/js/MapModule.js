

import axios from "axios";
const S3PATH='https://d3kxrpm9y5cv3a.cloudfront.net'

class InokimMap {
  constructor(mapElementId, apiEndpoint, mapInfoId) {
    this.mapElementId = mapElementId;
    this.apiEndpoint = apiEndpoint;
    this.mapInfoElement = document.getElementById('mapInfo');
    this.mapInfoContent = document.getElementById("mapInfoContent");
    this.mapInfoCloseButton = document.getElementById("mapInfoClose");

    this.teslaMapStyle = [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#f2f2f2" }],
      },
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#333333" }],
      },
      {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#cccccc" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#b3b3b3" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e2e2e2" }],
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
    ];

    // Attach close event listener to the info window close button
    if (this.mapInfoCloseButton) {
      this.mapInfoCloseButton.addEventListener("click", () => this.hideInfoWindow());
    }
  }

  // async initMap() {
  //   try {
  //     const map = new google.maps.Map(document.getElementById(this.mapElementId), {
  //       center: { lat: 31.5, lng: 34.8 }, // Centered in Israel
  //       zoom: 8,
  //       styles: this.teslaMapStyle,
  //       disableDefaultUI: true,
  //       zoomControl: true,
  //     });

  //     // Fetch locations from the API
  //     const locations = await this.fetchLocations();


  //     if (locations.length > 0) {
  //       locations.forEach((location) => {
  //         const markerIcon = {
  //           url: `${S3PATH}/optimized/marker.svg`,
  //           scaledSize: new google.maps.Size(30, 30),
  //         };

  //         this.addMarker(map, location, markerIcon);
  //       });

  //       // Center the map to the first location dynamically
  //       map.setCenter({ lat: locations[0].coordinates.lat, lng: locations[0].coordinates.lng });
  //     }
  //   } catch (error) {
  //     console.error("❌ Error initializing the map:", error);
  //   }
  // }

  // async fetchLocations() {
  //   try {
  //     const response = await axios.get('/api/v1/location');
  //     console.log(response.data.data.data)
  //     return response.data.data.data; // Ensure API returns an array of location objects
  //   } catch (error) {
  //     console.error("❌ Error fetching locations:", error);
  //     return [];
  //   }
  // }
//   async fetchLocations() {
//     try {
//         const response = await axios.get('/api/v1/location');
//         const allLocations = response.data.data.data;
        
//         // Filter locations to include only those with type "חנות אינוקים"
//         // const filteredLocations = allLocations.filter(location => location.type === "חנות אינוקים");
//         const filteredLocations = allLocations.filter(location =>
//           ["חנות אינוקים", "ללא מעמ"].includes(location.type)
//         );

//         // console.log(filteredLocations);
//         return filteredLocations;
//     } catch (error) {
//         console.error("❌ Error fetching locations:", error);
//         return [];
//     }
// }

// async initMap() {
//   try {
//     this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
//       center: { lat: 31.5, lng: 34.8 },
//       zoom: 8,
//       styles: this.teslaMapStyle,
//       disableDefaultUI: true,
//       zoomControl: true,
//     });

//     this.markers = [];

//     // initial load
//     // const locations = await this.fetchLocations();
//     const locations = await this.fetchLocations(["חנות אינוקים", "ללא מעמ"]);
//     this.renderMarkers(locations);

//     // setup filter buttons
//     document.querySelectorAll(".filter").forEach(btn => {
//       btn.addEventListener("click", async () => {
//         const typeId = btn.getAttribute("data-type");

//         this.activeType = typeId === "1" ? "חנות אינוקים"
//                           : typeId === "2" ? "ללא מעמ"
//                           : null;

//         const filtered = await this.fetchLocations(this.activeType);
//         this.clearMarkers();
//         this.renderMarkers(filtered);
//       });
//     });
//   } catch (error) {
//     console.error("❌ Error initializing the map:", error);
//   }
// }

async initMap() {
  try {
    this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
      center: { lat: 31.5, lng: 34.8 },
      zoom: 8,
      styles: this.teslaMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
    });

    this.markers = [];

    // initial load
    const locations = await this.fetchLocations(["חנות אינוקים", "ללא מעמ", "מפיץ"]);
    this.renderMarkers(locations);

    // 👇 Center on "סניף הבורסה" if exists
    const bursa = locations.find(loc => loc.name === "סניף הבורסה");
    if (bursa) {
      this.map.setCenter({
        lat: bursa.coordinates.lat,
        lng: bursa.coordinates.lng
      });
      this.map.setZoom(13); 
    }

    // setup filter buttons
    document.querySelectorAll(".filter").forEach(btn => {
      btn.addEventListener("click", async () => {
        const typeId = btn.getAttribute("data-type");

        this.activeType = typeId === "1" ? "חנות אינוקים"
                          : typeId === "2" ? "ללא מעמ"
                          : null;

        const filtered = await this.fetchLocations(this.activeType);
        this.clearMarkers();
        this.renderMarkers(filtered);
      });
    });
  } catch (error) {
    console.error("❌ Error initializing the map:", error);
  }
}


renderMarkers(locations) {
  if (!this.map) return;

  locations.forEach(location => {
    const markerIcon = {
      url: location.type === "חנות אינוקים" 
        ? `${S3PATH}/optimized/inokim-shop.svg`
        : `${S3PATH}/optimized/marker.svg`,
      scaledSize: new google.maps.Size(30, 30),
    };

    const marker = new google.maps.Marker({
      position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
      map: this.map,
      icon: markerIcon,
      title: location.name,
    });

    marker.addListener("click", () => {
      this.showInfoWindow(location);
    });

    this.markers.push(marker);
  });

  if (locations.length > 0) {
    this.map.setCenter({
      lat: locations[0].coordinates.lat,
      lng: locations[0].coordinates.lng,
    });
  }
}



// async fetchLocations(typeFilter = null) {
//   try {
//     const response = await axios.get('/api/v1/location');
//     const allLocations = response.data.data.data;

//     if (!typeFilter) return allLocations;

//     return allLocations.filter(location => location.type === typeFilter);
//   } catch (error) {
//     console.error("❌ Error fetching locations:", error);
//     return [];
//   }
// }

async fetchLocations(typeFilter = null) {
  try {
    const response = await axios.get('/api/v1/location');
    const allLocations = response.data.data.data;

    if (!typeFilter) return allLocations;

    if (Array.isArray(typeFilter)) {
      return allLocations.filter(location => typeFilter.includes(location.type));
    }

    return allLocations.filter(location => location.type === typeFilter);
  } catch (error) {
    console.error("❌ Error fetching locations:", error);
    return [];
  }
}

clearMarkers() {
  if (this.markers && this.markers.length > 0) {
    this.markers.forEach(marker => marker.setMap(null));
  }
  this.markers = [];
}

  addMarker(map, location, icon) {
    // const marker = new google.maps.Marker({
    //   position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
    //   map,
    //   icon,
    //   title: location.name,
    // });
    const markerIcon = {
      url: location.type === "חנות אינוקים" ? `${S3PATH}/optimized/inokim-shop.svg` : `${S3PATH}/optimized/marker.svg`,
      scaledSize: new google.maps.Size(30, 30),
    };
    const marker = new google.maps.Marker({
      position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
      map,
      icon: markerIcon,
      title: location.name,
    });

    // Attach click event listener to the marker
    marker.addListener("click", () => {
      console.log('click')
      this.showInfoWindow(location);
    });
  }

  showInfoWindow(location) {
    if (!this.mapInfoElement || !this.mapInfoContent) return;

    // Update the #mapInfo window content dynamically
    this.mapInfoContent.innerHTML = `
      <h2 class="border-bottom">
        ${location.name} <small>(${location.type})</small>
      </h2>



      <div class="py-3 main-content border-bottom d-flex justify-content-between">


      <div>
       ${location.address}
      </div>

        <div>

       <a href="https://waze.com/ul?ll=${location.coordinates.lat},${location.coordinates.lng}&navigate=yes" 
         target="_blank">
        <svg class="tds-icon tds-icon-directions-filled tds-icon--default" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10m2.53-14.53 2.75 2.75a.75.75 0 0 1 0 1.06l-2.75 2.75a.75.75 0 1 1-1.06-1.06l1.47-1.47h-4.19A1.75 1.75 0 0 0 9 13.25v3a.75.75 0 0 1-1.5 0v-3A3.25 3.25 0 0 1 10.75 10h4.19l-1.47-1.47a.75.75 0 0 1 1.06-1.06"></path></svg>
        </a>
        
        </div>

      </div>

      <div class="py-3 border-bottom">
    
       <h2>פרטי החנות</h2>
      <div class="info">
        <strong>טלפון:</strong> <a href="tel:${location.contact.phone}">${location.contact.phone}</a>
      </div>

      ${location.contact.email ? `   <div class="info">
          <strong>אימייל:</strong> <a href="mailto:${location.contact.email}">${location.contact.email}</a>
        </div>` : ""}
  
     
        ${location.link ? `   <div class="info">
        <a href="${location.link}" target="_blank"> פרטים נוספים</a>
      </div>` : ""}

   

        </div>




       <div class="working-hours py-3">
          <h2>שעות פעילות</h2>
          <div class="d-flex justify-content-between">
          <div>ראשון-חמישי</div>
              <div>  ${location.workingHours.sunday?.open} - ${location.workingHours.sunday?.close}  </div>
          </div>

              <div class="d-flex justify-content-between">
          <div>שישי</div>
              <div>  ${location.workingHours.friday?.open} - ${location.workingHours.friday?.close}  </div>
          </div>

                <div class="d-flex justify-content-between">
             <div>שבת</div>
             ${location.workingHours.saturday?.open && location.workingHours.saturday?.close
              ? `<div>${location.workingHours.saturday.open} - ${location.workingHours.saturday.close}</div>`
              : ''}
               </div>
            </div>
       </div>
       ${location.type === "חנות אינוקים" ? `<a href="/test-ride?location="${location.name}" class="btn btn-primary w-100">תאם נסיעת מבחן</a>` : ""}

    `;

    // Show map info box
    this.mapInfoElement.classList.remove("hidden");
    this.mapInfoElement.classList.add("show");
  }

  hideInfoWindow() {
    if (this.mapInfoElement) {
      this.mapInfoElement.classList.remove("show");
      this.mapInfoElement.classList.add("hidden");
    }
  }
}

// Export the class as default
export default InokimMap;

// Define the global function for Google Maps callback
window.initMap = () => {
  const mapInstance = new InokimMap("map", "/api/locations", "mapInfo"); // Pass the ID of the map info container
  mapInstance.initMap();
};

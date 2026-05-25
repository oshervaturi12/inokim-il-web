// ./features/initMap.js
export default async function initMap() {
    const { default: InokimMap } = await import(/* webpackChunkName: "MapModule" */ "../MapModule");
    window.initMap = () => {
      new InokimMap("map").initMap();
    };
  
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBT1FSXV3sbNLMtKErkU8CPVW2g14_2is0&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
  }
  
const apiKey = "AIzaSyBeawM8HzUy5PhrWyAjdWueZtuUtmhT9E4";
const googleMapApi = {
  async getLocation(latitude, longitude) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
      );
      const data = await response.json();
      const addressComponents = data.results[0].address_components;
      let city, country;
      for (const component of addressComponents) {
        if (component.types.includes("administrative_area_level_1")) {
          city = component?.long_name;
        }
        if (component.types.includes("country")) {
          country = component?.long_name;
        }
      }
      console.log({ city, country });
      return { city, country };
    } catch {
      (error) => {
        console.error("發生錯誤：", error);
      };
    }
  },
};

export default googleMapApi;

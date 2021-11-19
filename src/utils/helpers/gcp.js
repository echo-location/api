import axios from "axios";

const getCoords = async (address) => {
  const addr = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${addr}&key=${process.env.GEOLOCATION_API_KEY}`;
  return axios
    .get(url)
    .then((response) => {
      const { lat, lng } = response.data.results[0].geometry.location;
      return Object.assign(
        {},
        {
          coordinates: [lat, lng],
        }
      );
    })
    .catch((err) => {
      console.log("Fetch failed!", err.response);
    });
};
export { getCoords };

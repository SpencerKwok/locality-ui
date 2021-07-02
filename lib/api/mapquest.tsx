import SumoLogic from "lib/api/sumologic";
import { MAPQUEST_KEY } from "lib/env";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Address {
  streetAddress: string;
  city: string;
  province: string;
  country: string;
}

const mapquestClient: {
  getLatLng: (address: Address) => Promise<LatLng | null>;
} = {
  getLatLng: async (address): Promise<LatLng | null> => {
    const { streetAddress, city, province, country } = address;
    let latlng: LatLng | null = null;
    await fetch(
      `http://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_KEY}&maxResults=1&location=${streetAddress},${city},${province},${country}`
    )
      .then(async (res) => res.json())
      .then(
        ({
          results,
        }: {
          results: Array<{ locations: Array<{ latLng: LatLng }> }>;
        }) => {
          latlng = results[0].locations[0].latLng;
        }
      )
      .catch((error) => {
        SumoLogic.log({
          level: "error",
          message: "Failed to convert address to lat/lng",
          params: { address, error },
        });
      });
    return latlng;
  },
};

export default mapquestClient;

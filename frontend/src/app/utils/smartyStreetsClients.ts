import { core } from "smartystreets-javascript-sdk";

export class SmartyStreetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartyStreetsError";
  }
}

export function getClient() {
  let key = process.env.REACT_APP_SMARTY_STREETS_KEY;
  if (key === undefined) {
    throw new SmartyStreetsError("Missing REACT_APP_SMARTY_STREETS_KEY");
  }
  console.log("key", key);
  const credentials = new core.SharedCredentials(key);

  let clientBuilder = new core.ClientBuilder(credentials).withLicenses([
    "us-rooftop-geocoding-enterprise-cloud",
  ]);
  let client = clientBuilder.buildUsStreetApiClient();
  console.log("client", client);
  return client;
}

export function getZipCodeClient() {
  let key = process.env.REACT_APP_SMARTY_STREETS_KEY;
  if (key === undefined) {
    throw new SmartyStreetsError("Missing REACT_APP_SMARTY_STREETS_KEY");
  }
  console.log("key", key);
  const credentials = new core.SharedCredentials(key);

  let clientBuilder = new core.ClientBuilder(credentials).withLicenses([
    "us-rooftop-geocoding-enterprise-cloud",
  ]);
  let client = clientBuilder.buildUsZipcodeClient();
  console.log("client", client);
  return client;
}

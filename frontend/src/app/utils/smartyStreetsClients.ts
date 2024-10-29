// Remove this ts-ignore once @types/smartystreets-javascript-sdk is updated
// @ts-ignore
import core from "../../../node_modules/smartystreets-javascript-sdk/dist/esm/index.mjs";

export class SmartyStreetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartyStreetsError";
  }
}

export function buildClient(builder: Function) {
  if (process.env.REACT_APP_SMARTY_STREETS_KEY === undefined) {
    throw new SmartyStreetsError("Missing REACT_APP_SMARTY_STREETS_KEY");
  }

  const credentials = new core.SharedCredentials(
    process.env.REACT_APP_SMARTY_STREETS_KEY
  );

  return builder(credentials);
}

export function getClient() {
  return buildClient(core.buildClient.usStreet);
}

export function getZipCodeClient() {
  return buildClient(core.buildClient.usZipcode);
}

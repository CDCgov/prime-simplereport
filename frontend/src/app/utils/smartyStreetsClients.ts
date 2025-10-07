import { core } from "smartystreets-javascript-sdk";

export class SmartyStreetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartyStreetsError";
  }
}

export function buildClient(builder: Function) {
  if (import.meta.env.VITE_SMARTY_STREETS_KEY === undefined) {
    throw new SmartyStreetsError("Missing VITE_SMARTY_STREETS_KEY");
  }

  const credentials = new core.SharedCredentials(
    import.meta.env.VITE_SMARTY_STREETS_KEY
  );

  return builder(credentials);
}

export function getClient() {
  return buildClient(core.buildClient.usStreet);
}

export function getZipCodeClient() {
  return buildClient(core.buildClient.usZipcode);
}

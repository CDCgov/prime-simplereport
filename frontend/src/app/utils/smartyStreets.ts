import { core, usStreet } from "smartystreets-javascript-sdk";

import { toLowerStripWhitespace } from "./text";

class SmartyStreetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartyStreetsError";
  }
}

const getClient = () => {
  if (process.env.REACT_APP_SMARTY_STREETS_KEY === undefined) {
    throw new SmartyStreetsError("Missing REACT_APP_SMARTY_STREETS_KEY");
  }
  const credentials = new core.SharedCredentials(
    process.env.REACT_APP_SMARTY_STREETS_KEY
  );
  return core.buildClient.usStreet(credentials);
};

const getLookup = (address: Address) => {
  const lookup = new usStreet.Lookup();
  lookup.street = address.street;
  lookup.street2 = address.streetTwo || "";
  lookup.city = address.city || "";
  lookup.state = address.state;
  lookup.zipCode = address.zipCode;
  return lookup;
};

const getAddress = (result: usStreet.Candidate) => {
  const zipCode = result.components.plus4Code
    ? `${result.components.zipCode}-${result.components.plus4Code}`
    : result.components.zipCode;
  return {
    street: result.deliveryLine1,
    streetTwo: result.deliveryLine2 || "",
    city: result.components.cityName,
    state: result.components.state,
    zipCode,
    county: result.metadata.countyName,
  };
};

export const getBestSuggestion = async (
  address: Address
): Promise<AddressWithMetaData | undefined> => {
  try {
    const client = getClient();
    const lookup = getLookup(address);
    lookup.maxCandidates = 1;
    lookup.match = "strict";
    const response = await client.send(lookup);
    return getAddress(response.lookups[0].result[0]);
  } catch (error) {
    console.error("Unable to validate address:", error.message);
  }
};

export function suggestionIsCloseEnough(
  original: Address,
  suggested: Address | undefined
): boolean {
  if (typeof suggested === "undefined") {
    return false;
  }

  const fields: (keyof Address)[] = ["city", "state", "street", "streetTwo"];
  for (const field of fields) {
    if (
      toLowerStripWhitespace(original[field]) !==
      toLowerStripWhitespace(suggested[field])
    ) {
      return false;
    }
  }
  if (original.zipCode.substr(0, 5) !== suggested.zipCode.substr(0, 5)) {
    return false;
  }

  return true;
}

import { core, usStreet, usZipcode } from "smartystreets-javascript-sdk";

import { toLowerStripWhitespace } from "./text";

class SmartyStreetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartyStreetsError";
  }
}
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
  if (!result) {
    return;
  }

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

export async function getZipCode(
  zipCode: string
): Promise<core.Batch<usZipcode.Lookup> | undefined> {
  try {
    const client = getZipCodeClient();
    const lookup = new usZipcode.Lookup();
    lookup.zipCode = zipCode;

    return client.send(lookup);
  } catch (error) {
    console.error("Unable to retrieve ZIP code data", error.message);
  }
}

export async function isValidZipCodeForState(
  state: string,
  zipCode: string
): Promise<boolean> {
  const response = await getZipCode(zipCode);

  if (!response) {
    // Failed to retrieve ZIP code data - don't block facility management
    return true;
  }

  const zipCodeData = response.lookups[0].result[0];

  if (zipCodeData.status) {
    // Zip code is entirely invalid (`status` is not present otherwise)
    return false;
  }

  return zipCodeData.zipcodes[0].stateAbbreviation === state;
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

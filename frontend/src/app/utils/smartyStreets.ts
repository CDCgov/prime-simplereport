import {
  usStreet,
  usZipcode,
  // Remove this ts-ignore once @types/smartystreets-javascript-sdk is updated
  // @ts-ignore
} from "../../../node_modules/smartystreets-javascript-sdk/dist/esm/index.mjs";

import { getZipCodeClient, getClient } from "./smartyStreetsClients";
import { toLowerStripWhitespace } from "./text";

// cf. https://github.com/DefinitelyTyped/DefinitelyTyped/blob/11436c5a19fc6aabfd6b8d93b37dac38b4ab9bc2/types/smartystreets-javascript-sdk/index.d.ts#L625
export type ZipCodeResult = RequiredExceptFor<
  usZipcode.Result,
  "status" | "reason"
>;

const getLookup = (address: Address) => {
  const lookup = new usStreet.Lookup();
  lookup.street = address.street;
  lookup.street2 = address.streetTwo || "";
  lookup.city = address.city || "";
  lookup.state = address.state;
  lookup.zipCode = address.zipCode;
  return lookup;
};

export const getAddress = (result: usStreet.Candidate) => {
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
  } catch (error: any) {
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

export async function getZipCodeData(
  zipCode: string
): Promise<ZipCodeResult | undefined> {
  try {
    const client = getZipCodeClient();
    const lookup = new usZipcode.Lookup();
    lookup.zipCode = zipCode;

    const response = await client.send(lookup);
    return response.lookups[0].result[0] as ZipCodeResult;
  } catch (error: any) {
    console.error("Unable to retrieve ZIP code data", error.message);
  }
}

export function isValidZipCodeForState(
  state: string,
  result: ZipCodeResult | undefined
): boolean {
  if (!result) {
    // Failed to retrieve ZIP code data - don't block facility/person management
    return true;
  }

  if (result.status) {
    // Zip code is entirely invalid (`status` is not present otherwise)
    return false;
  }

  return result.zipcodes[0].stateAbbreviation === state;
}

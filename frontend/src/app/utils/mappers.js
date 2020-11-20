import { TEST_RESULT_VALUES } from "../constants";

/*
Creates a mapping interface between API -> Client

@param {array} mappings - a list of mappings

Example:

const nameMapper = createMappingInterface([firstName, middleName, lastName])

*/
export function createMappingInterface(mappings) {
  return mappings.reduce((acc, mapping) => {
    return { ...acc, ...mapping };
  }, {});
}

/*
  APIs return objects with key names of various conventions (ie: `birth-date`, `date-of-birth`, `dob`, etc)
  The client app expects data to be camelCase (ie: `birthDate`)
  
  @param {objecf} object - the input data from a backend API/service
  @param {object} mapping - the mapping interface, likely defined by `createMappingInterface`

  Example:
  
  object = {
    birth_date: "2000-10-10",
    key-we-dont-care-about: "asbdf"
    }
  }
  mapping = createMappingInterface([birthDate])
  
  mapApiDataToClient(object, mapping) // { birthDate: "2000-10-10" }
  
*/
export const mapApiDataToClient = (object, mapping) => {
  return Object.keys(object).reduce((acc, inputKey) => {
    if (inputKey in mapping) {
      const outputKey = mapping[inputKey].renamedKey;
      const value = mapping[inputKey].setValue(object);
      acc[outputKey] = value;
    }
    return acc;
  }, {});
};

//
// API -> Client field mappings
//

export const birthDate = {
  birth_date: {
    renamedKey: "birthDate",
    setValue: (object) => object["birth_date"],
  },
};

export const firstName = {
  first_name: {
    renamedKey: "firstName",
    setValue: (object) => object["first_name"],
  },
};

export const middleName = {
  middle_name: {
    renamedKey: "middleName",
    setValue: (object) => object["middle_name"],
  },
};

export const lastName = {
  last_name: {
    renamedKey: "lastName",
    setValue: (object) => object["last_name"],
  },
};

export const address = {
  address: {
    renamedKey: "address",
    setValue: (object) => object["address"],
  },
};

export const telephone = {
  telephone: {
    renamedKey: "telephone",
    setValue: (object) => object["telephone"],
  },
};

export const city = {
  city: {
    renamedKey: "city",
    setValue: (object) => object["city"],
  },
};

export const state = {
  state: {
    renamedKey: "state",
    setValue: (object) => object["state"],
  },
};

export const zip = {
  zip: {
    renamedKey: "zip",
    setValue: (object) => object["zip"],
  },
};

export const patientId = {
  id: {
    renamedKey: "patientId",
    setValue: (object) => object["id"],
  },
};

export const testResultId = {
  id: {
    renamedKey: "testResultId",
    setValue: (object) => object["id"],
  },
};

export const receivedAt = {
  received_at: {
    renamedKey: "receivedAt",
    setValue: (object) => object["received_at"], // TODO: convert date format
  },
};

export const testResult = {
  value: {
    renamedKey: "testResult",
    setValue: (object) => {
      const rawTestResult = object["value"];
      return TEST_RESULT_VALUES[rawTestResult];
    },
  },
};

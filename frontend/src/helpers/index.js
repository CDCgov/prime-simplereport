// temp hack to point to a localhost API server in dev.
// TODO: replace with env variables, or just point to the backend eventually
export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");

export const testRegistrationMapping = {
  birth_date: "birthDate",
  phone: "phone",
  address: "address",
  city: "city",
  state: "state",
  zipcode: "zipcode",
  first_name: "firstName",
  middle_name: "middleName",
  last_name: "lastName",
  id: "testRegistrationId",
  name: "name",
};

export const testResultMapping = {
  birth_date: "birthDate",
  phone: "phone",
  address: "address",
  city: "city",
  state: "state",
  zipcode: "zipcode",
  first_name: "firstName",
  middle_name: "middleName",
  last_name: "lastName",
  received_at: "receivedAt",
  id: "testResultId",
  test_registration_id: "testRegistrationId",
  value: "testResultValue",
  name: "name",
};

/*
  APIs return objects with key names of various conventions (ie: `birth-date`, `date-of-birth`, `dob`, etc)
  The client app expects data to be camelcased (ie: `birthDate`)
  This function converts the keys of the input to the format expected by the client
  Note: 
  - this discards key-value pairs that aren't used by the frontend
  
  input: {
    birth_date: "2000-10-10",
    key-we-dont-care-about: "asbdf"
    name: {
      first_name: "Count",
      middle_name: "Vlad",
      last_name: "Dracula"
      title-we-dont-care-about: "Dr."
    }
  }
  
  output: {
    birthDate: "2000-10-10"
    name: {
      firstName: "Count",
      middleName: "Vlad",
      lastName: "Dracula"
    }
  }
  
  */
export const mapApiKeysToFrontendKeys = (inputObject, mapping) => {
  return Object.keys(inputObject).reduce((acc, inputKey) => {
    if (inputKey in mapping) {
      let isNestedObject =
        typeof inputObject[inputKey] === "object" &&
        inputObject[inputKey] !== null;
      isNestedObject
        ? (acc[mapping[inputKey]] = mapApiKeysToFrontendKeys(
            inputObject[inputKey]
          ))
        : (acc[mapping[inputKey]] = inputObject[inputKey]);
    }
    return acc;
  }, {});
};

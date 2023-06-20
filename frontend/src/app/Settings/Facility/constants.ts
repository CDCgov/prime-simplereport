const isRequiredErrMsg = (fieldIdentifier: string) => {
  return `${fieldIdentifier} is required`;
};

const isInvalidErrMsg = (fieldIdentifier: string) => {
  return `${fieldIdentifier} is invalid`;
};

const facilityInfoLabels = {
  name: "Facility name",
  phone: "Facility phone number",
  email: "Email",
  street: "Facility street",
  zip: "Facility ZIP code",
  state: "Facility state",
  clia: "Facility CLIA number",
};

const orderingProviderLabels = {
  first: "Ordering provider first name",
  last: "Ordering provider last name",
  phone: "Ordering provider phone number",
  zip: "Ordering provider ZIP code",
};

export const facilityInfoErrMsgs = {
  name: {
    required: isRequiredErrMsg(facilityInfoLabels.name),
  },
  phone: {
    required: isRequiredErrMsg(facilityInfoLabels.phone),
    invalid: isInvalidErrMsg(facilityInfoLabels.phone),
  },
  email: {
    invalid: `${facilityInfoLabels.email} is incorrectly formatted`,
  },
  street: {
    required: isRequiredErrMsg(facilityInfoLabels.street),
  },
  zip: {
    required: isRequiredErrMsg(facilityInfoLabels.zip),
    invalid: isInvalidErrMsg(facilityInfoLabels.zip),
    stateInvalid: "Invalid ZIP code for this state",
  },
  state: {
    required: isRequiredErrMsg(facilityInfoLabels.state),
    invalid: "SimpleReport isn’t currently supported in",
  },
  clia: {
    required: isRequiredErrMsg(facilityInfoLabels.clia),
    invalid:
      "CLIA numbers must be 10 characters (##D#######), or a special temporary number from CA, IL, VT, WA, WY, or the Department of Defense",
  },
};

export const orderingProviderErrMsgs = {
  first: {
    required: isRequiredErrMsg(orderingProviderLabels.first),
  },
  last: {
    required: isRequiredErrMsg(orderingProviderLabels.last),
  },
  npi: {
    required: "NPI should be a 10-digit numerical value (##########)",
  },
  phone: {
    required: isRequiredErrMsg(orderingProviderLabels.phone),
    invalid: isInvalidErrMsg(orderingProviderLabels.phone),
  },
  zip: {
    invalid: isInvalidErrMsg(orderingProviderLabels.zip),
  },
};

export const deviceRequiredErrMsg = "There must be at least one device";

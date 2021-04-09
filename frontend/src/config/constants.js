export const PATIENT_TERM = "person";
export const PATIENT_TERM_CAP = "Person";
export const PATIENT_TERM_PLURAL = "people";
export const PATIENT_TERM_PLURAL_CAP = "People";

export const liveJurisdictions = [
  "AZ",
  "CO",
  "FL",
  "LA",
  "ND",
  "OH",
  "PA",
  "TX",
];

export const states = {
  AK: "Alaska",
  AL: "Alabama",
  AR: "Arkansas",
  AS: "American Samoa",
  AZ: "Arizona",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "Washington, D.C.",
  DE: "Delaware",
  FL: "Florida",
  FM: "Micronesia",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  MA: "Massachusetts",
  MD: "Maryland",
  ME: "Maine",
  MH: "Marshall Islands",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Montana",
  MP: "Mariana Islands",
  MS: "Mississippi",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  PW: "Palau",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VA: "Virginia",
  VI: "U.S. Virgin Islands",
  VT: "Vermont",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
};

export const stateCodes = Object.keys(states);

export const urls = {
  FACILITY_INFO:
    process.env.REACT_APP_BASE_URL +
    "resources/using-simplereport/manage-facility-info/find-supported-jurisdictions/",
};

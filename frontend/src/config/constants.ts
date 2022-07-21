export const PATIENT_TERM = "person";
export const PATIENT_TERM_CAP = "Person";
export const PATIENT_TERM_PLURAL = "people";
export const PATIENT_TERM_PLURAL_CAP = "People";

// NOTE: Any time SimpleReport goes live in a new state, this file must be updated.
// Otherwise, organizations will not be able to create facilities in the new state.
export const liveJurisdictions = [
  "AK",
  "AL",
  "AZ",
  "CA",
  "CO",
  "DE",
  "FL",
  "GU",
  "IA",
  "ID",
  "IL",
  "IN",
  "LA",
  "MA",
  "MD",
  "MN",
  "MS",
  "MT",
  "ND",
  "NH",
  "NJ",
  "NM",
  "NV",
  "OH",
  "OR",
  "PA",
  "TN",
  "TX",
  "VT",
  "WA",
  "WI",
  "WY",
];

// States which do not require a valid CLIA number for a facility
export const noCLIAValidationStates: (keyof typeof states)[] = ["CO"];

export const orderingProviderNotRequiredStates = ["ND"];

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

export const canadianProvinces = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NT: "Northwest Territories",
  NS: "Nova Scotia",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

export const canadianProvinceCodes = Object.keys(canadianProvinces);

export const countries = {
  AFG: "Afghanistan",
  ALB: "Albania",
  DZA: "Algeria",
  AND: "Andorra",
  AGO: "Angola",
  ATG: "Antigua",
  ARG: "Argentina",
  ARM: "Armenia",
  AUS: "Australia",
  AUT: "Austria",
  AZE: "Azerbaijan",
  BHS: "Bahamas, The",
  BHR: "Bahrain",
  BGD: "Bangladesh",
  BRB: "Barbados",
  BLR: "Belarus",
  BEL: "Belgium",
  BLZ: "Belize",
  BEN: "Benin",
  BTN: "Bhutan",
  BOL: "Bolivia",
  BIH: "Bosnia and Herzegovina",
  BWA: "Botswana",
  BRA: "Brazil",
  BRN: "Brunei",
  BGR: "Bulgaria",
  BFA: "Burkina Faso",
  MMR: "Burma",
  BDI: "Burundi",
  CPV: "Cabo Verde",
  KHM: "Cambodia",
  CMR: "Cameroon",
  CAN: "Canada",
  CAF: "Central African Republic",
  TCD: "Chad",
  CHL: "Chile",
  CHN: "China",
  COL: "Colombia",
  COM: "Comoros",
  COG: "Republic of the Congo",
  COD: "Democratic Republic of the Congo",
  CRI: "Costa Rica",
  CIV: "Côte d’Ivoire",
  HRV: "Croatia",
  CUB: "Cuba",
  CYP: "Cyprus",
  CZE: "Czechia",
  DNK: "Denmark",
  DJI: "Djibouti",
  DMA: "Dominica",
  DOM: "Dominican Republic",
  ECU: "Ecuador",
  EGY: "Egypt",
  SLV: "El Salvador",
  GNQ: "Equatorial Guinea",
  ERI: "Eritrea",
  EST: "Estonia",
  SWZ: "Eswatini",
  ETH: "Ethiopia",
  FJI: "Fiji",
  FIN: "Finland",
  FRA: "France",
  GAB: "Gabon",
  GMB: "Gambia, The",
  GEO: "Georgia",
  DEU: "Germany",
  GHA: "Ghana",
  GRC: "Greece",
  GRD: "Grenada",
  GTM: "Guatemala",
  GIN: "Guinea",
  GNB: "Guinea-Bissau",
  GUY: "Guyana",
  HTI: "Haiti",
  VAT: "Holy See",
  HND: "Honduras",
  HUN: "Hungary",
  ISL: "Iceland",
  IND: "India",
  IDN: "Indonesia",
  IRN: "Iran",
  IRQ: "Iraq",
  IRL: "Ireland",
  ISR: "Israel",
  ITA: "Italy",
  JAM: "Jamaica",
  JPN: "Japan",
  JOR: "Jordan",
  KAZ: "Kazakhstan",
  KEN: "Kenya",
  KIR: "Kiribati",
  PRK: "Korea, North",
  KOR: "Korea, South",
  XKS: "Kosovo",
  KWT: "Kuwait",
  KGZ: "Kyrgyzstan",
  LAO: "Laos",
  LVA: "Latvia",
  LBN: "Lebanon",
  LSO: "Lesotho",
  LBR: "Liberia",
  LBY: "Libya",
  LIE: "Liechtenstein",
  LTU: "Lithuania",
  LUX: "Luxembourg",
  MDG: "Madagascar",
  MWI: "Malawi",
  MYS: "Malaysia",
  MDV: "Maldives",
  MLI: "Mali",
  MLT: "Malta",
  MHL: "Marshall Islands",
  MRT: "Mauritania",
  MUS: "Mauritius",
  MEX: "Mexico",
  FSM: "Micronesia, Federated States of",
  MDA: "Moldova",
  MCO: "Monaco",
  MNG: "Mongolia",
  MNE: "Montenegro",
  MAR: "Morocco",
  MOZ: "Mozambique",
  NAM: "Namibia",
  NRU: "Nauru",
  NPL: "Nepal",
  NLD: "Netherlands",
  NZL: "New Zealand",
  NIC: "Nicaragua",
  NER: "Niger",
  NGA: "Nigeria",
  MKD: "North Macedonia",
  NOR: "Norway",
  OMN: "Oman",
  PAK: "Pakistan",
  PLW: "Palau",
  PAN: "Panama",
  PNG: "Papua New Guinea",
  PRY: "Paraguay",
  PER: "Peru",
  PHL: "Philippines",
  POL: "Poland",
  PRT: "Portugal",
  QAT: "Qatar",
  ROU: "Romania",
  RUS: "Russia",
  RWA: "Rwanda",
  KNA: "Saint Kitts and Nevis",
  LCA: "Saint Lucia",
  VCT: "Saint Vincent and the Grenadines",
  WSM: "Samoa",
  SMR: "San Marino",
  STP: "Sao Tome and Principe",
  SAU: "Saudi Arabia",
  SEN: "Senegal",
  SRB: "Serbia",
  SYC: "Seychelles",
  SLE: "Sierra Leone",
  SGP: "Singapore",
  SVK: "Slovakia",
  SVN: "Slovenia",
  SLB: "Solomon Islands",
  SOM: "Somalia",
  ZAF: "South Africa",
  SSD: "South Sudan",
  ESP: "Spain",
  LKA: "Sri Lanka",
  SDN: "Sudan",
  SUR: "Suriname",
  SWE: "Sweden",
  CHE: "Switzerland",
  SYR: "Syria",
  TJK: "Tajikistan",
  TZA: "Tanzania",
  THA: "Thailand",
  TLS: "Timor-Leste",
  TGO: "Togo",
  TON: "Tonga",
  TTO: "Trinidad and Tobago",
  TUN: "Tunisia",
  TUR: "Turkey",
  TKM: "Turkmenistan",
  TUV: "Tuvalu",
  UGA: "Uganda",
  UKR: "Ukraine",
  ARE: "United Arab Emirates",
  GBR: "United Kingdom",
  USA: "United States",
  URY: "Uruguay",
  UZB: "Uzbekistan",
  VUT: "Vanuatu",
  VEN: "Venezuela",
  VNM: "Vietnam",
  YEM: "Yemen",
  ZMB: "Zambia",
  ZWE: "Zimbabwe",
  TWN: "Taiwan",
  XQZ: "Akrotiri",
  ASM: "American Samoa",
  AIA: "Anguilla",
  ATA: "Antarctica",
  ABW: "Aruba",
  XAC: "Ashmore and Cartier Islands",
  XBK: "Baker Island",
  BMU: "Bermuda",
  BVT: "Bouvet Island",
  IOT: "British Indian Ocean Territory",
  CYM: "Cayman Islands",
  CXR: "Christmas Island",
  CPT: "Clipperton Island",
  CCK: "Cocos (Keeling) Islands",
  COK: "Cook Islands",
  XCS: "Coral Sea Islands",
  CUW: "Curaçao",
  XXD: "Dhekelia",
  FLK: "Falkland Islands (Islas Malvinas)",
  FRO: "Faroe Islands",
  GUF: "French Guiana",
  PYF: "French Polynesia",
  ATF: "French Southern and Antarctic Lands",
  GIB: "Gibraltar",
  GRL: "Greenland",
  GLP: "Guadeloupe",
  GUM: "Guam",
  GGY: "Guernsey",
  HMD: "Heard Island and McDonald Islands",
  HKG: "Hong Kong",
  XHO: "Howland Island",
  IMN: "Isle of Man",
  XJM: "Jan Mayen",
  XJV: "Jarvis Island",
  JEY: "Jersey",
  XJA: "Johnston Atoll",
  XKR: "Kingman Reef",
  MAC: "Macau",
  MTQ: "Martinique",
  MYT: "Mayotte",
  XMW: "Midway Islands",
  MSR: "Montserrat",
  XNV: "Navassa Island",
  NCL: "New Caledonia",
  NIU: "Niue",
  NFK: "Norfolk Island",
  MNP: "Northern Mariana Islands",
  XPL: "Palmyra Atoll",
  XPR: "Paracel Islands",
  PCN: "Pitcairn Islands",
  PRI: "Puerto Rico",
  REU: "Reunion",
  BLM: "Saint Barthelemy",
  SHN: "Saint Helena, Ascension, and Tristan da Cunha",
  MAF: "Saint Martin",
  SPM: "Saint Pierre and Miquelon",
  SXM: "Sint Maarten",
  SGS: "South Georgia and the South Sandwich Islands",
  XSP: "Spratly Islands",
  XSV: "Svalbard",
  TKL: "Tokelau",
  TCA: "Turks and Caicos Islands",
  VGB: "Virgin Islands, British",
  VIR: "Virgin Islands, U.S.",
  XWK: "Wake Island",
  WLF: "Wallis and Futuna",
};

export const countryCodes = Object.keys(countries);

export const countryOptions = Object.entries(countries)
  .sort(([_A, nameA], [_B, nameB]) => nameA.localeCompare(nameB))
  .map(([code, name]) => ({
    label: name,
    value: code,
  }));

export const languages: Language[] = [
  "English",
  "Spanish",
  "Unknown",
  "Afrikaans",
  "Amaric",
  "American Sign Language",
  "Arabic",
  "Armenian",
  "Aromanian; Arumanian; Macedo-Romanian",
  "Bantu (other)",
  "Bengali",
  "Braille",
  "Burmese",
  "Cambodian",
  "Cantonese",
  "Caucasian (other)",
  "Chaochow",
  "Cherokee",
  "Chinese",
  "Creoles and pidgins, French-based (Other)",
  "Cushitic (other)",
  "Dakota",
  "Farsi",
  "Fiji",
  "Filipino; Pilipino",
  "French",
  "German",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Korean",
  "Kru languages",
  "Kurdish",
  "Laotian",
  "Latin",
  "Luganda",
  "Malayalam",
  "Mandar",
  "Mandarin",
  "Marathi",
  "Marshallese",
  "Mien",
  "Mixteca",
  "Mon-Khmer (Other)",
  "Mongolian",
  "Morrocan Arabic",
  "Navajo",
  "Nepali",
  "Not Specified",
  "Oaxacan",
  "Other",
  "Pashto",
  "Portuguese",
  "Punjabi",
  "Rarotongan; Cook Islands Maori",
  "Russian",
  "Samoan",
  "Sebuano",
  "Serbo Croatian",
  "Sign Languages",
  "Singhalese",
  "Somali",
  "Swahili",
  "Syrian",
  "Tagalog",
  "Tahitian",
  "Taiwanese",
  "Tamil",
  "Tegulu",
  "Thai",
  "Tigrinya",
  "Triqui",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Yiddish",
  "Zapotec",
];

export const urls = {
  FACILITY_INFO:
    process.env.REACT_APP_BASE_URL +
    "resources/using-simplereport/manage-facility-info/find-supported-jurisdictions/",
};

export const securityQuestions = [
  "What’s the first name of your best friend from high school?",
  "What was the first name of your favorite childhood friend?",
  "In what city or town was your first job?",
  "What’s the last name of your first boss?",
  "What’s your grandmother’s first name?",
  "What’s your oldest sibling’s middle name?",
  "What was the name of the street where you were living when you were 10 years old?",
  "What was the name of the street where you were living when you were in third grade?",
  "In what city or town did your parents meet?",
  "What’s the first name of your eldest cousin on your mother’s side?",
  "What’s the last name of your best friend?",
  "What was the make and model of your first car?",
  "What was the name of the company where you had your first job?",
  "What’s the first name of your oldest nephew?",
  "What was the first name of the first person you dated?",
  "What was the first name of your first boyfriend or girlfriend?",
];

export const accountCreationSteps = [
  { label: "Create your password", value: "0", order: 0 },
  { label: "Select your security question", value: "1", order: 1 },
  { label: "Set up authentication", value: "2", order: 2 },
];

export const organizationCreationSteps = [
  { label: "Organization information", value: "0", order: 0 },
  { label: "Personal details", value: "1", order: 1 },
  { label: "Experian identity verification", value: "2", order: 2 },
];

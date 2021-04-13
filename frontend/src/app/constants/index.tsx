import { TestResult } from "../testQueue/QueueItem";

export const COVID_RESULTS: { [key: string]: TestResult } = {
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
  INCONCLUSIVE: "UNDETERMINED",
  UNKNOWN: "UNKNOWN",
};

export const TEST_RESULT_DESCRIPTIONS: Record<TestResult, string> = {
  NEGATIVE: "Negative",
  POSITIVE: "Positive",
  UNDETERMINED: "Inconclusive",
  UNKNOWN: "Unknown",
};

export const RACE_VALUES: { value: Race; label: string }[] = [
  { value: "native", label: "American Indian or Alaskan Native" },
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black or African American" },
  { value: "pacific", label: "Native Hawaiian or other Pacific Islander" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
  { value: "refused", label: "Prefer not to answer" },
];

export const ROLE_VALUES: { value: Role; label: string }[] = [
  { label: "Staff", value: "STAFF" },
  { label: "Resident", value: "RESIDENT" },
  { label: "Student", value: "STUDENT" },
  { label: "Visitor", value: "VISITOR" },
];

export const ETHNICITY_VALUES: { value: Ethnicity; label: string }[] = [
  { label: "Hispanic or Latino", value: "hispanic" },
  { label: "Not Hispanic", value: "not_hispanic" },
  { label: "Prefer not to answer", value: "refused" },
];
export const GENDER_VALUES: { value: Gender; label: string }[] = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Other", value: "other" },
  { label: "Prefer not to answer", value: "refused" },
];

export const YES_NO_VALUES: { value: YesNo; label: string }[] = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
];

export const YES_NO_UNKNOWN_VALUES: {
  value: YesNoUnknown;
  label: string;
}[] = [...YES_NO_VALUES, { value: "UNKNOWN", label: "Unknown" }];

const fullTribalAffiliationValueSet: {
  value: TribalAffiliation;
  label: string;
}[] = [
  {
    value: "338",
    label: "Village of Afognak",
  },
  {
    value: "339",
    label: "Agdaagux Tribe of King Cove",
  },
  {
    value: "340",
    label: "Native Village of Akhiok",
  },
  {
    value: "341",
    label: "Akiachak Native Community",
  },
  {
    value: "342",
    label: "Akiak Native Community",
  },
  {
    value: "343",
    label: "Native Village of Akutan",
  },
  {
    value: "344",
    label: "Village of Alakanuk",
  },
  {
    value: "345",
    label: "Alatna Village",
  },
  {
    value: "346",
    label: "Native Village of Aleknagik",
  },
  {
    value: "347",
    label: "Algaaciq Native Village (St. Mary's)",
  },
  {
    value: "348",
    label: "Allakaket Village",
  },
  {
    value: "349",
    label: "Native Village of Ambler",
  },
  {
    value: "350",
    label: "Village of Anaktuvuk Pass",
  },
  {
    value: "351",
    label: "Yupiit of Andreafski",
  },
  {
    value: "352",
    label: "Angoon Community Association",
  },
  {
    value: "353",
    label: "Village of Aniak",
  },
  {
    value: "354",
    label: "Anvik Village",
  },
  {
    value: "355",
    label: "Arctic Village (See Native Village of Venetie Trib",
  },
  {
    value: "356",
    label: "Asa carsarmiut Tribe (formerly Native Village of M",
  },
  {
    value: "357",
    label: "Native Village of Atka",
  },
  {
    value: "358",
    label: "Village of Atmautluak",
  },
  {
    value: "359",
    label: "Atqasuk Village (Atkasook)",
  },
  {
    value: "360",
    label: "Native Village of Barrow Inupiat Traditional Gover",
  },
  {
    value: "361",
    label: "Beaver Village",
  },
  {
    value: "362",
    label: "Native Village of Belkofski",
  },
  {
    value: "363",
    label: "Village of Bill Moore's Slough",
  },
  {
    value: "364",
    label: "Birch Creek Tribe",
  },
  {
    value: "365",
    label: "Native Village of Brevig Mission",
  },
  {
    value: "366",
    label: "Native Village of Buckland",
  },
  {
    value: "367",
    label: "Native Village of Cantwell",
  },
  {
    value: "368",
    label: "Native Village of Chanega (aka Chenega)",
  },
  {
    value: "369",
    label: "Chalkyitsik Village",
  },
  {
    value: "370",
    label: "Village of Chefornak",
  },
  {
    value: "371",
    label: "Chevak Native Village",
  },
  {
    value: "372",
    label: "Chickaloon Native Village",
  },
  {
    value: "373",
    label: "Native Village of Chignik",
  },
  {
    value: "374",
    label: "Native Village of Chignik Lagoon",
  },
  {
    value: "375",
    label: "Chignik Lake Village",
  },
  {
    value: "376",
    label: "Chilkat Indian Village (Klukwan)",
  },
  {
    value: "377",
    label: "Chilkoot Indian Association (Haines)",
  },
  {
    value: "378",
    label: "Chinik Eskimo Community (Golovin)",
  },
  {
    value: "379",
    label: "Native Village of Chistochina",
  },
  {
    value: "380",
    label: "Native Village of Chitina",
  },
  {
    value: "381",
    label: "Native Village of Chuathbaluk (Russian Mission, Ku",
  },
  {
    value: "382",
    label: "Chuloonawick Native Village",
  },
  {
    value: "383",
    label: "Circle Native Community",
  },
  {
    value: "384",
    label: "Village of Clark's Point",
  },
  {
    value: "385",
    label: "Native Village of Council",
  },
  {
    value: "386",
    label: "Craig Community Association",
  },
  {
    value: "387",
    label: "Village of Crooked Creek",
  },
  {
    value: "388",
    label: "Curyung Tribal Council (formerly Native Village of",
  },
  {
    value: "389",
    label: "Native Village of Deering",
  },
  {
    value: "390",
    label: "Native Village of Diomede (aka Inalik)",
  },
  {
    value: "391",
    label: "Village of Dot Lake",
  },
  {
    value: "392",
    label: "Douglas Indian Association",
  },
  {
    value: "393",
    label: "Native Village of Eagle",
  },
  {
    value: "394",
    label: "Native Village of Eek",
  },
  {
    value: "395",
    label: "Egegik Village",
  },
  {
    value: "396",
    label: "Eklutna Native Village",
  },
  {
    value: "397",
    label: "Native Village of Ekuk",
  },
  {
    value: "398",
    label: "Ekwok Village",
  },
  {
    value: "399",
    label: "Native Village of Elim",
  },
  {
    value: "400",
    label: "Emmonak Village",
  },
  {
    value: "401",
    label: "Evansville Village (aka Bettles Field)",
  },
  {
    value: "402",
    label: "Native Village of Eyak (Cordova)",
  },
  {
    value: "403",
    label: "Native Village of False Pass",
  },
  {
    value: "404",
    label: "Native Village of Fort Yukon",
  },
  {
    value: "405",
    label: "Native Village of Gakona",
  },
  {
    value: "406",
    label: "Galena Village (aka Louden Village)",
  },
  {
    value: "407",
    label: "Native Village of Gambell",
  },
  {
    value: "408",
    label: "Native Village of Georgetown",
  },
  {
    value: "409",
    label: "Native Village of Goodnews Bay",
  },
  {
    value: "410",
    label: "Organized Village of Grayling (aka Holikachuk)",
  },
  {
    value: "411",
    label: "Gulkana Village",
  },
  {
    value: "412",
    label: "Native Village of Hamilton",
  },
  {
    value: "413",
    label: "Healy Lake Village",
  },
  {
    value: "414",
    label: "Holy Cross Village",
  },
  {
    value: "415",
    label: "Hoonah Indian Association",
  },
  {
    value: "416",
    label: "Native Village of Hooper Bay",
  },
  {
    value: "417",
    label: "Hughes Village",
  },
  {
    value: "418",
    label: "Huslia Village",
  },
  {
    value: "419",
    label: "Hydaburg Cooperative Association",
  },
  {
    value: "420",
    label: "Igiugig Village",
  },
  {
    value: "421",
    label: "Village of Iliamna",
  },
  {
    value: "422",
    label: "Inupiat Community of the Arctic Slope",
  },
  {
    value: "423",
    label: "Iqurmuit Traditional Council (formerly Native Vill",
  },
  {
    value: "424",
    label: "Ivanoff Bay Village",
  },
  {
    value: "425",
    label: "Kaguyak Village",
  },
  {
    value: "426",
    label: "Organized Village of Kake",
  },
  {
    value: "427",
    label: "Kaktovik Village (aka Barter Island)",
  },
  {
    value: "428",
    label: "Village of Kalskag",
  },
  {
    value: "429",
    label: "Village of Kaltag",
  },
  {
    value: "430",
    label: "Native Village of Kanatak",
  },
  {
    value: "431",
    label: "Native Village of Karluk",
  },
  {
    value: "432",
    label: "Organized Village of Kasaan",
  },
  {
    value: "433",
    label: "Native Village of Kasigluk",
  },
  {
    value: "434",
    label: "Kenaitze Indian Tribe",
  },
  {
    value: "435",
    label: "Ketchikan Indian Corporation",
  },
  {
    value: "436",
    label: "Native Village of Kiana",
  },
  {
    value: "437",
    label: "King Island Native Community",
  },
  {
    value: "438",
    label: "King Salmon Tribe",
  },
  {
    value: "439",
    label: "Native Village of Kipnuk",
  },
  {
    value: "440",
    label: "Native Village of Kivalina",
  },
  {
    value: "441",
    label: "Klawock Cooperative Association",
  },
  {
    value: "442",
    label: "Native Village of Kluti Kaah (aka Copper Center)",
  },
  {
    value: "443",
    label: "Knik Tribe",
  },
  {
    value: "444",
    label: "Native Village of Kobuk",
  },
  {
    value: "445",
    label: "Kokhanok Village",
  },
  {
    value: "446",
    label: "Native Village of Kongiganak",
  },
  {
    value: "447",
    label: "Village of Kotlik",
  },
  {
    value: "448",
    label: "Native Village of Kotzebue",
  },
  {
    value: "449",
    label: "Native Village of Koyuk",
  },
  {
    value: "450",
    label: "Koyukuk Native Village",
  },
  {
    value: "451",
    label: "Organized Village of Kwethluk",
  },
  {
    value: "452",
    label: "Native Village of Kwigillingok",
  },
  {
    value: "453",
    label: "Native Village of Kwinhagak (aka Quinhagak)",
  },
  {
    value: "454",
    label: "Native Village of Larsen Bay",
  },
  {
    value: "455",
    label: "Levelock Village",
  },
  {
    value: "456",
    label: "Lesnoi Village (aka Woody Island)",
  },
  {
    value: "457",
    label: "Lime Village",
  },
  {
    value: "458",
    label: "Village of Lower Kalskag",
  },
  {
    value: "459",
    label: "Manley Hot Springs Village",
  },
  {
    value: "460",
    label: "Manokotak Village",
  },
  {
    value: "461",
    label: "Native Village of Marshall (aka Fortuna Ledge)",
  },
  {
    value: "462",
    label: "Native Village of Mary's Igloo",
  },
  {
    value: "463",
    label: "McGrath Native Village",
  },
  {
    value: "464",
    label: "Native Village of Mekoryuk",
  },
  {
    value: "465",
    label: "Mentasta Traditional Council",
  },
  {
    value: "466",
    label: "Metlakatla Indian Community, Annette Island Reserv",
  },
  {
    value: "467",
    label: "Native Village of Minto",
  },
  {
    value: "468",
    label: "Naknek Native Village",
  },
  {
    value: "469",
    label: "Native Village of Nanwalek (aka English Bay)",
  },
  {
    value: "470",
    label: "Native Village of Napaimute",
  },
  {
    value: "471",
    label: "Native Village of Napakiak",
  },
  {
    value: "472",
    label: "Native Village of Napaskiak",
  },
  {
    value: "473",
    label: "Native Village of Nelson Lagoon",
  },
  {
    value: "474",
    label: "Nenana Native Association",
  },
  {
    value: "475",
    label: "New Koliganek Village Council (formerly Koliganek",
  },
  {
    value: "476",
    label: "New Stuyahok Village",
  },
  {
    value: "477",
    label: "Newhalen Village",
  },
  {
    value: "478",
    label: "Newtok Village",
  },
  {
    value: "479",
    label: "Native Village of Nightmute",
  },
  {
    value: "480",
    label: "Nikolai Village",
  },
  {
    value: "481",
    label: "Native Village of Nikolski",
  },
  {
    value: "482",
    label: "Ninilchik Village",
  },
  {
    value: "483",
    label: "Native Village of Noatak",
  },
  {
    value: "484",
    label: "Nome Eskimo Community",
  },
  {
    value: "485",
    label: "Nondalton Village",
  },
  {
    value: "486",
    label: "Noorvik Native Community",
  },
  {
    value: "487",
    label: "Northway Village",
  },
  {
    value: "488",
    label: "Native Village of Nuiqsut (aka Nooiksut)",
  },
  {
    value: "489",
    label: "Nulato Village",
  },
  {
    value: "490",
    label: "Nunakauyarmiut Tribe (formerly Native Village of T",
  },
  {
    value: "491",
    label: "Native Village of Nunapitchuk",
  },
  {
    value: "492",
    label: "Village of Ohogamiut",
  },
  {
    value: "493",
    label: "Village of Old Harbor",
  },
  {
    value: "494",
    label: "Orutsararmuit Native Village (aka Bethel)",
  },
  {
    value: "495",
    label: "Oscarville Traditional Village",
  },
  {
    value: "496",
    label: "Native Village of Ouzinkie",
  },
  {
    value: "497",
    label: "Native Village of Paimiut",
  },
  {
    value: "498",
    label: "Pauloff Harbor Village",
  },
  {
    value: "499",
    label: "Pedro Bay Village",
  },
  {
    value: "500",
    label: "Native Village of Perryville",
  },
  {
    value: "501",
    label: "Petersburg Indian Association",
  },
  {
    value: "502",
    label: "Native Village of Pilot Point",
  },
  {
    value: "503",
    label: "Pilot Station Traditional Village",
  },
  {
    value: "504",
    label: "Native Village of Pitka's Point",
  },
  {
    value: "505",
    label: "Platinum Traditional Village",
  },
  {
    value: "506",
    label: "Native Village of Point Hope",
  },
  {
    value: "507",
    label: "Native Village of Point Lay",
  },
  {
    value: "508",
    label: "Native Village of Port Graham",
  },
  {
    value: "509",
    label: "Native Village of Port Heiden",
  },
  {
    value: "510",
    label: "Native Village of Port Lions",
  },
  {
    value: "511",
    label: "Portage Creek Village (aka Ohgsenakale)",
  },
  {
    value: "512",
    label: "Pribilof Islands Aleut Communities of St. Paul & S",
  },
  {
    value: "513",
    label: "Qagan Tayagungin Tribe of Sand Point Village",
  },
  {
    value: "514",
    label: "Qawalangin Tribe of Unalaska",
  },
  {
    value: "515",
    label: "Rampart Village",
  },
  {
    value: "516",
    label: "Village of Red Devil",
  },
  {
    value: "517",
    label: "Native Village of Ruby",
  },
  {
    value: "518",
    label: "Saint George Island(See Pribilof Islands Aleut Com",
  },
  {
    value: "519",
    label: "Native Village of Saint Michael",
  },
  {
    value: "520",
    label: "Saint Paul Island (See Pribilof Islands Aleut Comm",
  },
  {
    value: "521",
    label: "Village of Salamatoff",
  },
  {
    value: "522",
    label: "Native Village of Savoonga",
  },
  {
    value: "523",
    label: "Organized Village of Saxman",
  },
  {
    value: "524",
    label: "Native Village of Scammon Bay",
  },
  {
    value: "525",
    label: "Native Village of Selawik",
  },
  {
    value: "526",
    label: "Seldovia Village Tribe",
  },
  {
    value: "527",
    label: "Shageluk Native Village",
  },
  {
    value: "528",
    label: "Native Village of Shaktoolik",
  },
  {
    value: "529",
    label: "Native Village of Sheldon's Point",
  },
  {
    value: "530",
    label: "Native Village of Shishmaref",
  },
  {
    value: "531",
    label: "Shoonaq Tribe of Kodiak",
  },
  {
    value: "532",
    label: "Native Village of Shungnak",
  },
  {
    value: "533",
    label: "Sitka Tribe of Alaska",
  },
  {
    value: "534",
    label: "Skagway Village",
  },
  {
    value: "535",
    label: "Village of Sleetmute",
  },
  {
    value: "536",
    label: "Village of Solomon",
  },
  {
    value: "537",
    label: "South Naknek Village",
  },
  {
    value: "538",
    label: "Stebbins Community Association",
  },
  {
    value: "539",
    label: "Native Village of Stevens",
  },
  {
    value: "540",
    label: "Village of Stony River",
  },
  {
    value: "541",
    label: "Takotna Village",
  },
  {
    value: "542",
    label: "Native Village of Tanacross",
  },
  {
    value: "543",
    label: "Native Village of Tanana",
  },
  {
    value: "544",
    label: "Native Village of Tatitlek",
  },
  {
    value: "545",
    label: "Native Village of Tazlina",
  },
  {
    value: "546",
    label: "Telida Village",
  },
  {
    value: "547",
    label: "Native Village of Teller",
  },
  {
    value: "548",
    label: "Native Village of Tetlin",
  },
  {
    value: "549",
    label: "Central Council of the Tlingit and Haida Indian Tb",
  },
  {
    value: "550",
    label: "Traditional Village of Togiak",
  },
  {
    value: "551",
    label: "Tuluksak Native Community",
  },
  {
    value: "552",
    label: "Native Village of Tuntutuliak",
  },
  {
    value: "553",
    label: "Native Village of Tununak",
  },
  {
    value: "554",
    label: "Twin Hills Village",
  },
  {
    value: "555",
    label: "Native Village of Tyonek",
  },
  {
    value: "556",
    label: "Ugashik Village",
  },
  {
    value: "557",
    label: "Umkumiute Native Village",
  },
  {
    value: "558",
    label: "Native Village of Unalakleet",
  },
  {
    value: "559",
    label: "Native Village of Unga",
  },
  {
    value: "560",
    label: "Village of Venetie (See Native Village of Venetie",
  },
  {
    value: "561",
    label: "Native Village of Venetie Tribal Government (Arcti",
  },
  {
    value: "562",
    label: "Village of Wainwright",
  },
  {
    value: "563",
    label: "Native Village of Wales",
  },
  {
    value: "564",
    label: "Native Village of White Mountain",
  },
  {
    value: "565",
    label: "Wrangell Cooperative Association",
  },
  {
    value: "566",
    label: "Yakutat Tlingit Tribe",
  },
  {
    value: "1",
    label: "Absentee-Shawnee Tribe of Indians of Oklahoma",
  },
  {
    value: "10",
    label: "Assiniboine and Sioux Tribes of the Fort Peck Indi",
  },
  {
    value: "100",
    label: "Havasupai Tribe of the Havasupai Reservation, Ariz",
  },
  {
    value: "101",
    label: "Ho-Chunk Nation of Wisconsin (formerly known as th",
  },
  {
    value: "102",
    label: "Hoh Indian Tribe of the Hoh Indian Reservation, Wa",
  },
  {
    value: "103",
    label: "Hoopa Valley Tribe, California",
  },
  {
    value: "104",
    label: "Hopi Tribe of Arizona",
  },
  {
    value: "105",
    label: "Hopland Band of Pomo Indians of the Hopland Ranche",
  },
  {
    value: "106",
    label: "Houlton Band of Maliseet Indians of Maine",
  },
  {
    value: "107",
    label: "Hualapai Indian Tribe of the Hualapai Indian Reser",
  },
  {
    value: "108",
    label: "Huron Potawatomi, Inc., Michigan",
  },
  {
    value: "109",
    label: "Inaja Band of Diegueno Mission Indians of the Inaj",
  },
  {
    value: "11",
    label: "Augustine Band of Cahuilla Mission Indians of the",
  },
  {
    value: "110",
    label: "Ione Band of Miwok Indians of California",
  },
  {
    value: "111",
    label: "Iowa Tribe of Kansas and Nebraska",
  },
  {
    value: "112",
    label: "Iowa Tribe of Oklahoma",
  },
  {
    value: "113",
    label: "Jackson Rancheria of Me-Wuk Indians of California",
  },
  {
    value: "114",
    label: "Jamestown S'Klallam Tribe of Washington",
  },
  {
    value: "115",
    label: "Jamul Indian Village of California",
  },
  {
    value: "116",
    label: "Jena Band of Choctaw Indians, Louisiana",
  },
  {
    value: "117",
    label: "Jicarilla Apache Tribe of the Jicarilla Apache Ind",
  },
  {
    value: "118",
    label: "Kaibab Band of Paiute Indians of the Kaibab Indian",
  },
  {
    value: "119",
    label: "Kalispel Indian Community of the Kalispel Reservat",
  },
  {
    value: "12",
    label: "Bad River Band of the Lake Superior Tribe of Chipp",
  },
  {
    value: "120",
    label: "Karuk Tribe of California",
  },
  {
    value: "121",
    label: "Kashia Band of Pomo Indians of the Stewarts Point",
  },
  {
    value: "122",
    label: "Kaw Nation, Oklahoma",
  },
  {
    value: "123",
    label: "Keweenaw Bay Indian Community of L'Anse and Ontona",
  },
  {
    value: "124",
    label: "Kialegee Tribal Town, Oklahoma",
  },
  {
    value: "125",
    label: "Kickapoo Tribe of Indians of the Kickapoo Reservat",
  },
  {
    value: "126",
    label: "Kickapoo Tribe of Oklahoma",
  },
  {
    value: "127",
    label: "Kickapoo Traditional Tribe of Texas",
  },
  {
    value: "128",
    label: "Kiowa Indian Tribe of Oklahoma",
  },
  {
    value: "129",
    label: "Klamath Indian Tribe of Oregon",
  },
  {
    value: "13",
    label: "Bay Mills Indian Community of the Sault Ste. Marie",
  },
  {
    value: "130",
    label: "Kootenai Tribe of Idaho",
  },
  {
    value: "131",
    label: "La Jolla Band of Luiseno Mission Indians of the La",
  },
  {
    value: "132",
    label: "La Posta Band of Diegueno Mission Indians of the L",
  },
  {
    value: "133",
    label: "Lac Courte Oreilles Band of Lake Superior Chippewa",
  },
  {
    value: "134",
    label: "Lac du Flambeau Band of Lake Superior Chippewa Ind",
  },
  {
    value: "135",
    label: "Lac Vieux Desert Band of Lake Superior Chippewa In",
  },
  {
    value: "136",
    label: "Las Vegas Tribe of Paiute Indians of the Las Vegas",
  },
  {
    value: "137",
    label: "Little River Band of Ottawa Indians of Michigan",
  },
  {
    value: "138",
    label: "Little Traverse Bay Bands of Odawa Indians of Mich",
  },
  {
    value: "139",
    label: "Lower Lake Rancheria, California",
  },
  {
    value: "14",
    label: "Bear River Band of the Rohnerville Rancheria, Cali",
  },
  {
    value: "140",
    label: "Los Coyotes Band of Cahuilla Mission Indians of th",
  },
  {
    value: "141",
    label: "Lovelock Paiute Tribe of the Lovelock Indian Colon",
  },
  {
    value: "142",
    label: "Lower Brule Sioux Tribe of the Lower Brule Reserva",
  },
  {
    value: "143",
    label: "Lower Elwha Tribal Community of the Lower Elwha Re",
  },
  {
    value: "144",
    label: "Lower Sioux Indian Community of Minnesota Mdewakan",
  },
  {
    value: "145",
    label: "Lummi Tribe of the Lummi Reservation, Washington",
  },
  {
    value: "146",
    label: "Lytton Rancheria of California",
  },
  {
    value: "147",
    label: "Makah Indian Tribe of the Makah Indian Reservation",
  },
  {
    value: "148",
    label: "Manchester Band of Pomo Indians of the Manchester-",
  },
  {
    value: "149",
    label: "Manzanita Band of Diegueno Mission Indians of the",
  },
  {
    value: "15",
    label: "Berry Creek Rancheria of Maidu Indians of Californ",
  },
  {
    value: "150",
    label: "Mashantucket Pequot Tribe of Connecticut",
  },
  {
    value: "151",
    label: "Match-e-be-nash-she-wish Band of Pottawatomi India",
  },
  {
    value: "152",
    label: "Mechoopda Indian Tribe of Chico Rancheria, Califor",
  },
  {
    value: "153",
    label: "Menominee Indian Tribe of Wisconsin",
  },
  {
    value: "154",
    label: "Mesa Grande Band of Diegueno Mission Indians of th",
  },
  {
    value: "155",
    label: "Mescalero Apache Tribe of the Mescalero Reservatio",
  },
  {
    value: "156",
    label: "Miami Tribe of Oklahoma",
  },
  {
    value: "157",
    label: "Miccosukee Tribe of Indians of Florida",
  },
  {
    value: "158",
    label: "Middletown Rancheria of Pomo Indians of California",
  },
  {
    value: "159",
    label: "Minnesota Chippewa Tribe, Minnesota (Six component",
  },
  {
    value: "16",
    label: "Big Lagoon Rancheria, California",
  },
  {
    value: "160",
    label: "Bois Forte Band (Nett Lake); Fond du Lac Band; Gra",
  },
  {
    value: "161",
    label: "Mississippi Band of Choctaw Indians, Mississippi",
  },
  {
    value: "162",
    label: "Moapa Band of Paiute Indians of the Moapa River In",
  },
  {
    value: "163",
    label: "Modoc Tribe of Oklahoma",
  },
  {
    value: "164",
    label: "Mohegan Indian Tribe of Connecticut",
  },
  {
    value: "165",
    label: "Mooretown Rancheria of Maidu Indians of California",
  },
  {
    value: "166",
    label: "Morongo Band of Cahuilla Mission Indians of the Mo",
  },
  {
    value: "167",
    label: "Muckleshoot Indian Tribe of the Muckleshoot Reserv",
  },
  {
    value: "168",
    label: "Muscogee (Creek) Nation, Oklahoma",
  },
  {
    value: "169",
    label: "Narragansett Indian Tribe of Rhode Island",
  },
  {
    value: "17",
    label: "Big Pine Band of Owens Valley Paiute Shoshone Indi",
  },
  {
    value: "170",
    label: "Navajo Nation, Arizona, New Mexico & Utah",
  },
  {
    value: "171",
    label: "Nez Perce Tribe of Idaho",
  },
  {
    value: "172",
    label: "Nisqually Indian Tribe of the Nisqually Reservatio",
  },
  {
    value: "173",
    label: "Nooksack Indian Tribe of Washington",
  },
  {
    value: "174",
    label: "Northern Cheyenne Tribe of the Northern Cheyenne I",
  },
  {
    value: "175",
    label: "Northfork Rancheria of Mono Indians of California",
  },
  {
    value: "176",
    label: "Northwestern Band of Shoshoni Nation of Utah (Wash",
  },
  {
    value: "177",
    label: "Oglala Sioux Tribe of the Pine Ridge Reservation,",
  },
  {
    value: "178",
    label: "Omaha Tribe of Nebraska",
  },
  {
    value: "179",
    label: "Oneida Nation of New York",
  },
  {
    value: "18",
    label: "Big Sandy Rancheria of Mono Indians of California",
  },
  {
    value: "180",
    label: "Oneida Tribe of Wisconsin",
  },
  {
    value: "181",
    label: "Onondaga Nation of New York",
  },
  {
    value: "182",
    label: "Osage Tribe, Oklahoma",
  },
  {
    value: "183",
    label: "Ottawa Tribe of Oklahoma",
  },
  {
    value: "184",
    label: "Otoe-Missouria Tribe of Indians, Oklahoma",
  },
  {
    value: "185",
    label: "Paiute Indian Tribe of Utah",
  },
  {
    value: "186",
    label: "Paiute-Shoshone Indians of the Bishop Community of",
  },
  {
    value: "187",
    label: "Paiute-Shoshone Tribe of the Fallon Reservation an",
  },
  {
    value: "188",
    label: "Paiute-Shoshone Indians of the Lone Pine Community",
  },
  {
    value: "189",
    label: "Pala Band of Luiseno Mission Indians of the Pala R",
  },
  {
    value: "19",
    label: "Big Valley Band of Pomo Indians of the Big Valley",
  },
  {
    value: "190",
    label: "Pascua Yaqui Tribe of Arizona",
  },
  {
    value: "191",
    label: "Paskenta Band of Nomlaki Indians of California",
  },
  {
    value: "192",
    label: "Passamaquoddy Tribe of Maine",
  },
  {
    value: "193",
    label: "Pauma Band of Luiseno Mission Indians of the Pauma",
  },
  {
    value: "194",
    label: "Pawnee Nation of Oklahoma",
  },
  {
    value: "195",
    label: "Pechanga Band of Luiseno Mission Indians of the Pe",
  },
  {
    value: "196",
    label: "Penobscot Tribe of Maine",
  },
  {
    value: "197",
    label: "Peoria Tribe of Indians of Oklahoma",
  },
  {
    value: "198",
    label: "Picayune Rancheria of Chukchansi Indians of Califo",
  },
  {
    value: "199",
    label: "Pinoleville Rancheria of Pomo Indians of Californi",
  },
  {
    value: "2",
    label: "Agua Caliente Band of Cahuilla Indians of the Agua",
  },
  {
    value: "20",
    label: "Blackfeet Tribe of the Blackfeet Indian Reservatio",
  },
  {
    value: "200",
    label: "Pit River Tribe, California (includes Big Bend, Lo",
  },
  {
    value: "201",
    label: "Poarch Band of Creek Indians of Alabama",
  },
  {
    value: "202",
    label: "Pokagon Band of Potawatomi Indians of Michigan",
  },
  {
    value: "203",
    label: "Ponca Tribe of Indians of Oklahoma",
  },
  {
    value: "204",
    label: "Ponca Tribe of Nebraska",
  },
  {
    value: "205",
    label: "Port Gamble Indian Community of the Port Gamble Re",
  },
  {
    value: "206",
    label: "Potter Valley Rancheria of Pomo Indians of Califor",
  },
  {
    value: "207",
    label: "Prairie Band of Potawatomi Indians, Kansas",
  },
  {
    value: "208",
    label: "Prairie Island Indian Community of Minnesota Mdewa",
  },
  {
    value: "209",
    label: "Pueblo of Acoma, New Mexico",
  },
  {
    value: "21",
    label: "Blue Lake Rancheria, California",
  },
  {
    value: "210",
    label: "Pueblo of Cochiti, New Mexico",
  },
  {
    value: "211",
    label: "Pueblo of Jemez, New Mexico",
  },
  {
    value: "212",
    label: "Pueblo of Isleta, New Mexico",
  },
  {
    value: "213",
    label: "Pueblo of Laguna, New Mexico",
  },
  {
    value: "214",
    label: "Pueblo of Nambe, New Mexico",
  },
  {
    value: "215",
    label: "Pueblo of Picuris, New Mexico",
  },
  {
    value: "216",
    label: "Pueblo of Pojoaque, New Mexico",
  },
  {
    value: "217",
    label: "Pueblo of San Felipe, New Mexico",
  },
  {
    value: "218",
    label: "Pueblo of San Juan, New Mexico",
  },
  {
    value: "219",
    label: "Pueblo of San Ildefonso, New Mexico",
  },
  {
    value: "22",
    label: "Bridgeport Paiute Indian Colony of California",
  },
  {
    value: "220",
    label: "Pueblo of Sandia, New Mexico",
  },
  {
    value: "221",
    label: "Pueblo of Santa Ana, New Mexico",
  },
  {
    value: "222",
    label: "Pueblo of Santa Clara, New Mexico",
  },
  {
    value: "223",
    label: "Pueblo of Santo Domingo, New Mexico",
  },
  {
    value: "224",
    label: "Pueblo of Taos, New Mexico",
  },
  {
    value: "225",
    label: "Pueblo of Tesuque, New Mexico",
  },
  {
    value: "226",
    label: "Pueblo of Zia, New Mexico",
  },
  {
    value: "227",
    label: "Puyallup Tribe of the Puyallup Reservation, Washin",
  },
  {
    value: "228",
    label: "Pyramid Lake Paiute Tribe of the Pyramid Lake Rese",
  },
  {
    value: "229",
    label: "Quapaw Tribe of Indians, Oklahoma",
  },
  {
    value: "23",
    label: "Buena Vista Rancheria of Me-Wuk Indians of Califor",
  },
  {
    value: "230",
    label: "Quartz Valley Indian Community of the Quartz Valle",
  },
  {
    value: "231",
    label: "Quechan Tribe of the Fort Yuma Indian Reservation,",
  },
  {
    value: "232",
    label: "Quileute Tribe of the Quileute Reservation, Washin",
  },
  {
    value: "233",
    label: "Quinault Tribe of the Quinault Reservation, Washin",
  },
  {
    value: "234",
    label: "Ramona Band or Village of Cahuilla Mission Indians",
  },
  {
    value: "235",
    label: "Red Cliff Band of Lake Superior Chippewa Indians o",
  },
  {
    value: "236",
    label: "Red Lake Band of Chippewa Indians of the Red Lake",
  },
  {
    value: "237",
    label: "Redding Rancheria, California",
  },
  {
    value: "238",
    label: "Redwood Valley Rancheria of Pomo Indians of Califo",
  },
  {
    value: "239",
    label: "Reno-Sparks Indian Colony, Nevada",
  },
  {
    value: "24",
    label: "Burns Paiute Tribe of the Burns Paiute Indian Colo",
  },
  {
    value: "240",
    label: "Resighini Rancheria, California (formerly known as",
  },
  {
    value: "241",
    label: "Rincon Band of Luiseno Mission Indians of the Rinc",
  },
  {
    value: "242",
    label: "Robinson Rancheria of Pomo Indians of California",
  },
  {
    value: "243",
    label: "Rosebud Sioux Tribe of the Rosebud Indian Reservat",
  },
  {
    value: "244",
    label: "Round Valley Indian Tribes of the Round Valley Res",
  },
  {
    value: "245",
    label: "Rumsey Indian Rancheria of Wintun Indians of Calif",
  },
  {
    value: "246",
    label: "Sac and Fox Tribe of the Mississippi in Iowa",
  },
  {
    value: "247",
    label: "Sac and Fox Nation of Missouri in Kansas and Nebra",
  },
  {
    value: "248",
    label: "Sac and Fox Nation, Oklahoma",
  },
  {
    value: "249",
    label: "Saginaw Chippewa Indian Tribe of Michigan, Isabell",
  },
  {
    value: "25",
    label: "Cabazon Band of Cahuilla Mission Indians of the Ca",
  },
  {
    value: "250",
    label: "Salt River Pima-Maricopa Indian Community of the S",
  },
  {
    value: "251",
    label: "Samish Indian Tribe, Washington",
  },
  {
    value: "252",
    label: "San Carlos Apache Tribe of the San Carlos Reservat",
  },
  {
    value: "253",
    label: "San Juan Southern Paiute Tribe of Arizona",
  },
  {
    value: "254",
    label: "San Manual Band of Serrano Mission Indians of the",
  },
  {
    value: "255",
    label: "San Pasqual Band of Diegueno Mission Indians of Ca",
  },
  {
    value: "256",
    label: "Santa Rosa Indian Community of the Santa Rosa Ranc",
  },
  {
    value: "257",
    label: "Santa Rosa Band of Cahuilla Mission Indians of the",
  },
  {
    value: "258",
    label: "Santa Ynez Band of Chumash Mission Indians of the",
  },
  {
    value: "259",
    label: "Santa Ysabel Band of Diegueno Mission Indians of t",
  },
  {
    value: "26",
    label: "Cachil DeHe Band of Wintun Indians of the Colusa I",
  },
  {
    value: "260",
    label: "Santee Sioux Tribe of the Santee Reservation of Ne",
  },
  {
    value: "261",
    label: "Sauk-Suiattle Indian Tribe of Washington",
  },
  {
    value: "262",
    label: "Sault Ste. Marie Tribe of Chippewa Indians of Mich",
  },
  {
    value: "263",
    label: "Scotts Valley Band of Pomo Indians of California",
  },
  {
    value: "264",
    label: "Seminole Nation of Oklahoma",
  },
  {
    value: "265",
    label: "Seminole Tribe of Florida, Dania, Big Cypress, Bri",
  },
  {
    value: "266",
    label: "Seneca Nation of New York",
  },
  {
    value: "267",
    label: "Seneca-Cayuga Tribe of Oklahoma",
  },
  {
    value: "268",
    label: "Shakopee Mdewakanton Sioux Community of Minnesota",
  },
  {
    value: "269",
    label: "Shawnee Tribe, Oklahoma",
  },
  {
    value: "27",
    label: "Caddo Indian Tribe of Oklahoma",
  },
  {
    value: "270",
    label: "Sherwood Valley Rancheria of Pomo Indians of Calif",
  },
  {
    value: "271",
    label: "Shingle Springs Band of Miwok Indians, Shingle Spr",
  },
  {
    value: "272",
    label: "Shoalwater Bay Tribe of the Shoalwater Bay Indian",
  },
  {
    value: "273",
    label: "Shoshone Tribe of the Wind River Reservation, Wyom",
  },
  {
    value: "274",
    label: "Shoshone-Bannock Tribes of the Fort Hall Reservati",
  },
  {
    value: "275",
    label: "Shoshone-Paiute Tribes of the Duck Valley Reservat",
  },
  {
    value: "276",
    label: "Sisseton-Wahpeton Sioux Tribe of the Lake Traverse",
  },
  {
    value: "277",
    label: "Skokomish Indian Tribe of the Skokomish Reservatio",
  },
  {
    value: "278",
    label: "Skull Valley Band of Goshute Indians of Utah",
  },
  {
    value: "279",
    label: "Smith River Rancheria, California",
  },
  {
    value: "28",
    label: "Cahuilla Band of Mission Indians of the Cahuilla R",
  },
  {
    value: "280",
    label: "Snoqualmie Tribe, Washington",
  },
  {
    value: "281",
    label: "Soboba Band of Luiseno Indians, California (former",
  },
  {
    value: "282",
    label: "Sokaogon Chippewa Community of the Mole Lake Band",
  },
  {
    value: "283",
    label: "Southern Ute Indian Tribe of the Southern Ute Rese",
  },
  {
    value: "284",
    label: "Spirit Lake Tribe, North Dakota (formerly known as",
  },
  {
    value: "285",
    label: "Spokane Tribe of the Spokane Reservation, Washingt",
  },
  {
    value: "286",
    label: "Squaxin Island Tribe of the Squaxin Island Reserva",
  },
  {
    value: "287",
    label: "St. Croix Chippewa Indians of Wisconsin, St. Croix",
  },
  {
    value: "288",
    label: "St. Regis Band of Mohawk Indians of New York",
  },
  {
    value: "289",
    label: "Standing Rock Sioux Tribe of North & South Dakota",
  },
  {
    value: "29",
    label: "Cahto Indian Tribe of the Laytonville Rancheria, C",
  },
  {
    value: "290",
    label: "Stockbridge-Munsee Community of Mohican Indians of",
  },
  {
    value: "291",
    label: "Stillaguamish Tribe of Washington",
  },
  {
    value: "292",
    label: "Summit Lake Paiute Tribe of Nevada",
  },
  {
    value: "293",
    label: "Suquamish Indian Tribe of the Port Madison Reserva",
  },
  {
    value: "294",
    label: "Susanville Indian Rancheria, California",
  },
  {
    value: "295",
    label: "Swinomish Indians of the Swinomish Reservation, Wa",
  },
  {
    value: "296",
    label: "Sycuan Band of Diegueno Mission Indians of Califor",
  },
  {
    value: "297",
    label: "Table Bluff Reservation - Wiyot Tribe, California",
  },
  {
    value: "298",
    label: "Table Mountain Rancheria of California",
  },
  {
    value: "299",
    label: "Te-Moak Tribe of Western Shoshone Indians of Nevad",
  },
  {
    value: "3",
    label: "Ak Chin Indian Community of the Maricopa (Ak Chin)",
  },
  {
    value: "30",
    label: "California Valley Miwok Tribe, California (formerl",
  },
  {
    value: "300",
    label: "Thlopthlocco Tribal Town, Oklahoma",
  },
  {
    value: "301",
    label: "Three Affiliated Tribes of the Fort Berthold Reser",
  },
  {
    value: "302",
    label: "Tohono O'odham Nation of Arizona",
  },
  {
    value: "303",
    label: "Tonawanda Band of Seneca Indians of New York",
  },
  {
    value: "304",
    label: "Tonkawa Tribe of Indians of Oklahoma",
  },
  {
    value: "305",
    label: "Tonto Apache Tribe of Arizona",
  },
  {
    value: "306",
    label: "Torres-Martinez Band of Cahuilla Mission Indians o",
  },
  {
    value: "307",
    label: "Tule River Indian Tribe of the Tule River Reservat",
  },
  {
    value: "308",
    label: "Tulalip Tribes of the Tulalip Reservation, Washing",
  },
  {
    value: "309",
    label: "Tunica-Biloxi Indian Tribe of Louisiana",
  },
  {
    value: "31",
    label: "Campo Band of Diegueno Mission Indians of the Camp",
  },
  {
    value: "310",
    label: "Tuolumne Band of Me-Wuk Indians of the Tuolumne Ra",
  },
  {
    value: "311",
    label: "Turtle Mountain Band of Chippewa Indians of North",
  },
  {
    value: "312",
    label: "Tuscarora Nation of New York",
  },
  {
    value: "313",
    label: "Twenty-Nine Palms Band of Mission Indians of Calif",
  },
  {
    value: "314",
    label: "United Auburn Indian Community of the Auburn Ranch",
  },
  {
    value: "315",
    label: "United Keetoowah Band of Cherokee Indians of Oklah",
  },
  {
    value: "316",
    label: "Upper Lake Band of Pomo Indians of Upper Lake Ranc",
  },
  {
    value: "317",
    label: "Upper Sioux Indian Community of the Upper Sioux Re",
  },
  {
    value: "318",
    label: "Upper Skagit Indian Tribe of Washington",
  },
  {
    value: "319",
    label: "Ute Indian Tribe of the Uintah & Ouray Reservation",
  },
  {
    value: "32",
    label: "Capitan Grande Band of Diegueno Mission Indians of",
  },
  {
    value: "320",
    label: "Ute Mountain Tribe of the Ute Mountain Reservation",
  },
  {
    value: "321",
    label: "Utu Utu Gwaitu Paiute Tribe of the Benton Paiute R",
  },
  {
    value: "322",
    label: "Walker River Paiute Tribe of the Walker River Rese",
  },
  {
    value: "323",
    label: "Wampanoag Tribe of Gay Head (Aquinnah) of Massachu",
  },
  {
    value: "324",
    label: "Washoe Tribe of Nevada & California (Carson Colony",
  },
  {
    value: "325",
    label: "White Mountain Apache Tribe of the Fort Apache Res",
  },
  {
    value: "326",
    label: "Wichita and Affiliated Tribes (Wichita, Keechi, Wa",
  },
  {
    value: "327",
    label: "Winnebago Tribe of Nebraska",
  },
  {
    value: "328",
    label: "Winnemucca Indian Colony of Nevada",
  },
  {
    value: "329",
    label: "Wyandotte Tribe of Oklahoma",
  },
  {
    value: "33",
    label: "Barona Group of Capitan Grande Band of Mission Ind",
  },
  {
    value: "330",
    label: "Yankton Sioux Tribe of South Dakota",
  },
  {
    value: "331",
    label: "Yavapai-Apache Nation of the Camp Verde Indian Res",
  },
  {
    value: "332",
    label: "Yavapai-Prescott Tribe of the Yavapai Reservation,",
  },
  {
    value: "333",
    label: "Yerington Paiute Tribe of the Yerington Colony & C",
  },
  {
    value: "334",
    label: "Yomba Shoshone Tribe of the Yomba Reservation, Nev",
  },
  {
    value: "335",
    label: "Ysleta Del Sur Pueblo of Texas",
  },
  {
    value: "336",
    label: "Yurok Tribe of the Yurok Reservation, California",
  },
  {
    value: "337",
    label: "Zuni Tribe of the Zuni Reservation, New Mexico",
  },
  {
    value: "34",
    label: "Viejas (Baron Long) Group of Capitan Grande Band o",
  },
  {
    value: "35",
    label: "Catawba Indian Nation (aka Catawba Tribe of South",
  },
  {
    value: "36",
    label: "Cayuga Nation of New York",
  },
  {
    value: "37",
    label: "Cedarville Rancheria, California",
  },
  {
    value: "38",
    label: "Chemehuevi Indian Tribe of the Chemehuevi Reservat",
  },
  {
    value: "39",
    label: "Cher-Ae Heights Indian Community of the Trinidad R",
  },
  {
    value: "4",
    label: "Alabama-Coushatta Tribes of Texas",
  },
  {
    value: "40",
    label: "Cherokee Nation, Oklahoma",
  },
  {
    value: "41",
    label: "Cheyenne-Arapaho Tribes of Oklahoma",
  },
  {
    value: "42",
    label: "Cheyenne River Sioux Tribe of the Cheyenne River",
  },
  {
    value: "43",
    label: "Chickasaw Nation, Oklahoma",
  },
  {
    value: "44",
    label: "Chicken Ranch Rancheria of Me-Wuk Indians of Calif",
  },
  {
    value: "45",
    label: "Chippewa-Cree Indians of the Rocky Boy's Reservati",
  },
  {
    value: "46",
    label: "Chitimacha Tribe of Louisiana",
  },
  {
    value: "47",
    label: "Choctaw Nation of Oklahoma",
  },
  {
    value: "48",
    label: "Citizen Potawatomi Nation, Oklahoma",
  },
  {
    value: "49",
    label: "Cloverdale Rancheria of Pomo Indians of California",
  },
  {
    value: "5",
    label: "Alabama-Quassarte Tribal Town, Oklahoma",
  },
  {
    value: "50",
    label: "Cocopah Tribe of Arizona",
  },
  {
    value: "51",
    label: "Coeur D'Alene Tribe of the Coeur D'Alene Reservati",
  },
  {
    value: "52",
    label: "Cold Springs Rancheria of Mono Indians of Californ",
  },
  {
    value: "53",
    label: "Colorado River Indian Tribes of the Colorado River",
  },
  {
    value: "54",
    label: "Comanche Indian Tribe, Oklahoma",
  },
  {
    value: "55",
    label: "Confederated Salish & Kootenai Tribes of the Flath",
  },
  {
    value: "56",
    label: "Confederated Tribes of the Chehalis Reservation, W",
  },
  {
    value: "57",
    label: "Confederated Tribes of the Colville Reservation, W",
  },
  {
    value: "58",
    label: "Confederated Tribes of the Coos, Lower Umpqua and",
  },
  {
    value: "59",
    label: "Confederated Tribes of the Goshute Reservation, Ne",
  },
  {
    value: "6",
    label: "Alturas Indian Rancheria, California",
  },
  {
    value: "60",
    label: "Confederated Tribes of the Grand Ronde Community o",
  },
  {
    value: "61",
    label: "Confederated Tribes of the Siletz Reservation, Ore",
  },
  {
    value: "62",
    label: "Confederated Tribes of the Umatilla Reservation, O",
  },
  {
    value: "63",
    label: "Confederated Tribes of the Warm Springs Reservatio",
  },
  {
    value: "64",
    label: "Confederated Tribes and Bands of the Yakama Indian",
  },
  {
    value: "65",
    label: "Coquille Tribe of Oregon",
  },
  {
    value: "66",
    label: "Cortina Indian Rancheria of Wintun Indians of Cali",
  },
  {
    value: "67",
    label: "Coushatta Tribe of Louisiana",
  },
  {
    value: "68",
    label: "Cow Creek Band of Umpqua Indians of Oregon",
  },
  {
    value: "69",
    label: "Coyote Valley Band of Pomo Indians of California",
  },
  {
    value: "7",
    label: "Apache Tribe of Oklahoma",
  },
  {
    value: "70",
    label: "Crow Tribe of Montana",
  },
  {
    value: "71",
    label: "Crow Creek Sioux Tribe of the Crow Creek Reservati",
  },
  {
    value: "72",
    label: "Cuyapaipe Community of Diegueno Mission Indians of",
  },
  {
    value: "73",
    label: "Death Valley Timbi-Sha Shoshone Band of California",
  },
  {
    value: "74",
    label: "Delaware Nation, Oklahoma (formerly Delaware Tribe",
  },
  {
    value: "75",
    label: "Delaware Tribe of Indians, Oklahoma",
  },
  {
    value: "76",
    label: "Dry Creek Rancheria of Pomo Indians of California",
  },
  {
    value: "77",
    label: "Duckwater Shoshone Tribe of the Duckwater Reservat",
  },
  {
    value: "78",
    label: "Eastern Band of Cherokee Indians of North Carolina",
  },
  {
    value: "79",
    label: "Eastern Shawnee Tribe of Oklahoma",
  },
  {
    value: "8",
    label: "Arapahoe Tribe of the Wind River Reservation, Wyom",
  },
  {
    value: "80",
    label: "Elem Indian Colony of Pomo Indians of the Sulphur",
  },
  {
    value: "81",
    label: "Elk Valley Rancheria, California",
  },
  {
    value: "82",
    label: "Ely Shoshone Tribe of Nevada",
  },
  {
    value: "83",
    label: "Enterprise Rancheria of Maidu Indians of Californi",
  },
  {
    value: "84",
    label: "Flandreau Santee Sioux Tribe of South Dakota",
  },
  {
    value: "85",
    label: "Forest County Potawatomi Community of Wisconsin Po",
  },
  {
    value: "86",
    label: "Fort Belknap Indian Community of the Fort Belknap",
  },
  {
    value: "87",
    label: "Fort Bidwell Indian Community of the Fort Bidwell",
  },
  {
    value: "88",
    label: "Fort Independence Indian Community of Paiute India",
  },
  {
    value: "89",
    label: "Fort McDermitt Paiute and Shoshone Tribes of the F",
  },
  {
    value: "9",
    label: "Aroostook Band of Micmac Indians of Maine",
  },
  {
    value: "90",
    label: "Fort McDowell Yavapai Nation, Arizona (formerly th",
  },
  {
    value: "91",
    label: "Fort Mojave Indian Tribe of Arizona, California",
  },
  {
    value: "92",
    label: "Fort Sill Apache Tribe of Oklahoma",
  },
  {
    value: "93",
    label: "Gila River Indian Community of the Gila River Indi",
  },
  {
    value: "94",
    label: "Grand Traverse Band of Ottawa & Chippewa Indians o",
  },
  {
    value: "95",
    label: "Graton Rancheria, California",
  },
  {
    value: "96",
    label: "Greenville Rancheria of Maidu Indians of Californi",
  },
  {
    value: "97",
    label: "Grindstone Indian Rancheria of Wintun-Wailaki Indi",
  },
  {
    value: "98",
    label: "Guidiville Rancheria of California",
  },
  {
    value: "99",
    label: "Hannahville Indian Community of Wisconsin Potawato",
  },
];
export const TRIBAL_AFFILIATION_VALUES: {
  value: TribalAffiliation;
  label: string;
}[] = process.env.REACT_APP_E2E_TRIBAL_AFFILIATION_BYPASS
  ? fullTribalAffiliationValueSet.slice(0, 10)
  : fullTribalAffiliationValueSet;

import { TFunction } from "i18next";

import { TestResult } from "../testQueue/QueueItem";
import i18n from "../../i18n";

export const DATE_FORMAT_MM_DD_YYYY =
  "^([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})|([0-9]{1,2}-[0-9]{1,2}-[0-9]{4})|([0-9]{8})$";

export const COVID_RESULTS: { [key: string]: TestResult } = {
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
  INCONCLUSIVE: "UNDETERMINED",
  UNKNOWN: "UNKNOWN",
};

const testResultDescriptions = (t: TFunction) => {
  const result: Record<TestResult, string> = {
    NEGATIVE: i18n.t("constants.testResults.NEGATIVE"),
    POSITIVE: i18n.t("constants.testResults.POSITIVE"),
    UNDETERMINED: i18n.t("constants.testResults.UNDETERMINED"),
    UNKNOWN: i18n.t("constants.testResults.UNKNOWN"),
  };

  return result;
};

const raceValues = (t: TFunction) => {
  const result: { value: Race; label: string }[] = [
    { value: "native", label: i18n.t("constants.race.native") },
    { value: "asian", label: i18n.t("constants.race.asian") },
    { value: "black", label: i18n.t("constants.race.black") },
    { value: "pacific", label: i18n.t("constants.race.pacific") },
    { value: "white", label: i18n.t("constants.race.white") },
    { value: "other", label: i18n.t("constants.race.other") },
    { value: "refused", label: i18n.t("constants.race.refused") },
  ];

  return result;
};

const roleValues = (t: TFunction) => {
  const result: { value: Role; label: string }[] = [
    { label: i18n.t("constants.role.STAFF"), value: "STAFF" },
    { label: i18n.t("constants.role.RESIDENT"), value: "RESIDENT" },
    { label: i18n.t("constants.role.STUDENT"), value: "STUDENT" },
    { label: i18n.t("constants.role.VISITOR"), value: "VISITOR" },
  ];

  return result;
};

const ethnicityValues = (t: TFunction) => {
  const result: { value: Ethnicity; label: string }[] = [
    { label: i18n.t("constants.ethnicity.hispanic"), value: "hispanic" },
    {
      label: i18n.t("constants.ethnicity.not_hispanic"),
      value: "not_hispanic",
    },
    { label: i18n.t("constants.ethnicity.refused"), value: "refused" },
  ];

  return result;
};

const genderValues = (t: TFunction) => {
  const result: { value: Gender; label: string }[] = [
    { label: i18n.t("constants.gender.female"), value: "female" },
    { label: i18n.t("constants.gender.male"), value: "male" },
    { label: i18n.t("constants.gender.other"), value: "other" },
    { label: i18n.t("constants.gender.refused"), value: "refused" },
  ];

  return result;
};

const yesNoValues = (t: TFunction) => {
  const result: { value: YesNo; label: string }[] = [
    { label: i18n.t("constants.yesNoUnk.YES"), value: "YES" },
    { label: i18n.t("constants.yesNoUnk.NO"), value: "NO" },
  ];

  return result;
};

const phoneTypeValues = (t: TFunction) => {
  const result: { value: PhoneType; label: string }[] = [
    { label: i18n.t("constants.phoneType.MOBILE"), value: "MOBILE" },
    { label: i18n.t("constants.phoneType.LANDLINE"), value: "LANDLINE" },
  ];

  return result;
};

const testResultDeliveryPreferenceValues = (t: TFunction) => {
  const result: {
    value: TestResultDeliveryPreference;
    label: string;
  }[] = [
    { label: i18n.t("constants.yesNoUnk.YES"), value: "SMS" },
    { label: i18n.t("constants.yesNoUnk.NO"), value: "NONE" },
  ];

  return result;
};

const yesNoUnkownValues = (t: TFunction) => {
  const result: {
    value: YesNoUnknown;
    label: string;
  }[] = [
    ...yesNoValues(i18n.t),
    { value: "UNKNOWN", label: i18n.t("constants.yesNoUnk.UNKNOWN") },
  ];

  return result;
};

const fullTribalAffiliationValueSetMap: { [key: string]: TribalAffiliation } = {
  "Village of Afognak": "338",
  "Agdaagux Tribe of King Cove": "339",
  "Native Village of Akhiok": "340",
  "Akiachak Native Community": "341",
  "Akiak Native Community": "342",
  "Native Village of Akutan": "343",
  "Village of Alakanuk": "344",
  "Alatna Village": "345",
  "Native Village of Aleknagik": "346",
  "Algaaciq Native Village (St. Mary's)": "347",
  "Allakaket Village": "348",
  "Native Village of Ambler": "349",
  "Village of Anaktuvuk Pass": "350",
  "Yupiit of Andreafski": "351",
  "Angoon Community Association": "352",
  "Village of Aniak": "353",
  "Anvik Village": "354",
  "Arctic Village (See Native Village of Venetie Trib": "355",
  "Asa carsarmiut Tribe (formerly Native Village of M": "356",
  "Native Village of Atka": "357",
  "Village of Atmautluak": "358",
  "Atqasuk Village (Atkasook)": "359",
  "Native Village of Barrow Inupiat Traditional Gover": "360",
  "Beaver Village": "361",
  "Native Village of Belkofski": "362",
  "Village of Bill Moore's Slough": "363",
  "Birch Creek Tribe": "364",
  "Native Village of Brevig Mission": "365",
  "Native Village of Buckland": "366",
  "Native Village of Cantwell": "367",
  "Native Village of Chanega (aka Chenega)": "368",
  "Chalkyitsik Village": "369",
  "Village of Chefornak": "370",
  "Chevak Native Village": "371",
  "Chickaloon Native Village": "372",
  "Native Village of Chignik": "373",
  "Native Village of Chignik Lagoon": "374",
  "Chignik Lake Village": "375",
  "Chilkat Indian Village (Klukwan)": "376",
  "Chilkoot Indian Association (Haines)": "377",
  "Chinik Eskimo Community (Golovin)": "378",
  "Native Village of Chistochina": "379",
  "Native Village of Chitina": "380",
  "Native Village of Chuathbaluk (Russian Mission, Ku": "381",
  "Chuloonawick Native Village": "382",
  "Circle Native Community": "383",
  "Village of Clark's Point": "384",
  "Native Village of Council": "385",
  "Craig Community Association": "386",
  "Village of Crooked Creek": "387",
  "Curyung Tribal Council (formerly Native Village of": "388",
  "Native Village of Deering": "389",
  "Native Village of Diomede (aka Inalik)": "390",
  "Village of Dot Lake": "391",
  "Douglas Indian Association": "392",
  "Native Village of Eagle": "393",
  "Native Village of Eek": "394",
  "Egegik Village": "395",
  "Eklutna Native Village": "396",
  "Native Village of Ekuk": "397",
  "Ekwok Village": "398",
  "Native Village of Elim": "399",
  "Emmonak Village": "400",
  "Evansville Village (aka Bettles Field)": "401",
  "Native Village of Eyak (Cordova)": "402",
  "Native Village of False Pass": "403",
  "Native Village of Fort Yukon": "404",
  "Native Village of Gakona": "405",
  "Galena Village (aka Louden Village)": "406",
  "Native Village of Gambell": "407",
  "Native Village of Georgetown": "408",
  "Native Village of Goodnews Bay": "409",
  "Organized Village of Grayling (aka Holikachuk)": "410",
  "Gulkana Village": "411",
  "Native Village of Hamilton": "412",
  "Healy Lake Village": "413",
  "Holy Cross Village": "414",
  "Hoonah Indian Association": "415",
  "Native Village of Hooper Bay": "416",
  "Hughes Village": "417",
  "Huslia Village": "418",
  "Hydaburg Cooperative Association": "419",
  "Igiugig Village": "420",
  "Village of Iliamna": "421",
  "Inupiat Community of the Arctic Slope": "422",
  "Iqurmuit Traditional Council (formerly Native Vill": "423",
  "Ivanoff Bay Village": "424",
  "Kaguyak Village": "425",
  "Organized Village of Kake": "426",
  "Kaktovik Village (aka Barter Island)": "427",
  "Village of Kalskag": "428",
  "Village of Kaltag": "429",
  "Native Village of Kanatak": "430",
  "Native Village of Karluk": "431",
  "Organized Village of Kasaan": "432",
  "Native Village of Kasigluk": "433",
  "Kenaitze Indian Tribe": "434",
  "Ketchikan Indian Corporation": "435",
  "Native Village of Kiana": "436",
  "King Island Native Community": "437",
  "King Salmon Tribe": "438",
  "Native Village of Kipnuk": "439",
  "Native Village of Kivalina": "440",
  "Klawock Cooperative Association": "441",
  "Native Village of Kluti Kaah (aka Copper Center)": "442",
  "Knik Tribe": "443",
  "Native Village of Kobuk": "444",
  "Kokhanok Village": "445",
  "Native Village of Kongiganak": "446",
  "Village of Kotlik": "447",
  "Native Village of Kotzebue": "448",
  "Native Village of Koyuk": "449",
  "Koyukuk Native Village": "450",
  "Organized Village of Kwethluk": "451",
  "Native Village of Kwigillingok": "452",
  "Native Village of Kwinhagak (aka Quinhagak)": "453",
  "Native Village of Larsen Bay": "454",
  "Levelock Village": "455",
  "Lesnoi Village (aka Woody Island)": "456",
  "Lime Village": "457",
  "Village of Lower Kalskag": "458",
  "Manley Hot Springs Village": "459",
  "Manokotak Village": "460",
  "Native Village of Marshall (aka Fortuna Ledge)": "461",
  "Native Village of Mary's Igloo": "462",
  "McGrath Native Village": "463",
  "Native Village of Mekoryuk": "464",
  "Mentasta Traditional Council": "465",
  "Metlakatla Indian Community, Annette Island Reserv": "466",
  "Native Village of Minto": "467",
  "Naknek Native Village": "468",
  "Native Village of Nanwalek (aka English Bay)": "469",
  "Native Village of Napaimute": "470",
  "Native Village of Napakiak": "471",
  "Native Village of Napaskiak": "472",
  "Native Village of Nelson Lagoon": "473",
  "Nenana Native Association": "474",
  "New Koliganek Village Council (formerly Koliganek": "475",
  "New Stuyahok Village": "476",
  "Newhalen Village": "477",
  "Newtok Village": "478",
  "Native Village of Nightmute": "479",
  "Nikolai Village": "480",
  "Native Village of Nikolski": "481",
  "Ninilchik Village": "482",
  "Native Village of Noatak": "483",
  "Nome Eskimo Community": "484",
  "Nondalton Village": "485",
  "Noorvik Native Community": "486",
  "Northway Village": "487",
  "Native Village of Nuiqsut (aka Nooiksut)": "488",
  "Nulato Village": "489",
  "Nunakauyarmiut Tribe (formerly Native Village of T": "490",
  "Native Village of Nunapitchuk": "491",
  "Village of Ohogamiut": "492",
  "Village of Old Harbor": "493",
  "Orutsararmuit Native Village (aka Bethel)": "494",
  "Oscarville Traditional Village": "495",
  "Native Village of Ouzinkie": "496",
  "Native Village of Paimiut": "497",
  "Pauloff Harbor Village": "498",
  "Pedro Bay Village": "499",
  "Native Village of Perryville": "500",
  "Petersburg Indian Association": "501",
  "Native Village of Pilot Point": "502",
  "Pilot Station Traditional Village": "503",
  "Native Village of Pitka's Point": "504",
  "Platinum Traditional Village": "505",
  "Native Village of Point Hope": "506",
  "Native Village of Point Lay": "507",
  "Native Village of Port Graham": "508",
  "Native Village of Port Heiden": "509",
  "Native Village of Port Lions": "510",
  "Portage Creek Village (aka Ohgsenakale)": "511",
  "Pribilof Islands Aleut Communities of St. Paul & S": "512",
  "Qagan Tayagungin Tribe of Sand Point Village": "513",
  "Qawalangin Tribe of Unalaska": "514",
  "Rampart Village": "515",
  "Village of Red Devil": "516",
  "Native Village of Ruby": "517",
  "Saint George Island(See Pribilof Islands Aleut Com": "518",
  "Native Village of Saint Michael": "519",
  "Saint Paul Island (See Pribilof Islands Aleut Comm": "520",
  "Village of Salamatoff": "521",
  "Native Village of Savoonga": "522",
  "Organized Village of Saxman": "523",
  "Native Village of Scammon Bay": "524",
  "Native Village of Selawik": "525",
  "Seldovia Village Tribe": "526",
  "Shageluk Native Village": "527",
  "Native Village of Shaktoolik": "528",
  "Native Village of Sheldon's Point": "529",
  "Native Village of Shishmaref": "530",
  "Shoonaq Tribe of Kodiak": "531",
  "Native Village of Shungnak": "532",
  "Sitka Tribe of Alaska": "533",
  "Skagway Village": "534",
  "Village of Sleetmute": "535",
  "Village of Solomon": "536",
  "South Naknek Village": "537",
  "Stebbins Community Association": "538",
  "Native Village of Stevens": "539",
  "Village of Stony River": "540",
  "Takotna Village": "541",
  "Native Village of Tanacross": "542",
  "Native Village of Tanana": "543",
  "Native Village of Tatitlek": "544",
  "Native Village of Tazlina": "545",
  "Telida Village": "546",
  "Native Village of Teller": "547",
  "Native Village of Tetlin": "548",
  "Central Council of the Tlingit and Haida Indian Tb": "549",
  "Traditional Village of Togiak": "550",
  "Tuluksak Native Community": "551",
  "Native Village of Tuntutuliak": "552",
  "Native Village of Tununak": "553",
  "Twin Hills Village": "554",
  "Native Village of Tyonek": "555",
  "Ugashik Village": "556",
  "Umkumiute Native Village": "557",
  "Native Village of Unalakleet": "558",
  "Native Village of Unga": "559",
  "Village of Venetie (See Native Village of Venetie": "560",
  "Native Village of Venetie Tribal Government (Arcti": "561",
  "Village of Wainwright": "562",
  "Native Village of Wales": "563",
  "Native Village of White Mountain": "564",
  "Wrangell Cooperative Association": "565",
  "Yakutat Tlingit Tribe": "566",
  "Absentee-Shawnee Tribe of Indians of Oklahoma": "1",
  "Assiniboine and Sioux Tribes of the Fort Peck Indi": "10",
  "Havasupai Tribe of the Havasupai Reservation, Ariz": "100",
  "Ho-Chunk Nation of Wisconsin (formerly known as th": "101",
  "Hoh Indian Tribe of the Hoh Indian Reservation, Wa": "102",
  "Hoopa Valley Tribe, California": "103",
  "Hopi Tribe of Arizona": "104",
  "Hopland Band of Pomo Indians of the Hopland Ranche": "105",
  "Houlton Band of Maliseet Indians of Maine": "106",
  "Hualapai Indian Tribe of the Hualapai Indian Reser": "107",
  "Huron Potawatomi, Inc., Michigan": "108",
  "Inaja Band of Diegueno Mission Indians of the Inaj": "109",
  "Augustine Band of Cahuilla Mission Indians of the": "11",
  "Ione Band of Miwok Indians of California": "110",
  "Iowa Tribe of Kansas and Nebraska": "111",
  "Iowa Tribe of Oklahoma": "112",
  "Jackson Rancheria of Me-Wuk Indians of California": "113",
  "Jamestown S'Klallam Tribe of Washington": "114",
  "Jamul Indian Village of California": "115",
  "Jena Band of Choctaw Indians, Louisiana": "116",
  "Jicarilla Apache Tribe of the Jicarilla Apache Ind": "117",
  "Kaibab Band of Paiute Indians of the Kaibab Indian": "118",
  "Kalispel Indian Community of the Kalispel Reservat": "119",
  "Bad River Band of the Lake Superior Tribe of Chipp": "12",
  "Karuk Tribe of California": "120",
  "Kashia Band of Pomo Indians of the Stewarts Point": "121",
  "Kaw Nation, Oklahoma": "122",
  "Keweenaw Bay Indian Community of L'Anse and Ontona": "123",
  "Kialegee Tribal Town, Oklahoma": "124",
  "Kickapoo Tribe of Indians of the Kickapoo Reservat": "125",
  "Kickapoo Tribe of Oklahoma": "126",
  "Kickapoo Traditional Tribe of Texas": "127",
  "Kiowa Indian Tribe of Oklahoma": "128",
  "Klamath Indian Tribe of Oregon": "129",
  "Bay Mills Indian Community of the Sault Ste. Marie": "13",
  "Kootenai Tribe of Idaho": "130",
  "La Jolla Band of Luiseno Mission Indians of the La": "131",
  "La Posta Band of Diegueno Mission Indians of the L": "132",
  "Lac Courte Oreilles Band of Lake Superior Chippewa": "133",
  "Lac du Flambeau Band of Lake Superior Chippewa Ind": "134",
  "Lac Vieux Desert Band of Lake Superior Chippewa In": "135",
  "Las Vegas Tribe of Paiute Indians of the Las Vegas": "136",
  "Little River Band of Ottawa Indians of Michigan": "137",
  "Little Traverse Bay Bands of Odawa Indians of Mich": "138",
  "Lower Lake Rancheria, California": "139",
  "Bear River Band of the Rohnerville Rancheria, Cali": "14",
  "Los Coyotes Band of Cahuilla Mission Indians of th": "140",
  "Lovelock Paiute Tribe of the Lovelock Indian Colon": "141",
  "Lower Brule Sioux Tribe of the Lower Brule Reserva": "142",
  "Lower Elwha Tribal Community of the Lower Elwha Re": "143",
  "Lower Sioux Indian Community of Minnesota Mdewakan": "144",
  "Lummi Tribe of the Lummi Reservation, Washington": "145",
  "Lytton Rancheria of California": "146",
  "Makah Indian Tribe of the Makah Indian Reservation": "147",
  "Manchester Band of Pomo Indians of the Manchester-": "148",
  "Manzanita Band of Diegueno Mission Indians of the": "149",
  "Berry Creek Rancheria of Maidu Indians of Californ": "15",
  "Mashantucket Pequot Tribe of Connecticut": "150",
  "Match-e-be-nash-she-wish Band of Pottawatomi India": "151",
  "Mechoopda Indian Tribe of Chico Rancheria, Califor": "152",
  "Menominee Indian Tribe of Wisconsin": "153",
  "Mesa Grande Band of Diegueno Mission Indians of th": "154",
  "Mescalero Apache Tribe of the Mescalero Reservatio": "155",
  "Miami Tribe of Oklahoma": "156",
  "Miccosukee Tribe of Indians of Florida": "157",
  "Middletown Rancheria of Pomo Indians of California": "158",
  "Minnesota Chippewa Tribe, Minnesota (Six component": "159",
  "Big Lagoon Rancheria, California": "16",
  "Bois Forte Band (Nett Lake); Fond du Lac Band; Gra": "160",
  "Mississippi Band of Choctaw Indians, Mississippi": "161",
  "Moapa Band of Paiute Indians of the Moapa River In": "162",
  "Modoc Tribe of Oklahoma": "163",
  "Mohegan Indian Tribe of Connecticut": "164",
  "Mooretown Rancheria of Maidu Indians of California": "165",
  "Morongo Band of Cahuilla Mission Indians of the Mo": "166",
  "Muckleshoot Indian Tribe of the Muckleshoot Reserv": "167",
  "Muscogee (Creek) Nation, Oklahoma": "168",
  "Narragansett Indian Tribe of Rhode Island": "169",
  "Big Pine Band of Owens Valley Paiute Shoshone Indi": "17",
  "Navajo Nation, Arizona, New Mexico & Utah": "170",
  "Nez Perce Tribe of Idaho": "171",
  "Nisqually Indian Tribe of the Nisqually Reservatio": "172",
  "Nooksack Indian Tribe of Washington": "173",
  "Northern Cheyenne Tribe of the Northern Cheyenne I": "174",
  "Northfork Rancheria of Mono Indians of California": "175",
  "Northwestern Band of Shoshoni Nation of Utah (Wash": "176",
  "Oglala Sioux Tribe of the Pine Ridge Reservation,": "177",
  "Omaha Tribe of Nebraska": "178",
  "Oneida Nation of New York": "179",
  "Big Sandy Rancheria of Mono Indians of California": "18",
  "Oneida Tribe of Wisconsin": "180",
  "Onondaga Nation of New York": "181",
  "Osage Tribe, Oklahoma": "182",
  "Ottawa Tribe of Oklahoma": "183",
  "Otoe-Missouria Tribe of Indians, Oklahoma": "184",
  "Paiute Indian Tribe of Utah": "185",
  "Paiute-Shoshone Indians of the Bishop Community of": "186",
  "Paiute-Shoshone Tribe of the Fallon Reservation an": "187",
  "Paiute-Shoshone Indians of the Lone Pine Community": "188",
  "Pala Band of Luiseno Mission Indians of the Pala R": "189",
  "Big Valley Band of Pomo Indians of the Big Valley": "19",
  "Pascua Yaqui Tribe of Arizona": "190",
  "Paskenta Band of Nomlaki Indians of California": "191",
  "Passamaquoddy Tribe of Maine": "192",
  "Pauma Band of Luiseno Mission Indians of the Pauma": "193",
  "Pawnee Nation of Oklahoma": "194",
  "Pechanga Band of Luiseno Mission Indians of the Pe": "195",
  "Penobscot Tribe of Maine": "196",
  "Peoria Tribe of Indians of Oklahoma": "197",
  "Picayune Rancheria of Chukchansi Indians of Califo": "198",
  "Pinoleville Rancheria of Pomo Indians of Californi": "199",
  "Agua Caliente Band of Cahuilla Indians of the Agua": "2",
  "Blackfeet Tribe of the Blackfeet Indian Reservatio": "20",
  "Pit River Tribe, California (includes Big Bend, Lo": "200",
  "Poarch Band of Creek Indians of Alabama": "201",
  "Pokagon Band of Potawatomi Indians of Michigan": "202",
  "Ponca Tribe of Indians of Oklahoma": "203",
  "Ponca Tribe of Nebraska": "204",
  "Port Gamble Indian Community of the Port Gamble Re": "205",
  "Potter Valley Rancheria of Pomo Indians of Califor": "206",
  "Prairie Band of Potawatomi Indians, Kansas": "207",
  "Prairie Island Indian Community of Minnesota Mdewa": "208",
  "Pueblo of Acoma, New Mexico": "209",
  "Blue Lake Rancheria, California": "21",
  "Pueblo of Cochiti, New Mexico": "210",
  "Pueblo of Jemez, New Mexico": "211",
  "Pueblo of Isleta, New Mexico": "212",
  "Pueblo of Laguna, New Mexico": "213",
  "Pueblo of Nambe, New Mexico": "214",
  "Pueblo of Picuris, New Mexico": "215",
  "Pueblo of Pojoaque, New Mexico": "216",
  "Pueblo of San Felipe, New Mexico": "217",
  "Pueblo of San Juan, New Mexico": "218",
  "Pueblo of San Ildefonso, New Mexico": "219",
  "Bridgeport Paiute Indian Colony of California": "22",
  "Pueblo of Sandia, New Mexico": "220",
  "Pueblo of Santa Ana, New Mexico": "221",
  "Pueblo of Santa Clara, New Mexico": "222",
  "Pueblo of Santo Domingo, New Mexico": "223",
  "Pueblo of Taos, New Mexico": "224",
  "Pueblo of Tesuque, New Mexico": "225",
  "Pueblo of Zia, New Mexico": "226",
  "Puyallup Tribe of the Puyallup Reservation, Washin": "227",
  "Pyramid Lake Paiute Tribe of the Pyramid Lake Rese": "228",
  "Quapaw Tribe of Indians, Oklahoma": "229",
  "Buena Vista Rancheria of Me-Wuk Indians of Califor": "23",
  "Quartz Valley Indian Community of the Quartz Valle": "230",
  "Quechan Tribe of the Fort Yuma Indian Reservation,": "231",
  "Quileute Tribe of the Quileute Reservation, Washin": "232",
  "Quinault Tribe of the Quinault Reservation, Washin": "233",
  "Ramona Band or Village of Cahuilla Mission Indians": "234",
  "Red Cliff Band of Lake Superior Chippewa Indians o": "235",
  "Red Lake Band of Chippewa Indians of the Red Lake": "236",
  "Redding Rancheria, California": "237",
  "Redwood Valley Rancheria of Pomo Indians of Califo": "238",
  "Reno-Sparks Indian Colony, Nevada": "239",
  "Burns Paiute Tribe of the Burns Paiute Indian Colo": "24",
  "Resighini Rancheria, California (formerly known as": "240",
  "Rincon Band of Luiseno Mission Indians of the Rinc": "241",
  "Robinson Rancheria of Pomo Indians of California": "242",
  "Rosebud Sioux Tribe of the Rosebud Indian Reservat": "243",
  "Round Valley Indian Tribes of the Round Valley Res": "244",
  "Rumsey Indian Rancheria of Wintun Indians of Calif": "245",
  "Sac and Fox Tribe of the Mississippi in Iowa": "246",
  "Sac and Fox Nation of Missouri in Kansas and Nebra": "247",
  "Sac and Fox Nation, Oklahoma": "248",
  "Saginaw Chippewa Indian Tribe of Michigan, Isabell": "249",
  "Cabazon Band of Cahuilla Mission Indians of the Ca": "25",
  "Salt River Pima-Maricopa Indian Community of the S": "250",
  "Samish Indian Tribe, Washington": "251",
  "San Carlos Apache Tribe of the San Carlos Reservat": "252",
  "San Juan Southern Paiute Tribe of Arizona": "253",
  "San Manual Band of Serrano Mission Indians of the": "254",
  "San Pasqual Band of Diegueno Mission Indians of Ca": "255",
  "Santa Rosa Indian Community of the Santa Rosa Ranc": "256",
  "Santa Rosa Band of Cahuilla Mission Indians of the": "257",
  "Santa Ynez Band of Chumash Mission Indians of the": "258",
  "Santa Ysabel Band of Diegueno Mission Indians of t": "259",
  "Cachil DeHe Band of Wintun Indians of the Colusa I": "26",
  "Santee Sioux Tribe of the Santee Reservation of Ne": "260",
  "Sauk-Suiattle Indian Tribe of Washington": "261",
  "Sault Ste. Marie Tribe of Chippewa Indians of Mich": "262",
  "Scotts Valley Band of Pomo Indians of California": "263",
  "Seminole Nation of Oklahoma": "264",
  "Seminole Tribe of Florida, Dania, Big Cypress, Bri": "265",
  "Seneca Nation of New York": "266",
  "Seneca-Cayuga Tribe of Oklahoma": "267",
  "Shakopee Mdewakanton Sioux Community of Minnesota": "268",
  "Shawnee Tribe, Oklahoma": "269",
  "Caddo Indian Tribe of Oklahoma": "27",
  "Sherwood Valley Rancheria of Pomo Indians of Calif": "270",
  "Shingle Springs Band of Miwok Indians, Shingle Spr": "271",
  "Shoalwater Bay Tribe of the Shoalwater Bay Indian": "272",
  "Shoshone Tribe of the Wind River Reservation, Wyom": "273",
  "Shoshone-Bannock Tribes of the Fort Hall Reservati": "274",
  "Shoshone-Paiute Tribes of the Duck Valley Reservat": "275",
  "Sisseton-Wahpeton Sioux Tribe of the Lake Traverse": "276",
  "Skokomish Indian Tribe of the Skokomish Reservatio": "277",
  "Skull Valley Band of Goshute Indians of Utah": "278",
  "Smith River Rancheria, California": "279",
  "Cahuilla Band of Mission Indians of the Cahuilla R": "28",
  "Snoqualmie Tribe, Washington": "280",
  "Soboba Band of Luiseno Indians, California (former": "281",
  "Sokaogon Chippewa Community of the Mole Lake Band": "282",
  "Southern Ute Indian Tribe of the Southern Ute Rese": "283",
  "Spirit Lake Tribe, North Dakota (formerly known as": "284",
  "Spokane Tribe of the Spokane Reservation, Washingt": "285",
  "Squaxin Island Tribe of the Squaxin Island Reserva": "286",
  "St. Croix Chippewa Indians of Wisconsin, St. Croix": "287",
  "St. Regis Band of Mohawk Indians of New York": "288",
  "Standing Rock Sioux Tribe of North & South Dakota": "289",
  "Cahto Indian Tribe of the Laytonville Rancheria, C": "29",
  "Stockbridge-Munsee Community of Mohican Indians of": "290",
  "Stillaguamish Tribe of Washington": "291",
  "Summit Lake Paiute Tribe of Nevada": "292",
  "Suquamish Indian Tribe of the Port Madison Reserva": "293",
  "Susanville Indian Rancheria, California": "294",
  "Swinomish Indians of the Swinomish Reservation, Wa": "295",
  "Sycuan Band of Diegueno Mission Indians of Califor": "296",
  "Table Bluff Reservation - Wiyot Tribe, California": "297",
  "Table Mountain Rancheria of California": "298",
  "Te-Moak Tribe of Western Shoshone Indians of Nevad": "299",
  "Ak Chin Indian Community of the Maricopa (Ak Chin)": "3",
  "California Valley Miwok Tribe, California (formerl": "30",
  "Thlopthlocco Tribal Town, Oklahoma": "300",
  "Three Affiliated Tribes of the Fort Berthold Reser": "301",
  "Tohono O'odham Nation of Arizona": "302",
  "Tonawanda Band of Seneca Indians of New York": "303",
  "Tonkawa Tribe of Indians of Oklahoma": "304",
  "Tonto Apache Tribe of Arizona": "305",
  "Torres-Martinez Band of Cahuilla Mission Indians o": "306",
  "Tule River Indian Tribe of the Tule River Reservat": "307",
  "Tulalip Tribes of the Tulalip Reservation, Washing": "308",
  "Tunica-Biloxi Indian Tribe of Louisiana": "309",
  "Campo Band of Diegueno Mission Indians of the Camp": "31",
  "Tuolumne Band of Me-Wuk Indians of the Tuolumne Ra": "310",
  "Turtle Mountain Band of Chippewa Indians of North": "311",
  "Tuscarora Nation of New York": "312",
  "Twenty-Nine Palms Band of Mission Indians of Calif": "313",
  "United Auburn Indian Community of the Auburn Ranch": "314",
  "United Keetoowah Band of Cherokee Indians of Oklah": "315",
  "Upper Lake Band of Pomo Indians of Upper Lake Ranc": "316",
  "Upper Sioux Indian Community of the Upper Sioux Re": "317",
  "Upper Skagit Indian Tribe of Washington": "318",
  "Ute Indian Tribe of the Uintah & Ouray Reservation": "319",
  "Capitan Grande Band of Diegueno Mission Indians of": "32",
  "Ute Mountain Tribe of the Ute Mountain Reservation": "320",
  "Utu Utu Gwaitu Paiute Tribe of the Benton Paiute R": "321",
  "Walker River Paiute Tribe of the Walker River Rese": "322",
  "Wampanoag Tribe of Gay Head (Aquinnah) of Massachu": "323",
  "Washoe Tribe of Nevada & California (Carson Colony": "324",
  "White Mountain Apache Tribe of the Fort Apache Res": "325",
  "Wichita and Affiliated Tribes (Wichita, Keechi, Wa": "326",
  "Winnebago Tribe of Nebraska": "327",
  "Winnemucca Indian Colony of Nevada": "328",
  "Wyandotte Tribe of Oklahoma": "329",
  "Barona Group of Capitan Grande Band of Mission Ind": "33",
  "Yankton Sioux Tribe of South Dakota": "330",
  "Yavapai-Apache Nation of the Camp Verde Indian Res": "331",
  "Yavapai-Prescott Tribe of the Yavapai Reservation,": "332",
  "Yerington Paiute Tribe of the Yerington Colony & C": "333",
  "Yomba Shoshone Tribe of the Yomba Reservation, Nev": "334",
  "Ysleta Del Sur Pueblo of Texas": "335",
  "Yurok Tribe of the Yurok Reservation, California": "336",
  "Zuni Tribe of the Zuni Reservation, New Mexico": "337",
  "Viejas (Baron Long) Group of Capitan Grande Band o": "34",
  "Catawba Indian Nation (aka Catawba Tribe of South": "35",
  "Cayuga Nation of New York": "36",
  "Cedarville Rancheria, California": "37",
  "Chemehuevi Indian Tribe of the Chemehuevi Reservat": "38",
  "Cher-Ae Heights Indian Community of the Trinidad R": "39",
  "Alabama-Coushatta Tribes of Texas": "4",
  "Cherokee Nation, Oklahoma": "40",
  "Cheyenne-Arapaho Tribes of Oklahoma": "41",
  "Cheyenne River Sioux Tribe of the Cheyenne River": "42",
  "Chickasaw Nation, Oklahoma": "43",
  "Chicken Ranch Rancheria of Me-Wuk Indians of Calif": "44",
  "Chippewa-Cree Indians of the Rocky Boy's Reservati": "45",
  "Chitimacha Tribe of Louisiana": "46",
  "Choctaw Nation of Oklahoma": "47",
  "Citizen Potawatomi Nation, Oklahoma": "48",
  "Cloverdale Rancheria of Pomo Indians of California": "49",
  "Alabama-Quassarte Tribal Town, Oklahoma": "5",
  "Cocopah Tribe of Arizona": "50",
  "Coeur D'Alene Tribe of the Coeur D'Alene Reservati": "51",
  "Cold Springs Rancheria of Mono Indians of Californ": "52",
  "Colorado River Indian Tribes of the Colorado River": "53",
  "Comanche Indian Tribe, Oklahoma": "54",
  "Confederated Salish & Kootenai Tribes of the Flath": "55",
  "Confederated Tribes of the Chehalis Reservation, W": "56",
  "Confederated Tribes of the Colville Reservation, W": "57",
  "Confederated Tribes of the Coos, Lower Umpqua and": "58",
  "Confederated Tribes of the Goshute Reservation, Ne": "59",
  "Alturas Indian Rancheria, California": "6",
  "Confederated Tribes of the Grand Ronde Community o": "60",
  "Confederated Tribes of the Siletz Reservation, Ore": "61",
  "Confederated Tribes of the Umatilla Reservation, O": "62",
  "Confederated Tribes of the Warm Springs Reservatio": "63",
  "Confederated Tribes and Bands of the Yakama Indian": "64",
  "Coquille Tribe of Oregon": "65",
  "Cortina Indian Rancheria of Wintun Indians of Cali": "66",
  "Coushatta Tribe of Louisiana": "67",
  "Cow Creek Band of Umpqua Indians of Oregon": "68",
  "Coyote Valley Band of Pomo Indians of California": "69",
  "Apache Tribe of Oklahoma": "7",
  "Crow Tribe of Montana": "70",
  "Crow Creek Sioux Tribe of the Crow Creek Reservati": "71",
  "Cuyapaipe Community of Diegueno Mission Indians of": "72",
  "Death Valley Timbi-Sha Shoshone Band of California": "73",
  "Delaware Nation, Oklahoma (formerly Delaware Tribe": "74",
  "Delaware Tribe of Indians, Oklahoma": "75",
  "Dry Creek Rancheria of Pomo Indians of California": "76",
  "Duckwater Shoshone Tribe of the Duckwater Reservat": "77",
  "Eastern Band of Cherokee Indians of North Carolina": "78",
  "Eastern Shawnee Tribe of Oklahoma": "79",
  "Arapahoe Tribe of the Wind River Reservation, Wyom": "8",
  "Elem Indian Colony of Pomo Indians of the Sulphur": "80",
  "Elk Valley Rancheria, California": "81",
  "Ely Shoshone Tribe of Nevada": "82",
  "Enterprise Rancheria of Maidu Indians of Californi": "83",
  "Flandreau Santee Sioux Tribe of South Dakota": "84",
  "Forest County Potawatomi Community of Wisconsin Po": "85",
  "Fort Belknap Indian Community of the Fort Belknap": "86",
  "Fort Bidwell Indian Community of the Fort Bidwell": "87",
  "Fort Independence Indian Community of Paiute India": "88",
  "Fort McDermitt Paiute and Shoshone Tribes of the F": "89",
  "Aroostook Band of Micmac Indians of Maine": "9",
  "Fort McDowell Yavapai Nation, Arizona (formerly th": "90",
  "Fort Mojave Indian Tribe of Arizona, California": "91",
  "Fort Sill Apache Tribe of Oklahoma": "92",
  "Gila River Indian Community of the Gila River Indi": "93",
  "Grand Traverse Band of Ottawa & Chippewa Indians o": "94",
  "Graton Rancheria, California": "95",
  "Greenville Rancheria of Maidu Indians of Californi": "96",
  "Grindstone Indian Rancheria of Wintun-Wailaki Indi": "97",
  "Guidiville Rancheria of California": "98",
  "Hannahville Indian Community of Wisconsin Potawato": "99",
};
const fullTribalAffiliationValueSet: {
  value: TribalAffiliation;
  label: string;
}[] = Object.entries(fullTribalAffiliationValueSetMap).map((e) => ({
  label: e[0],
  value: e[1],
}));
export const TRIBAL_AFFILIATION_VALUES: {
  value: TribalAffiliation;
  label: string;
}[] = process.env.REACT_APP_TEST_TRIBAL_AFFILIATION_BYPASS
  ? fullTribalAffiliationValueSet.slice(0, 10)
  : fullTribalAffiliationValueSet;

const identityVerificationTypes: { [key: string]: string } = {
  sms: "Text message (SMS)",
  okta: "Okta Verify",
  google: "Google Authenticator",
  key: "Security key or biometric authentication",
  phone: "Phone call",
  email: "Email",
};

export const AUTH_OR_IDENTITY_METHODS_BUTTONS: {
  value: string;
  label: string;
}[] = Object.entries(identityVerificationTypes).map((e) => ({
  label: e[1],
  value: e[0],
}));

export const TEST_RESULT_DESCRIPTIONS = testResultDescriptions(i18n.t);
export const RACE_VALUES = raceValues(i18n.t);
export const ROLE_VALUES = roleValues(i18n.t);
export const ETHNICITY_VALUES = ethnicityValues(i18n.t);
export const GENDER_VALUES = genderValues(i18n.t);
export const YES_NO_VALUES = yesNoValues(i18n.t);
export const PHONE_TYPE_VALUES = phoneTypeValues(i18n.t);
export const TEST_RESULT_DELIVERY_PREFERENCE_VALUES = testResultDeliveryPreferenceValues(
  i18n.t
);
export const YES_NO_UNKNOWN_VALUES = yesNoUnkownValues(i18n.t);

export const useTranslatedConstants = (t: TFunction) => {
  return {
    TEST_RESULT_DESCRIPTIONS: testResultDescriptions(t),
    RACE_VALUES: raceValues(t),
    ROLE_VALUES: roleValues(t),
    ETHNICITY_VALUES: ethnicityValues(t),
    GENDER_VALUES: genderValues(t),
    TEST_RESULT_DELIVERY_PREFERENCE_VALUES: testResultDeliveryPreferenceValues(
      t
    ),
    PHONE_TYPE_VALUES: phoneTypeValues(t),
    YES_NO_VALUES: yesNoValues(t),
    YES_NO_UNKNOWN_VALUES: yesNoUnkownValues(t),
  };
};

type Race =
  | "native"
  | "asian"
  | "black"
  | "pacific"
  | "white"
  | "unknown"
  | "refused";
type Ethnicity = "hispanic" | "not_hispanic";
type Gender = "male" | "female" | "other";
type YesNo = "YES" | "NO";
type Role = "STAFF" | "RESIDENT" | "STUDENT" | "VISITOR" | "";

interface PersonUpdate extends Address {
  lookupId: string;
  role: Role;
  race: Race;
  ethnicity: Ethnicity;
  gender: Gender;
  residentCongregateSetting: boolean;
  employedInHealthcare: boolean;
  telephone: string;
  county: string;
  email: string;
  preferredLanguage: Language | null;
}

interface Person extends PersonUpdate {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
}

interface PersonUpdateFormData extends PersonUpdate {
  facilityId: string | null;
}

interface PersonFormData extends Person {
  facilityId: string | null;
}

type Language =
  | "English"
  | "Spanish"
  | "Unknown"
  | "Afrikaans"
  | "Amaric"
  | "Arabic"
  | "Armenian"
  | "Aromanian; Arumanian; Macedo-Romanian"
  | "Bantu (other)"
  | "Bengali"
  | "Burmese"
  | "Cambodian"
  | "Cantonese"
  | "Caucasian (other)"
  | "Chaochow"
  | "Cherokee"
  | "Chinese"
  | "Creoles and pidgins, French-based (Other)"
  | "Cushitic (other)"
  | "Dakota"
  | "Deaf mute"
  | "Farsi"
  | "Fiji"
  | "Filipino; Pilipino"
  | "French"
  | "German"
  | "Gujarati"
  | "Hebrew"
  | "Hindi"
  | "Hmong"
  | "Indonesian"
  | "Italian"
  | "Japanese"
  | "Kannada"
  | "Korean"
  | "Kru languages"
  | "Kurdish"
  | "Laotian"
  | "Latin"
  | "Luganda"
  | "Malayalam"
  | "Mandar"
  | "Mandarin"
  | "Marathi"
  | "Marshallese"
  | "Mien"
  | "Mixteca"
  | "Mon-Khmer (Other)"
  | "Mongolian"
  | "Morrocan Arabic"
  | "Navajo"
  | "Nepali"
  | "Not Specified"
  | "Oaxacan"
  | "Other"
  | "Pashto"
  | "Portuguese"
  | "Punjabi"
  | "Rarotongan; Cook Islands Maori"
  | "Russian"
  | "Samoan"
  | "Sebuano"
  | "Serbo Croatian"
  | "Sign Languages"
  | "Singhalese"
  | "Somali"
  | "Swahili"
  | "Syrian"
  | "Tagalog"
  | "Tahitian"
  | "Taiwanese"
  | "Tamil"
  | "Tegulu"
  | "Thai"
  | "Tigrinya"
  | "Triqui"
  | "Ukrainian"
  | "Urdu"
  | "Vietnamese"
  | "Yiddish"
  | "Zapotec";

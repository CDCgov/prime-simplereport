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
type PhoneType = "mobile" | "landline" | "unknown";

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

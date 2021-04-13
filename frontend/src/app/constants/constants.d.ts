type Race =
  | "native"
  | "asian"
  | "black"
  | "pacific"
  | "white"
  | "other"
  | "refused";
type Ethnicity = "hispanic" | "not_hispanic" | "refused";
type Gender = "male" | "female" | "other" | "refused";
type YesNo = "YES" | "NO";
type Role = "STAFF" | "RESIDENT" | "STUDENT" | "VISITOR" | "";
type YesNoUnknown = YesNo | "UNKNOWN";

interface PersonUpdate extends Address {
  lookupId: string;
  role: Role;
  race: Race;
  ethnicity: Ethnicity;
  gender: Gender;
  residentCongregateSetting: boolean | null | undefined;
  employedInHealthcare: boolean | null | undefined;
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

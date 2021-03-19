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

interface Person extends Address {
  firstName: string;
  middleName: string;
  lastName: string;
  lookupId: string;
  role: Role;
  race: Race;
  ethnicity: Ethnicity;
  gender: Gender;
  residentCongregateSetting: YesNo;
  employedInHealthcare: YesNo;
  birthDate: string;
  telephone: string;
  county: string;
  email: string;
}

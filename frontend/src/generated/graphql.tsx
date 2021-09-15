import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  LocalDate: any;
  Upload: any;
};

export type AddTestResultResponse = {
  __typename?: "AddTestResultResponse";
  deliverySuccess?: Maybe<Scalars["Boolean"]>;
  testResult: TestOrder;
};

export type AddressInfo = {
  __typename?: "AddressInfo";
  city?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  postalCode?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  streetOne?: Maybe<Scalars["String"]>;
  streetTwo?: Maybe<Scalars["String"]>;
};

export type ApiUser = {
  __typename?: "ApiUser";
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  name: NameInfo;
  /** @deprecated needless connection of type to field name */
  nameInfo?: Maybe<NameInfo>;
  suffix?: Maybe<Scalars["String"]>;
};

export type ApiUserWithStatus = {
  __typename?: "ApiUserWithStatus";
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  name: NameInfo;
  status?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export type DeviceType = {
  __typename?: "DeviceType";
  internalId?: Maybe<Scalars["ID"]>;
  loincCode?: Maybe<Scalars["String"]>;
  manufacturer?: Maybe<Scalars["String"]>;
  model?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  swabType?: Maybe<Scalars["String"]>;
  testLength?: Maybe<Scalars["Int"]>;
};

export type Facility = {
  __typename?: "Facility";
  address?: Maybe<AddressInfo>;
  city?: Maybe<Scalars["String"]>;
  cliaNumber?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  defaultDeviceType?: Maybe<DeviceType>;
  deviceTypes?: Maybe<Array<Maybe<DeviceType>>>;
  email?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  name?: Maybe<Scalars["String"]>;
  orderingProvider?: Maybe<Provider>;
  patientSelfRegistrationLink?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  street?: Maybe<Scalars["String"]>;
  streetTwo?: Maybe<Scalars["String"]>;
  zipCode?: Maybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addFacility?: Maybe<Scalars["String"]>;
  addPatient?: Maybe<Patient>;
  addPatientToQueue?: Maybe<Scalars["String"]>;
  addTestResult?: Maybe<TestOrder>;
  addTestResultNew?: Maybe<AddTestResultResponse>;
  addUser?: Maybe<User>;
  addUserToCurrentOrg?: Maybe<User>;
  adminUpdateOrganization?: Maybe<Scalars["String"]>;
  correctTestMarkAsError?: Maybe<TestResult>;
  createDeviceType?: Maybe<DeviceType>;
  createFacilityRegistrationLink?: Maybe<Scalars["String"]>;
  createOrganization?: Maybe<Organization>;
  createOrganizationRegistrationLink?: Maybe<Scalars["String"]>;
  editQueueItem?: Maybe<TestOrder>;
  reactivateUser?: Maybe<User>;
  removePatientFromQueue?: Maybe<Scalars["String"]>;
  resetUserPassword?: Maybe<User>;
  sendPatientLinkSms?: Maybe<Scalars["String"]>;
  setCurrentUserTenantDataAccess?: Maybe<User>;
  setOrganizationIdentityVerified?: Maybe<Scalars["Boolean"]>;
  setPatientIsDeleted?: Maybe<Patient>;
  setRegistrationLinkIsDeleted?: Maybe<Scalars["String"]>;
  setUserIsDeleted?: Maybe<User>;
  updateDeviceType?: Maybe<DeviceType>;
  updateFacility?: Maybe<Scalars["String"]>;
  updateOrganization?: Maybe<Scalars["String"]>;
  updatePatient?: Maybe<Patient>;
  updateRegistrationLink?: Maybe<Scalars["String"]>;
  updateTimeOfTestQuestions?: Maybe<Scalars["String"]>;
  updateUser?: Maybe<User>;
  updateUserPrivileges?: Maybe<User>;
  uploadPatients?: Maybe<Scalars["String"]>;
};

export type MutationAddFacilityArgs = {
  city?: Maybe<Scalars["String"]>;
  cliaNumber?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
  deviceTypes: Array<Maybe<Scalars["String"]>>;
  email?: Maybe<Scalars["String"]>;
  orderingProviderCity?: Maybe<Scalars["String"]>;
  orderingProviderCounty?: Maybe<Scalars["String"]>;
  orderingProviderFirstName?: Maybe<Scalars["String"]>;
  orderingProviderLastName?: Maybe<Scalars["String"]>;
  orderingProviderMiddleName?: Maybe<Scalars["String"]>;
  orderingProviderNPI?: Maybe<Scalars["String"]>;
  orderingProviderPhone?: Maybe<Scalars["String"]>;
  orderingProviderState?: Maybe<Scalars["String"]>;
  orderingProviderStreet?: Maybe<Scalars["String"]>;
  orderingProviderStreetTwo?: Maybe<Scalars["String"]>;
  orderingProviderSuffix?: Maybe<Scalars["String"]>;
  orderingProviderZipCode?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationAddPatientArgs = {
  birthDate: Scalars["LocalDate"];
  city?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]>;
  ethnicity?: Maybe<Scalars["String"]>;
  facilityId?: Maybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  gender?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lookupId?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  phoneNumbers?: Maybe<Array<PhoneNumberInput>>;
  preferredLanguage?: Maybe<Scalars["String"]>;
  race?: Maybe<Scalars["String"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]>;
  role?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  telephone?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
  tribalAffiliation?: Maybe<Scalars["String"]>;
  zipCode: Scalars["String"];
};

export type MutationAddPatientToQueueArgs = {
  facilityId: Scalars["ID"];
  firstTest?: Maybe<Scalars["Boolean"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patientId: Scalars["ID"];
  pregnancy?: Maybe<Scalars["String"]>;
  priorTestDate?: Maybe<Scalars["LocalDate"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
};

export type MutationAddTestResultArgs = {
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceId: Scalars["String"];
  patientId: Scalars["ID"];
  result: Scalars["String"];
};

export type MutationAddTestResultNewArgs = {
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceId: Scalars["String"];
  patientId: Scalars["ID"];
  result: Scalars["String"];
};

export type MutationAddUserArgs = {
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInput>;
  organizationExternalId: Scalars["String"];
  role: Role;
  suffix?: Maybe<Scalars["String"]>;
};

export type MutationAddUserToCurrentOrgArgs = {
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInput>;
  role: Role;
  suffix?: Maybe<Scalars["String"]>;
};

export type MutationAdminUpdateOrganizationArgs = {
  name: Scalars["String"];
  type: Scalars["String"];
};

export type MutationCorrectTestMarkAsErrorArgs = {
  id: Scalars["ID"];
  reason?: Maybe<Scalars["String"]>;
};

export type MutationCreateDeviceTypeArgs = {
  loincCode: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  name: Scalars["String"];
  swabType: Scalars["String"];
};

export type MutationCreateFacilityRegistrationLinkArgs = {
  facilityId: Scalars["ID"];
  link: Scalars["String"];
  organizationExternalId: Scalars["String"];
};

export type MutationCreateOrganizationArgs = {
  adminEmail: Scalars["String"];
  adminFirstName?: Maybe<Scalars["String"]>;
  adminLastName?: Maybe<Scalars["String"]>;
  adminMiddleName?: Maybe<Scalars["String"]>;
  adminName?: Maybe<NameInput>;
  adminSuffix?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  cliaNumber?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
  deviceTypes: Array<Maybe<Scalars["String"]>>;
  email?: Maybe<Scalars["String"]>;
  externalId: Scalars["String"];
  name: Scalars["String"];
  orderingProviderCity?: Maybe<Scalars["String"]>;
  orderingProviderCounty?: Maybe<Scalars["String"]>;
  orderingProviderFirstName?: Maybe<Scalars["String"]>;
  orderingProviderLastName?: Maybe<Scalars["String"]>;
  orderingProviderMiddleName?: Maybe<Scalars["String"]>;
  orderingProviderNPI?: Maybe<Scalars["String"]>;
  orderingProviderName?: Maybe<NameInput>;
  orderingProviderPhone?: Maybe<Scalars["String"]>;
  orderingProviderState?: Maybe<Scalars["String"]>;
  orderingProviderStreet?: Maybe<Scalars["String"]>;
  orderingProviderStreetTwo?: Maybe<Scalars["String"]>;
  orderingProviderSuffix?: Maybe<Scalars["String"]>;
  orderingProviderZipCode?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  type: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationCreateOrganizationRegistrationLinkArgs = {
  link: Scalars["String"];
  organizationExternalId: Scalars["String"];
};

export type MutationEditQueueItemArgs = {
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceId?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  result?: Maybe<Scalars["String"]>;
};

export type MutationReactivateUserArgs = {
  id: Scalars["ID"];
};

export type MutationRemovePatientFromQueueArgs = {
  patientId: Scalars["ID"];
};

export type MutationResetUserPasswordArgs = {
  id: Scalars["ID"];
};

export type MutationSendPatientLinkSmsArgs = {
  internalId: Scalars["String"];
};

export type MutationSetCurrentUserTenantDataAccessArgs = {
  justification?: Maybe<Scalars["String"]>;
  organizationExternalId?: Maybe<Scalars["String"]>;
};

export type MutationSetOrganizationIdentityVerifiedArgs = {
  externalId: Scalars["String"];
  verified: Scalars["Boolean"];
};

export type MutationSetPatientIsDeletedArgs = {
  deleted: Scalars["Boolean"];
  id: Scalars["ID"];
};

export type MutationSetRegistrationLinkIsDeletedArgs = {
  deleted: Scalars["Boolean"];
  link?: Maybe<Scalars["String"]>;
};

export type MutationSetUserIsDeletedArgs = {
  deleted: Scalars["Boolean"];
  id: Scalars["ID"];
};

export type MutationUpdateDeviceTypeArgs = {
  id: Scalars["String"];
  loincCode?: Maybe<Scalars["String"]>;
  manufacturer?: Maybe<Scalars["String"]>;
  model?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  swabType?: Maybe<Scalars["String"]>;
};

export type MutationUpdateFacilityArgs = {
  city?: Maybe<Scalars["String"]>;
  cliaNumber?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
  deviceTypes: Array<Maybe<Scalars["String"]>>;
  email?: Maybe<Scalars["String"]>;
  facilityId: Scalars["ID"];
  orderingProviderCity?: Maybe<Scalars["String"]>;
  orderingProviderCounty?: Maybe<Scalars["String"]>;
  orderingProviderFirstName?: Maybe<Scalars["String"]>;
  orderingProviderLastName?: Maybe<Scalars["String"]>;
  orderingProviderMiddleName?: Maybe<Scalars["String"]>;
  orderingProviderNPI?: Maybe<Scalars["String"]>;
  orderingProviderPhone?: Maybe<Scalars["String"]>;
  orderingProviderState?: Maybe<Scalars["String"]>;
  orderingProviderStreet?: Maybe<Scalars["String"]>;
  orderingProviderStreetTwo?: Maybe<Scalars["String"]>;
  orderingProviderSuffix?: Maybe<Scalars["String"]>;
  orderingProviderZipCode?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationUpdateOrganizationArgs = {
  type: Scalars["String"];
};

export type MutationUpdatePatientArgs = {
  birthDate: Scalars["LocalDate"];
  city?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]>;
  ethnicity?: Maybe<Scalars["String"]>;
  facilityId?: Maybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  gender?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lookupId?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  patientId: Scalars["ID"];
  phoneNumbers?: Maybe<Array<PhoneNumberInput>>;
  preferredLanguage?: Maybe<Scalars["String"]>;
  race?: Maybe<Scalars["String"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]>;
  role?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  telephone?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
  tribalAffiliation?: Maybe<Scalars["String"]>;
  zipCode: Scalars["String"];
};

export type MutationUpdateRegistrationLinkArgs = {
  link: Scalars["String"];
  newLink: Scalars["String"];
};

export type MutationUpdateTimeOfTestQuestionsArgs = {
  firstTest?: Maybe<Scalars["Boolean"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patientId: Scalars["ID"];
  pregnancy?: Maybe<Scalars["String"]>;
  priorTestDate?: Maybe<Scalars["LocalDate"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
};

export type MutationUpdateUserArgs = {
  firstName?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  lastName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInput>;
  suffix?: Maybe<Scalars["String"]>;
};

export type MutationUpdateUserPrivilegesArgs = {
  accessAllFacilities: Scalars["Boolean"];
  facilities?: Maybe<Array<Scalars["ID"]>>;
  id: Scalars["ID"];
  role: Role;
};

export type MutationUploadPatientsArgs = {
  patientList: Scalars["Upload"];
};

export type NameInfo = {
  __typename?: "NameInfo";
  firstName?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export type NameInput = {
  firstName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export type Organization = {
  __typename?: "Organization";
  externalId: Scalars["String"];
  facilities: Array<Facility>;
  id: Scalars["ID"];
  identityVerified: Scalars["Boolean"];
  /** @deprecated alias for 'id' */
  internalId: Scalars["ID"];
  name: Scalars["String"];
  patientSelfRegistrationLink?: Maybe<Scalars["String"]>;
  /** @deprecated Use the one that makes sense */
  testingFacility: Array<Facility>;
  type: Scalars["String"];
};

export type Patient = {
  __typename?: "Patient";
  address?: Maybe<AddressInfo>;
  birthDate?: Maybe<Scalars["LocalDate"]>;
  city?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]>;
  ethnicity?: Maybe<Scalars["String"]>;
  facility?: Maybe<Facility>;
  firstName?: Maybe<Scalars["String"]>;
  gender?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  /** @deprecated alias for 'id' */
  internalId?: Maybe<Scalars["ID"]>;
  isDeleted?: Maybe<Scalars["Boolean"]>;
  lastName?: Maybe<Scalars["String"]>;
  lastTest?: Maybe<TestResult>;
  lookupId?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInfo>;
  phoneNumbers?: Maybe<Array<Maybe<PhoneNumber>>>;
  preferredLanguage?: Maybe<Scalars["String"]>;
  race?: Maybe<Scalars["String"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]>;
  role?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  street?: Maybe<Scalars["String"]>;
  streetTwo?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  telephone?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
  tribalAffiliation?: Maybe<Array<Maybe<Scalars["String"]>>>;
  zipCode?: Maybe<Scalars["String"]>;
};

export type PatientLink = {
  __typename?: "PatientLink";
  createdAt?: Maybe<Scalars["DateTime"]>;
  expiresAt?: Maybe<Scalars["DateTime"]>;
  internalId?: Maybe<Scalars["ID"]>;
  testOrder?: Maybe<TestOrder>;
};

export type PhoneNumber = {
  __typename?: "PhoneNumber";
  number?: Maybe<Scalars["String"]>;
  type?: Maybe<PhoneType>;
};

export type PhoneNumberInput = {
  number?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
};

export enum PhoneType {
  Landline = "LANDLINE",
  Mobile = "MOBILE",
}

export type Provider = {
  __typename?: "Provider";
  NPI?: Maybe<Scalars["String"]>;
  address?: Maybe<AddressInfo>;
  city?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  firstName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInfo>;
  phone?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  street?: Maybe<Scalars["String"]>;
  streetTwo?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  zipCode?: Maybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  /** @deprecated use the pluralized form to reduce confusion */
  deviceType?: Maybe<Array<Maybe<DeviceType>>>;
  deviceTypes?: Maybe<Array<Maybe<DeviceType>>>;
  /** @deprecated this information is already loaded from the 'whoami' endpoint */
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  patient?: Maybe<Patient>;
  patientExists?: Maybe<Scalars["Boolean"]>;
  patients?: Maybe<Array<Maybe<Patient>>>;
  patientsCount?: Maybe<Scalars["Int"]>;
  queue?: Maybe<Array<Maybe<TestOrder>>>;
  testResult?: Maybe<TestResult>;
  testResults?: Maybe<Array<Maybe<TestResult>>>;
  testResultsCount?: Maybe<Scalars["Int"]>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<ApiUser>>>;
  usersWithStatus?: Maybe<Array<Maybe<ApiUserWithStatus>>>;
  whoami: User;
};

export type QueryOrganizationsArgs = {
  identityVerified?: Maybe<Scalars["Boolean"]>;
};

export type QueryPatientArgs = {
  id: Scalars["ID"];
};

export type QueryPatientExistsArgs = {
  birthDate: Scalars["LocalDate"];
  facilityId?: Maybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type QueryPatientsArgs = {
  facilityId?: Maybe<Scalars["ID"]>;
  namePrefixMatch?: Maybe<Scalars["String"]>;
  pageNumber?: Maybe<Scalars["Int"]>;
  pageSize?: Maybe<Scalars["Int"]>;
  showDeleted?: Maybe<Scalars["Boolean"]>;
};

export type QueryPatientsCountArgs = {
  facilityId?: Maybe<Scalars["ID"]>;
  namePrefixMatch?: Maybe<Scalars["String"]>;
  showDeleted?: Maybe<Scalars["Boolean"]>;
};

export type QueryQueueArgs = {
  facilityId: Scalars["ID"];
};

export type QueryTestResultArgs = {
  id: Scalars["ID"];
};

export type QueryTestResultsArgs = {
  endDate?: Maybe<Scalars["DateTime"]>;
  facilityId?: Maybe<Scalars["ID"]>;
  pageNumber?: Maybe<Scalars["Int"]>;
  pageSize?: Maybe<Scalars["Int"]>;
  patientId?: Maybe<Scalars["ID"]>;
  result?: Maybe<Scalars["String"]>;
  role?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["DateTime"]>;
};

export type QueryTestResultsCountArgs = {
  endDate?: Maybe<Scalars["DateTime"]>;
  facilityId?: Maybe<Scalars["ID"]>;
  patientId?: Maybe<Scalars["ID"]>;
  result?: Maybe<Scalars["String"]>;
  role?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["DateTime"]>;
};

export type QueryUserArgs = {
  id: Scalars["ID"];
};

export enum ResultValue {
  Negative = "NEGATIVE",
  Positive = "POSITIVE",
  Undetermined = "UNDETERMINED",
}

export enum Role {
  Admin = "ADMIN",
  EntryOnly = "ENTRY_ONLY",
  User = "USER",
}

export enum TestCorrectionStatus {
  Corrected = "CORRECTED",
  Original = "ORIGINAL",
  Removed = "REMOVED",
}

export type TestDescription = {
  __typename?: "TestDescription";
  loincCode: Scalars["String"];
  name: Scalars["String"];
};

export type TestDescriptionNameArgs = {
  nameType?: Maybe<Scalars["String"]>;
};

export type TestOrder = {
  __typename?: "TestOrder";
  correctionStatus?: Maybe<Scalars["String"]>;
  dateAdded?: Maybe<Scalars["String"]>;
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceType?: Maybe<DeviceType>;
  firstTest?: Maybe<Scalars["Boolean"]>;
  id?: Maybe<Scalars["ID"]>;
  /** @deprecated alias for 'id' */
  internalId?: Maybe<Scalars["ID"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patient?: Maybe<Patient>;
  pregnancy?: Maybe<Scalars["String"]>;
  priorTestDate?: Maybe<Scalars["LocalDate"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  reasonForCorrection?: Maybe<Scalars["String"]>;
  result?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
};

export type TestResult = {
  __typename?: "TestResult";
  correctionStatus?: Maybe<Scalars["String"]>;
  createdBy?: Maybe<ApiUser>;
  dateAdded?: Maybe<Scalars["String"]>;
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceType?: Maybe<DeviceType>;
  facility?: Maybe<Facility>;
  firstTest?: Maybe<Scalars["Boolean"]>;
  internalId?: Maybe<Scalars["ID"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patient?: Maybe<Patient>;
  patientLink?: Maybe<PatientLink>;
  pregnancy?: Maybe<Scalars["String"]>;
  priorTestDate?: Maybe<Scalars["String"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  reasonForCorrection?: Maybe<Scalars["String"]>;
  result?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
  testPerformed: TestDescription;
};

export enum TestResultDeliveryPreference {
  None = "NONE",
  Sms = "SMS",
}

export type User = {
  __typename?: "User";
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  isAdmin?: Maybe<Scalars["Boolean"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  name?: Maybe<NameInfo>;
  organization?: Maybe<Organization>;
  permissions: Array<UserPermission>;
  role?: Maybe<Role>;
  roleDescription: Scalars["String"];
  /** @deprecated Users have only one role now */
  roles: Array<Role>;
  status?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export enum UserPermission {
  AccessAllFacilities = "ACCESS_ALL_FACILITIES",
  ArchivePatient = "ARCHIVE_PATIENT",
  EditFacility = "EDIT_FACILITY",
  EditOrganization = "EDIT_ORGANIZATION",
  EditPatient = "EDIT_PATIENT",
  ManageUsers = "MANAGE_USERS",
  ReadArchivedPatientList = "READ_ARCHIVED_PATIENT_LIST",
  ReadPatientList = "READ_PATIENT_LIST",
  ReadResultList = "READ_RESULT_LIST",
  SearchPatients = "SEARCH_PATIENTS",
  StartTest = "START_TEST",
  SubmitTest = "SUBMIT_TEST",
  UpdateTest = "UPDATE_TEST",
}

export type WhoAmIQueryVariables = Exact<{ [key: string]: never }>;

export type WhoAmIQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    id?: Maybe<string>;
    firstName?: Maybe<string>;
    middleName?: Maybe<string>;
    lastName: string;
    suffix?: Maybe<string>;
    email: string;
    isAdmin?: Maybe<boolean>;
    permissions: Array<UserPermission>;
    roleDescription: string;
    organization?: Maybe<{
      __typename?: "Organization";
      name: string;
      testingFacility: Array<{
        __typename?: "Facility";
        id?: Maybe<string>;
        name?: Maybe<string>;
      }>;
    }>;
  };
};

export type GetFacilitiesQueryVariables = Exact<{ [key: string]: never }>;

export type GetFacilitiesQuery = {
  __typename?: "Query";
  organization?: Maybe<{
    __typename?: "Organization";
    internalId: string;
    testingFacility: Array<{
      __typename?: "Facility";
      id?: Maybe<string>;
      cliaNumber?: Maybe<string>;
      name?: Maybe<string>;
      street?: Maybe<string>;
      streetTwo?: Maybe<string>;
      city?: Maybe<string>;
      state?: Maybe<string>;
      zipCode?: Maybe<string>;
      phone?: Maybe<string>;
      email?: Maybe<string>;
      defaultDeviceType?: Maybe<{
        __typename?: "DeviceType";
        internalId?: Maybe<string>;
      }>;
      deviceTypes?: Maybe<
        Array<Maybe<{ __typename?: "DeviceType"; internalId?: Maybe<string> }>>
      >;
      orderingProvider?: Maybe<{
        __typename?: "Provider";
        firstName?: Maybe<string>;
        middleName?: Maybe<string>;
        lastName?: Maybe<string>;
        suffix?: Maybe<string>;
        NPI?: Maybe<string>;
        street?: Maybe<string>;
        streetTwo?: Maybe<string>;
        city?: Maybe<string>;
        state?: Maybe<string>;
        zipCode?: Maybe<string>;
        phone?: Maybe<string>;
      }>;
    }>;
  }>;
  deviceType?: Maybe<
    Array<
      Maybe<{
        __typename?: "DeviceType";
        internalId?: Maybe<string>;
        name?: Maybe<string>;
      }>
    >
  >;
};

export type UpdateFacilityMutationVariables = Exact<{
  facilityId: Scalars["ID"];
  testingFacilityName: Scalars["String"];
  cliaNumber?: Maybe<Scalars["String"]>;
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  phone?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  orderingProviderFirstName?: Maybe<Scalars["String"]>;
  orderingProviderMiddleName?: Maybe<Scalars["String"]>;
  orderingProviderLastName?: Maybe<Scalars["String"]>;
  orderingProviderSuffix?: Maybe<Scalars["String"]>;
  orderingProviderNPI?: Maybe<Scalars["String"]>;
  orderingProviderStreet?: Maybe<Scalars["String"]>;
  orderingProviderStreetTwo?: Maybe<Scalars["String"]>;
  orderingProviderCity?: Maybe<Scalars["String"]>;
  orderingProviderState?: Maybe<Scalars["String"]>;
  orderingProviderZipCode?: Maybe<Scalars["String"]>;
  orderingProviderPhone?: Maybe<Scalars["String"]>;
  devices: Array<Maybe<Scalars["String"]>> | Maybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
}>;

export type UpdateFacilityMutation = {
  __typename?: "Mutation";
  updateFacility?: Maybe<string>;
};

export type AddFacilityMutationVariables = Exact<{
  testingFacilityName: Scalars["String"];
  cliaNumber?: Maybe<Scalars["String"]>;
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  phone?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  orderingProviderFirstName?: Maybe<Scalars["String"]>;
  orderingProviderMiddleName?: Maybe<Scalars["String"]>;
  orderingProviderLastName?: Maybe<Scalars["String"]>;
  orderingProviderSuffix?: Maybe<Scalars["String"]>;
  orderingProviderNPI?: Maybe<Scalars["String"]>;
  orderingProviderStreet?: Maybe<Scalars["String"]>;
  orderingProviderStreetTwo?: Maybe<Scalars["String"]>;
  orderingProviderCity?: Maybe<Scalars["String"]>;
  orderingProviderState?: Maybe<Scalars["String"]>;
  orderingProviderZipCode?: Maybe<Scalars["String"]>;
  orderingProviderPhone?: Maybe<Scalars["String"]>;
  devices: Array<Maybe<Scalars["String"]>> | Maybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
}>;

export type AddFacilityMutation = {
  __typename?: "Mutation";
  addFacility?: Maybe<string>;
};

export type GetManagedFacilitiesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetManagedFacilitiesQuery = {
  __typename?: "Query";
  organization?: Maybe<{
    __typename?: "Organization";
    testingFacility: Array<{
      __typename?: "Facility";
      id?: Maybe<string>;
      cliaNumber?: Maybe<string>;
      name?: Maybe<string>;
      street?: Maybe<string>;
      streetTwo?: Maybe<string>;
      city?: Maybe<string>;
      state?: Maybe<string>;
      zipCode?: Maybe<string>;
      phone?: Maybe<string>;
      email?: Maybe<string>;
      defaultDeviceType?: Maybe<{
        __typename?: "DeviceType";
        internalId?: Maybe<string>;
      }>;
      deviceTypes?: Maybe<
        Array<Maybe<{ __typename?: "DeviceType"; internalId?: Maybe<string> }>>
      >;
      orderingProvider?: Maybe<{
        __typename?: "Provider";
        firstName?: Maybe<string>;
        middleName?: Maybe<string>;
        lastName?: Maybe<string>;
        suffix?: Maybe<string>;
        NPI?: Maybe<string>;
        street?: Maybe<string>;
        streetTwo?: Maybe<string>;
        city?: Maybe<string>;
        state?: Maybe<string>;
        zipCode?: Maybe<string>;
        phone?: Maybe<string>;
      }>;
    }>;
  }>;
};

export type GetOrganizationQueryVariables = Exact<{ [key: string]: never }>;

export type GetOrganizationQuery = {
  __typename?: "Query";
  organization?: Maybe<{
    __typename?: "Organization";
    name: string;
    type: string;
  }>;
};

export type AdminSetOrganizationMutationVariables = Exact<{
  name: Scalars["String"];
  type: Scalars["String"];
}>;

export type AdminSetOrganizationMutation = {
  __typename?: "Mutation";
  adminUpdateOrganization?: Maybe<string>;
};

export type SetOrganizationMutationVariables = Exact<{
  type: Scalars["String"];
}>;

export type SetOrganizationMutation = {
  __typename?: "Mutation";
  updateOrganization?: Maybe<string>;
};

export type AllSelfRegistrationLinksQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AllSelfRegistrationLinksQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?: Maybe<{
      __typename?: "Organization";
      patientSelfRegistrationLink?: Maybe<string>;
      facilities: Array<{
        __typename?: "Facility";
        name?: Maybe<string>;
        patientSelfRegistrationLink?: Maybe<string>;
      }>;
    }>;
  };
};

export type GetUsersAndStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersAndStatusQuery = {
  __typename?: "Query";
  usersWithStatus?: Maybe<
    Array<
      Maybe<{
        __typename?: "ApiUserWithStatus";
        id?: Maybe<string>;
        firstName?: Maybe<string>;
        middleName?: Maybe<string>;
        lastName: string;
        email: string;
        status?: Maybe<string>;
      }>
    >
  >;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetUserQuery = {
  __typename?: "Query";
  user?: Maybe<{
    __typename?: "User";
    id?: Maybe<string>;
    firstName?: Maybe<string>;
    middleName?: Maybe<string>;
    lastName: string;
    roleDescription: string;
    role?: Maybe<Role>;
    permissions: Array<UserPermission>;
    email: string;
    status?: Maybe<string>;
    organization?: Maybe<{
      __typename?: "Organization";
      testingFacility: Array<{
        __typename?: "Facility";
        id?: Maybe<string>;
        name?: Maybe<string>;
      }>;
    }>;
  }>;
};

export type UpdateUserPrivilegesMutationVariables = Exact<{
  id: Scalars["ID"];
  role: Role;
  accessAllFacilities: Scalars["Boolean"];
  facilities: Array<Scalars["ID"]> | Scalars["ID"];
}>;

export type UpdateUserPrivilegesMutation = {
  __typename?: "Mutation";
  updateUserPrivileges?: Maybe<{ __typename?: "User"; id?: Maybe<string> }>;
};

export type ResetUserPasswordMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ResetUserPasswordMutation = {
  __typename?: "Mutation";
  resetUserPassword?: Maybe<{ __typename?: "User"; id?: Maybe<string> }>;
};

export type SetUserIsDeletedMutationVariables = Exact<{
  id: Scalars["ID"];
  deleted: Scalars["Boolean"];
}>;

export type SetUserIsDeletedMutation = {
  __typename?: "Mutation";
  setUserIsDeleted?: Maybe<{ __typename?: "User"; id?: Maybe<string> }>;
};

export type ReactivateUserMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ReactivateUserMutation = {
  __typename?: "Mutation";
  reactivateUser?: Maybe<{ __typename?: "User"; id?: Maybe<string> }>;
};

export type AddUserToCurrentOrgMutationVariables = Exact<{
  firstName?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  email: Scalars["String"];
  role: Role;
}>;

export type AddUserToCurrentOrgMutation = {
  __typename?: "Mutation";
  addUserToCurrentOrg?: Maybe<{ __typename?: "User"; id?: Maybe<string> }>;
};

export type GetFacilitiesForManageUsersQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetFacilitiesForManageUsersQuery = {
  __typename?: "Query";
  organization?: Maybe<{
    __typename?: "Organization";
    testingFacility: Array<{
      __typename?: "Facility";
      id?: Maybe<string>;
      name?: Maybe<string>;
    }>;
  }>;
};

export type CreateDeviceTypeMutationVariables = Exact<{
  name: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  loincCode: Scalars["String"];
  swabType: Scalars["String"];
}>;

export type CreateDeviceTypeMutation = {
  __typename?: "Mutation";
  createDeviceType?: Maybe<{
    __typename?: "DeviceType";
    internalId?: Maybe<string>;
  }>;
};

export type AddUserMutationVariables = Exact<{
  firstName?: Maybe<Scalars["String"]>;
  middleName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  email: Scalars["String"];
  organizationExternalId: Scalars["String"];
  role: Role;
}>;

export type AddUserMutation = {
  __typename?: "Mutation";
  addUser?: Maybe<{
    __typename?: "User";
    id?: Maybe<string>;
    email: string;
    role?: Maybe<Role>;
    name?: Maybe<{
      __typename?: "NameInfo";
      firstName?: Maybe<string>;
      middleName?: Maybe<string>;
      lastName: string;
      suffix?: Maybe<string>;
    }>;
    organization?: Maybe<{
      __typename?: "Organization";
      name: string;
      externalId: string;
      facilities: Array<{
        __typename?: "Facility";
        name?: Maybe<string>;
        id?: Maybe<string>;
      }>;
    }>;
  }>;
};

export type GetOrganizationsQueryVariables = Exact<{
  identityVerified?: Maybe<Scalars["Boolean"]>;
}>;

export type GetOrganizationsQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    externalId: string;
    name: string;
  }>;
};

export type SetCurrentUserTenantDataAccessOpMutationVariables = Exact<{
  organizationExternalId?: Maybe<Scalars["String"]>;
  justification?: Maybe<Scalars["String"]>;
}>;

export type SetCurrentUserTenantDataAccessOpMutation = {
  __typename?: "Mutation";
  setCurrentUserTenantDataAccess?: Maybe<{
    __typename?: "User";
    id?: Maybe<string>;
    email: string;
    permissions: Array<UserPermission>;
    role?: Maybe<Role>;
    organization?: Maybe<{
      __typename?: "Organization";
      name: string;
      externalId: string;
    }>;
  }>;
};

export type GetUnverifiedOrganizationsQueryVariables = Exact<{
  identityVerified?: Maybe<Scalars["Boolean"]>;
}>;

export type GetUnverifiedOrganizationsQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    name: string;
    externalId: string;
  }>;
};

export type SetOrgIdentityVerifiedMutationVariables = Exact<{
  externalId: Scalars["String"];
  verified: Scalars["Boolean"];
}>;

export type SetOrgIdentityVerifiedMutation = {
  __typename?: "Mutation";
  setOrganizationIdentityVerified?: Maybe<boolean>;
};

export type PatientExistsQueryVariables = Exact<{
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  zipCode: Scalars["String"];
  facilityId?: Maybe<Scalars["ID"]>;
}>;

export type PatientExistsQuery = {
  __typename?: "Query";
  patientExists?: Maybe<boolean>;
};

export type AddPatientMutationVariables = Exact<{
  facilityId?: Maybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  telephone?: Maybe<Scalars["String"]>;
  phoneNumbers?: Maybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: Maybe<Scalars["String"]>;
  lookupId?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  race?: Maybe<Scalars["String"]>;
  ethnicity?: Maybe<Scalars["String"]>;
  tribalAffiliation?: Maybe<Scalars["String"]>;
  gender?: Maybe<Scalars["String"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]>;
  preferredLanguage?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
}>;

export type AddPatientMutation = {
  __typename?: "Mutation";
  addPatient?: Maybe<{
    __typename?: "Patient";
    internalId?: Maybe<string>;
    facility?: Maybe<{ __typename?: "Facility"; id?: Maybe<string> }>;
  }>;
};

export type ArchivePersonMutationVariables = Exact<{
  id: Scalars["ID"];
  deleted: Scalars["Boolean"];
}>;

export type ArchivePersonMutation = {
  __typename?: "Mutation";
  setPatientIsDeleted?: Maybe<{
    __typename?: "Patient";
    internalId?: Maybe<string>;
  }>;
};

export type GetPatientDetailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetPatientDetailsQuery = {
  __typename?: "Query";
  patient?: Maybe<{
    __typename?: "Patient";
    firstName?: Maybe<string>;
    middleName?: Maybe<string>;
    lastName?: Maybe<string>;
    birthDate?: Maybe<any>;
    street?: Maybe<string>;
    streetTwo?: Maybe<string>;
    city?: Maybe<string>;
    state?: Maybe<string>;
    zipCode?: Maybe<string>;
    telephone?: Maybe<string>;
    role?: Maybe<string>;
    lookupId?: Maybe<string>;
    email?: Maybe<string>;
    county?: Maybe<string>;
    race?: Maybe<string>;
    ethnicity?: Maybe<string>;
    tribalAffiliation?: Maybe<Array<Maybe<string>>>;
    gender?: Maybe<string>;
    residentCongregateSetting?: Maybe<boolean>;
    employedInHealthcare?: Maybe<boolean>;
    preferredLanguage?: Maybe<string>;
    testResultDelivery?: Maybe<TestResultDeliveryPreference>;
    phoneNumbers?: Maybe<
      Array<
        Maybe<{
          __typename?: "PhoneNumber";
          type?: Maybe<PhoneType>;
          number?: Maybe<string>;
        }>
      >
    >;
    facility?: Maybe<{ __typename?: "Facility"; id?: Maybe<string> }>;
  }>;
};

export type UpdatePatientMutationVariables = Exact<{
  facilityId?: Maybe<Scalars["ID"]>;
  patientId: Scalars["ID"];
  firstName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  street: Scalars["String"];
  streetTwo?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  telephone?: Maybe<Scalars["String"]>;
  phoneNumbers?: Maybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: Maybe<Scalars["String"]>;
  lookupId?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  race?: Maybe<Scalars["String"]>;
  ethnicity?: Maybe<Scalars["String"]>;
  tribalAffiliation?: Maybe<Scalars["String"]>;
  gender?: Maybe<Scalars["String"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]>;
  preferredLanguage?: Maybe<Scalars["String"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
}>;

export type UpdatePatientMutation = {
  __typename?: "Mutation";
  updatePatient?: Maybe<{ __typename?: "Patient"; internalId?: Maybe<string> }>;
};

export type GetPatientsCountByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"];
  showDeleted: Scalars["Boolean"];
  namePrefixMatch?: Maybe<Scalars["String"]>;
}>;

export type GetPatientsCountByFacilityQuery = {
  __typename?: "Query";
  patientsCount?: Maybe<number>;
};

export type GetPatientsByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"];
  pageNumber: Scalars["Int"];
  pageSize: Scalars["Int"];
  showDeleted?: Maybe<Scalars["Boolean"]>;
  namePrefixMatch?: Maybe<Scalars["String"]>;
}>;

export type GetPatientsByFacilityQuery = {
  __typename?: "Query";
  patients?: Maybe<
    Array<
      Maybe<{
        __typename?: "Patient";
        internalId?: Maybe<string>;
        firstName?: Maybe<string>;
        lastName?: Maybe<string>;
        middleName?: Maybe<string>;
        birthDate?: Maybe<any>;
        isDeleted?: Maybe<boolean>;
        role?: Maybe<string>;
        lastTest?: Maybe<{
          __typename?: "TestResult";
          dateAdded?: Maybe<string>;
        }>;
      }>
    >
  >;
};

export type UploadPatientsMutationVariables = Exact<{
  patientList: Scalars["Upload"];
}>;

export type UploadPatientsMutation = {
  __typename?: "Mutation";
  uploadPatients?: Maybe<string>;
};

export type GetPatientsLastResultQueryVariables = Exact<{
  patientId: Scalars["ID"];
}>;

export type GetPatientsLastResultQuery = {
  __typename?: "Query";
  patient?: Maybe<{
    __typename?: "Patient";
    lastTest?: Maybe<{
      __typename?: "TestResult";
      dateTested?: Maybe<any>;
      result?: Maybe<string>;
    }>;
  }>;
};

export type RemovePatientFromQueueMutationVariables = Exact<{
  patientId: Scalars["ID"];
}>;

export type RemovePatientFromQueueMutation = {
  __typename?: "Mutation";
  removePatientFromQueue?: Maybe<string>;
};

export type EditQueueItemMutationVariables = Exact<{
  id: Scalars["ID"];
  deviceId?: Maybe<Scalars["String"]>;
  result?: Maybe<Scalars["String"]>;
  dateTested?: Maybe<Scalars["DateTime"]>;
}>;

export type EditQueueItemMutation = {
  __typename?: "Mutation";
  editQueueItem?: Maybe<{
    __typename?: "TestOrder";
    result?: Maybe<string>;
    dateTested?: Maybe<any>;
    deviceType?: Maybe<{
      __typename?: "DeviceType";
      internalId?: Maybe<string>;
      testLength?: Maybe<number>;
    }>;
  }>;
};

export type SubmitTestResultMutationVariables = Exact<{
  patientId: Scalars["ID"];
  deviceId: Scalars["String"];
  result: Scalars["String"];
  dateTested?: Maybe<Scalars["DateTime"]>;
}>;

export type SubmitTestResultMutation = {
  __typename?: "Mutation";
  addTestResultNew?: Maybe<{
    __typename?: "AddTestResultResponse";
    deliverySuccess?: Maybe<boolean>;
    testResult: { __typename?: "TestOrder"; internalId?: Maybe<string> };
  }>;
};

export type GetFacilityQueueQueryVariables = Exact<{
  facilityId: Scalars["ID"];
}>;

export type GetFacilityQueueQuery = {
  __typename?: "Query";
  queue?: Maybe<
    Array<
      Maybe<{
        __typename?: "TestOrder";
        internalId?: Maybe<string>;
        pregnancy?: Maybe<string>;
        dateAdded?: Maybe<string>;
        symptoms?: Maybe<string>;
        symptomOnset?: Maybe<any>;
        noSymptoms?: Maybe<boolean>;
        firstTest?: Maybe<boolean>;
        priorTestDate?: Maybe<any>;
        priorTestType?: Maybe<string>;
        priorTestResult?: Maybe<string>;
        result?: Maybe<string>;
        dateTested?: Maybe<any>;
        deviceType?: Maybe<{
          __typename?: "DeviceType";
          internalId?: Maybe<string>;
          name?: Maybe<string>;
          model?: Maybe<string>;
          testLength?: Maybe<number>;
        }>;
        patient?: Maybe<{
          __typename?: "Patient";
          internalId?: Maybe<string>;
          telephone?: Maybe<string>;
          birthDate?: Maybe<any>;
          firstName?: Maybe<string>;
          middleName?: Maybe<string>;
          lastName?: Maybe<string>;
          gender?: Maybe<string>;
          testResultDelivery?: Maybe<TestResultDeliveryPreference>;
          preferredLanguage?: Maybe<string>;
          phoneNumbers?: Maybe<
            Array<
              Maybe<{
                __typename?: "PhoneNumber";
                type?: Maybe<PhoneType>;
                number?: Maybe<string>;
              }>
            >
          >;
        }>;
      }>
    >
  >;
  organization?: Maybe<{
    __typename?: "Organization";
    testingFacility: Array<{
      __typename?: "Facility";
      id?: Maybe<string>;
      deviceTypes?: Maybe<
        Array<
          Maybe<{
            __typename?: "DeviceType";
            internalId?: Maybe<string>;
            name?: Maybe<string>;
            model?: Maybe<string>;
            testLength?: Maybe<number>;
          }>
        >
      >;
      defaultDeviceType?: Maybe<{
        __typename?: "DeviceType";
        internalId?: Maybe<string>;
        name?: Maybe<string>;
        model?: Maybe<string>;
        testLength?: Maybe<number>;
      }>;
    }>;
  }>;
};

export type GetPatientQueryVariables = Exact<{
  internalId: Scalars["ID"];
}>;

export type GetPatientQuery = {
  __typename?: "Query";
  patient?: Maybe<{
    __typename?: "Patient";
    internalId?: Maybe<string>;
    firstName?: Maybe<string>;
    lastName?: Maybe<string>;
    middleName?: Maybe<string>;
    birthDate?: Maybe<any>;
    gender?: Maybe<string>;
    telephone?: Maybe<string>;
    testResultDelivery?: Maybe<TestResultDeliveryPreference>;
    phoneNumbers?: Maybe<
      Array<
        Maybe<{
          __typename?: "PhoneNumber";
          type?: Maybe<PhoneType>;
          number?: Maybe<string>;
        }>
      >
    >;
  }>;
};

export type GetPatientsByFacilityForQueueQueryVariables = Exact<{
  facilityId: Scalars["ID"];
  namePrefixMatch?: Maybe<Scalars["String"]>;
}>;

export type GetPatientsByFacilityForQueueQuery = {
  __typename?: "Query";
  patients?: Maybe<
    Array<
      Maybe<{
        __typename?: "Patient";
        internalId?: Maybe<string>;
        firstName?: Maybe<string>;
        lastName?: Maybe<string>;
        middleName?: Maybe<string>;
        birthDate?: Maybe<any>;
        gender?: Maybe<string>;
        telephone?: Maybe<string>;
        testResultDelivery?: Maybe<TestResultDeliveryPreference>;
        phoneNumbers?: Maybe<
          Array<
            Maybe<{
              __typename?: "PhoneNumber";
              type?: Maybe<PhoneType>;
              number?: Maybe<string>;
            }>
          >
        >;
      }>
    >
  >;
};

export type AddPatientToQueueMutationVariables = Exact<{
  facilityId: Scalars["ID"];
  patientId: Scalars["ID"];
  symptoms?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  pregnancy?: Maybe<Scalars["String"]>;
  firstTest?: Maybe<Scalars["Boolean"]>;
  priorTestDate?: Maybe<Scalars["LocalDate"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
}>;

export type AddPatientToQueueMutation = {
  __typename?: "Mutation";
  addPatientToQueue?: Maybe<string>;
};

export type UpdateAoeMutationVariables = Exact<{
  patientId: Scalars["ID"];
  symptoms?: Maybe<Scalars["String"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  pregnancy?: Maybe<Scalars["String"]>;
  firstTest?: Maybe<Scalars["Boolean"]>;
  priorTestDate?: Maybe<Scalars["LocalDate"]>;
  priorTestType?: Maybe<Scalars["String"]>;
  priorTestResult?: Maybe<Scalars["String"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
}>;

export type UpdateAoeMutation = {
  __typename?: "Mutation";
  updateTimeOfTestQuestions?: Maybe<string>;
};

export type GetTestResultForCorrectionQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForCorrectionQuery = {
  __typename?: "Query";
  testResult?: Maybe<{
    __typename?: "TestResult";
    dateTested?: Maybe<any>;
    result?: Maybe<string>;
    correctionStatus?: Maybe<string>;
    deviceType?: Maybe<{ __typename?: "DeviceType"; name?: Maybe<string> }>;
    patient?: Maybe<{
      __typename?: "Patient";
      firstName?: Maybe<string>;
      middleName?: Maybe<string>;
      lastName?: Maybe<string>;
      birthDate?: Maybe<any>;
    }>;
  }>;
};

export type MarkTestAsErrorMutationVariables = Exact<{
  id: Scalars["ID"];
  reason: Scalars["String"];
}>;

export type MarkTestAsErrorMutation = {
  __typename?: "Mutation";
  correctTestMarkAsError?: Maybe<{
    __typename?: "TestResult";
    internalId?: Maybe<string>;
  }>;
};

export type GetTestResultDetailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultDetailsQuery = {
  __typename?: "Query";
  testResult?: Maybe<{
    __typename?: "TestResult";
    dateTested?: Maybe<any>;
    result?: Maybe<string>;
    correctionStatus?: Maybe<string>;
    symptoms?: Maybe<string>;
    symptomOnset?: Maybe<any>;
    pregnancy?: Maybe<string>;
    deviceType?: Maybe<{ __typename?: "DeviceType"; name?: Maybe<string> }>;
    patient?: Maybe<{
      __typename?: "Patient";
      firstName?: Maybe<string>;
      middleName?: Maybe<string>;
      lastName?: Maybe<string>;
      birthDate?: Maybe<any>;
    }>;
    createdBy?: Maybe<{
      __typename?: "ApiUser";
      name: {
        __typename?: "NameInfo";
        firstName?: Maybe<string>;
        middleName?: Maybe<string>;
        lastName: string;
      };
    }>;
  }>;
};

export type GetTestResultForPrintQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForPrintQuery = {
  __typename?: "Query";
  testResult?: Maybe<{
    __typename?: "TestResult";
    dateTested?: Maybe<any>;
    result?: Maybe<string>;
    correctionStatus?: Maybe<string>;
    deviceType?: Maybe<{ __typename?: "DeviceType"; name?: Maybe<string> }>;
    patient?: Maybe<{
      __typename?: "Patient";
      firstName?: Maybe<string>;
      middleName?: Maybe<string>;
      lastName?: Maybe<string>;
      birthDate?: Maybe<any>;
    }>;
    facility?: Maybe<{
      __typename?: "Facility";
      name?: Maybe<string>;
      cliaNumber?: Maybe<string>;
      phone?: Maybe<string>;
      street?: Maybe<string>;
      streetTwo?: Maybe<string>;
      city?: Maybe<string>;
      state?: Maybe<string>;
      zipCode?: Maybe<string>;
      orderingProvider?: Maybe<{
        __typename?: "Provider";
        firstName?: Maybe<string>;
        middleName?: Maybe<string>;
        lastName?: Maybe<string>;
        NPI?: Maybe<string>;
      }>;
    }>;
    testPerformed: {
      __typename?: "TestDescription";
      name: string;
      loincCode: string;
    };
  }>;
};

export type GetResultsCountByFacilityQueryVariables = Exact<{
  facilityId?: Maybe<Scalars["ID"]>;
  patientId?: Maybe<Scalars["ID"]>;
  result?: Maybe<Scalars["String"]>;
  role?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["DateTime"]>;
  endDate?: Maybe<Scalars["DateTime"]>;
}>;

export type GetResultsCountByFacilityQuery = {
  __typename?: "Query";
  testResultsCount?: Maybe<number>;
};

export type GetFacilityResultsQueryVariables = Exact<{
  facilityId?: Maybe<Scalars["ID"]>;
  patientId?: Maybe<Scalars["ID"]>;
  result?: Maybe<Scalars["String"]>;
  role?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["DateTime"]>;
  endDate?: Maybe<Scalars["DateTime"]>;
  pageNumber?: Maybe<Scalars["Int"]>;
  pageSize?: Maybe<Scalars["Int"]>;
}>;

export type GetFacilityResultsQuery = {
  __typename?: "Query";
  testResults?: Maybe<
    Array<
      Maybe<{
        __typename?: "TestResult";
        internalId?: Maybe<string>;
        dateTested?: Maybe<any>;
        result?: Maybe<string>;
        correctionStatus?: Maybe<string>;
        symptoms?: Maybe<string>;
        noSymptoms?: Maybe<boolean>;
        deviceType?: Maybe<{
          __typename?: "DeviceType";
          internalId?: Maybe<string>;
          name?: Maybe<string>;
        }>;
        patient?: Maybe<{
          __typename?: "Patient";
          internalId?: Maybe<string>;
          firstName?: Maybe<string>;
          middleName?: Maybe<string>;
          lastName?: Maybe<string>;
          birthDate?: Maybe<any>;
          gender?: Maybe<string>;
          lookupId?: Maybe<string>;
        }>;
        createdBy?: Maybe<{
          __typename?: "ApiUser";
          nameInfo?: Maybe<{
            __typename?: "NameInfo";
            firstName?: Maybe<string>;
            middleName?: Maybe<string>;
            lastName: string;
          }>;
        }>;
        patientLink?: Maybe<{
          __typename?: "PatientLink";
          internalId?: Maybe<string>;
        }>;
      }>
    >
  >;
};

export const WhoAmIDocument = gql`
  query WhoAmI {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      email
      isAdmin
      permissions
      roleDescription
      organization {
        name
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useWhoAmIQuery__
 *
 * To run a query within a React component, call `useWhoAmIQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhoAmIQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhoAmIQuery({
 *   variables: {
 *   },
 * });
 */
export function useWhoAmIQuery(
  baseOptions?: Apollo.QueryHookOptions<WhoAmIQuery, WhoAmIQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<WhoAmIQuery, WhoAmIQueryVariables>(
    WhoAmIDocument,
    options
  );
}
export function useWhoAmILazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<WhoAmIQuery, WhoAmIQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<WhoAmIQuery, WhoAmIQueryVariables>(
    WhoAmIDocument,
    options
  );
}
export type WhoAmIQueryHookResult = ReturnType<typeof useWhoAmIQuery>;
export type WhoAmILazyQueryHookResult = ReturnType<typeof useWhoAmILazyQuery>;
export type WhoAmIQueryResult = Apollo.QueryResult<
  WhoAmIQuery,
  WhoAmIQueryVariables
>;
export const GetFacilitiesDocument = gql`
  query GetFacilities {
    organization {
      internalId
      testingFacility {
        id
        cliaNumber
        name
        street
        streetTwo
        city
        state
        zipCode
        phone
        email
        defaultDeviceType {
          internalId
        }
        deviceTypes {
          internalId
        }
        orderingProvider {
          firstName
          middleName
          lastName
          suffix
          NPI
          street
          streetTwo
          city
          state
          zipCode
          phone
        }
      }
    }
    deviceType {
      internalId
      name
    }
  }
`;

/**
 * __useGetFacilitiesQuery__
 *
 * To run a query within a React component, call `useGetFacilitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFacilitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacilitiesQuery,
    GetFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFacilitiesQuery, GetFacilitiesQueryVariables>(
    GetFacilitiesDocument,
    options
  );
}
export function useGetFacilitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilitiesQuery,
    GetFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFacilitiesQuery, GetFacilitiesQueryVariables>(
    GetFacilitiesDocument,
    options
  );
}
export type GetFacilitiesQueryHookResult = ReturnType<
  typeof useGetFacilitiesQuery
>;
export type GetFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetFacilitiesLazyQuery
>;
export type GetFacilitiesQueryResult = Apollo.QueryResult<
  GetFacilitiesQuery,
  GetFacilitiesQueryVariables
>;
export const UpdateFacilityDocument = gql`
  mutation UpdateFacility(
    $facilityId: ID!
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $phone: String
    $email: String
    $orderingProviderFirstName: String
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String
    $orderingProviderSuffix: String
    $orderingProviderNPI: String
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderState: String
    $orderingProviderZipCode: String
    $orderingProviderPhone: String
    $devices: [String]!
    $defaultDevice: String!
  ) {
    updateFacility(
      facilityId: $facilityId
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      phone: $phone
      email: $email
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      defaultDevice: $defaultDevice
    )
  }
`;
export type UpdateFacilityMutationFn = Apollo.MutationFunction<
  UpdateFacilityMutation,
  UpdateFacilityMutationVariables
>;

/**
 * __useUpdateFacilityMutation__
 *
 * To run a mutation, you first call `useUpdateFacilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFacilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFacilityMutation, { data, loading, error }] = useUpdateFacilityMutation({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      testingFacilityName: // value for 'testingFacilityName'
 *      cliaNumber: // value for 'cliaNumber'
 *      street: // value for 'street'
 *      streetTwo: // value for 'streetTwo'
 *      city: // value for 'city'
 *      state: // value for 'state'
 *      zipCode: // value for 'zipCode'
 *      phone: // value for 'phone'
 *      email: // value for 'email'
 *      orderingProviderFirstName: // value for 'orderingProviderFirstName'
 *      orderingProviderMiddleName: // value for 'orderingProviderMiddleName'
 *      orderingProviderLastName: // value for 'orderingProviderLastName'
 *      orderingProviderSuffix: // value for 'orderingProviderSuffix'
 *      orderingProviderNPI: // value for 'orderingProviderNPI'
 *      orderingProviderStreet: // value for 'orderingProviderStreet'
 *      orderingProviderStreetTwo: // value for 'orderingProviderStreetTwo'
 *      orderingProviderCity: // value for 'orderingProviderCity'
 *      orderingProviderState: // value for 'orderingProviderState'
 *      orderingProviderZipCode: // value for 'orderingProviderZipCode'
 *      orderingProviderPhone: // value for 'orderingProviderPhone'
 *      devices: // value for 'devices'
 *      defaultDevice: // value for 'defaultDevice'
 *   },
 * });
 */
export function useUpdateFacilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateFacilityMutation,
    UpdateFacilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateFacilityMutation,
    UpdateFacilityMutationVariables
  >(UpdateFacilityDocument, options);
}
export type UpdateFacilityMutationHookResult = ReturnType<
  typeof useUpdateFacilityMutation
>;
export type UpdateFacilityMutationResult = Apollo.MutationResult<UpdateFacilityMutation>;
export type UpdateFacilityMutationOptions = Apollo.BaseMutationOptions<
  UpdateFacilityMutation,
  UpdateFacilityMutationVariables
>;
export const AddFacilityDocument = gql`
  mutation AddFacility(
    $testingFacilityName: String!
    $cliaNumber: String
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $phone: String
    $email: String
    $orderingProviderFirstName: String
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String
    $orderingProviderSuffix: String
    $orderingProviderNPI: String
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderState: String
    $orderingProviderZipCode: String
    $orderingProviderPhone: String
    $devices: [String]!
    $defaultDevice: String!
  ) {
    addFacility(
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      phone: $phone
      email: $email
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      defaultDevice: $defaultDevice
    )
  }
`;
export type AddFacilityMutationFn = Apollo.MutationFunction<
  AddFacilityMutation,
  AddFacilityMutationVariables
>;

/**
 * __useAddFacilityMutation__
 *
 * To run a mutation, you first call `useAddFacilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFacilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFacilityMutation, { data, loading, error }] = useAddFacilityMutation({
 *   variables: {
 *      testingFacilityName: // value for 'testingFacilityName'
 *      cliaNumber: // value for 'cliaNumber'
 *      street: // value for 'street'
 *      streetTwo: // value for 'streetTwo'
 *      city: // value for 'city'
 *      state: // value for 'state'
 *      zipCode: // value for 'zipCode'
 *      phone: // value for 'phone'
 *      email: // value for 'email'
 *      orderingProviderFirstName: // value for 'orderingProviderFirstName'
 *      orderingProviderMiddleName: // value for 'orderingProviderMiddleName'
 *      orderingProviderLastName: // value for 'orderingProviderLastName'
 *      orderingProviderSuffix: // value for 'orderingProviderSuffix'
 *      orderingProviderNPI: // value for 'orderingProviderNPI'
 *      orderingProviderStreet: // value for 'orderingProviderStreet'
 *      orderingProviderStreetTwo: // value for 'orderingProviderStreetTwo'
 *      orderingProviderCity: // value for 'orderingProviderCity'
 *      orderingProviderState: // value for 'orderingProviderState'
 *      orderingProviderZipCode: // value for 'orderingProviderZipCode'
 *      orderingProviderPhone: // value for 'orderingProviderPhone'
 *      devices: // value for 'devices'
 *      defaultDevice: // value for 'defaultDevice'
 *   },
 * });
 */
export function useAddFacilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddFacilityMutation,
    AddFacilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddFacilityMutation, AddFacilityMutationVariables>(
    AddFacilityDocument,
    options
  );
}
export type AddFacilityMutationHookResult = ReturnType<
  typeof useAddFacilityMutation
>;
export type AddFacilityMutationResult = Apollo.MutationResult<AddFacilityMutation>;
export type AddFacilityMutationOptions = Apollo.BaseMutationOptions<
  AddFacilityMutation,
  AddFacilityMutationVariables
>;
export const GetManagedFacilitiesDocument = gql`
  query GetManagedFacilities {
    organization {
      testingFacility {
        id
        cliaNumber
        name
        street
        streetTwo
        city
        state
        zipCode
        phone
        email
        defaultDeviceType {
          internalId
        }
        deviceTypes {
          internalId
        }
        orderingProvider {
          firstName
          middleName
          lastName
          suffix
          NPI
          street
          streetTwo
          city
          state
          zipCode
          phone
        }
      }
    }
  }
`;

/**
 * __useGetManagedFacilitiesQuery__
 *
 * To run a query within a React component, call `useGetManagedFacilitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManagedFacilitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManagedFacilitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetManagedFacilitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetManagedFacilitiesQuery,
    GetManagedFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetManagedFacilitiesQuery,
    GetManagedFacilitiesQueryVariables
  >(GetManagedFacilitiesDocument, options);
}
export function useGetManagedFacilitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetManagedFacilitiesQuery,
    GetManagedFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetManagedFacilitiesQuery,
    GetManagedFacilitiesQueryVariables
  >(GetManagedFacilitiesDocument, options);
}
export type GetManagedFacilitiesQueryHookResult = ReturnType<
  typeof useGetManagedFacilitiesQuery
>;
export type GetManagedFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetManagedFacilitiesLazyQuery
>;
export type GetManagedFacilitiesQueryResult = Apollo.QueryResult<
  GetManagedFacilitiesQuery,
  GetManagedFacilitiesQueryVariables
>;
export const GetOrganizationDocument = gql`
  query GetOrganization {
    organization {
      name
      type
    }
  }
`;

/**
 * __useGetOrganizationQuery__
 *
 * To run a query within a React component, call `useGetOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrganizationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrganizationQuery,
    GetOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrganizationQuery, GetOrganizationQueryVariables>(
    GetOrganizationDocument,
    options
  );
}
export function useGetOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationQuery,
    GetOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationQuery,
    GetOrganizationQueryVariables
  >(GetOrganizationDocument, options);
}
export type GetOrganizationQueryHookResult = ReturnType<
  typeof useGetOrganizationQuery
>;
export type GetOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationLazyQuery
>;
export type GetOrganizationQueryResult = Apollo.QueryResult<
  GetOrganizationQuery,
  GetOrganizationQueryVariables
>;
export const AdminSetOrganizationDocument = gql`
  mutation AdminSetOrganization($name: String!, $type: String!) {
    adminUpdateOrganization(name: $name, type: $type)
  }
`;
export type AdminSetOrganizationMutationFn = Apollo.MutationFunction<
  AdminSetOrganizationMutation,
  AdminSetOrganizationMutationVariables
>;

/**
 * __useAdminSetOrganizationMutation__
 *
 * To run a mutation, you first call `useAdminSetOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAdminSetOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [adminSetOrganizationMutation, { data, loading, error }] = useAdminSetOrganizationMutation({
 *   variables: {
 *      name: // value for 'name'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useAdminSetOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AdminSetOrganizationMutation,
    AdminSetOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AdminSetOrganizationMutation,
    AdminSetOrganizationMutationVariables
  >(AdminSetOrganizationDocument, options);
}
export type AdminSetOrganizationMutationHookResult = ReturnType<
  typeof useAdminSetOrganizationMutation
>;
export type AdminSetOrganizationMutationResult = Apollo.MutationResult<AdminSetOrganizationMutation>;
export type AdminSetOrganizationMutationOptions = Apollo.BaseMutationOptions<
  AdminSetOrganizationMutation,
  AdminSetOrganizationMutationVariables
>;
export const SetOrganizationDocument = gql`
  mutation SetOrganization($type: String!) {
    updateOrganization(type: $type)
  }
`;
export type SetOrganizationMutationFn = Apollo.MutationFunction<
  SetOrganizationMutation,
  SetOrganizationMutationVariables
>;

/**
 * __useSetOrganizationMutation__
 *
 * To run a mutation, you first call `useSetOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOrganizationMutation, { data, loading, error }] = useSetOrganizationMutation({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useSetOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetOrganizationMutation,
    SetOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetOrganizationMutation,
    SetOrganizationMutationVariables
  >(SetOrganizationDocument, options);
}
export type SetOrganizationMutationHookResult = ReturnType<
  typeof useSetOrganizationMutation
>;
export type SetOrganizationMutationResult = Apollo.MutationResult<SetOrganizationMutation>;
export type SetOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SetOrganizationMutation,
  SetOrganizationMutationVariables
>;
export const AllSelfRegistrationLinksDocument = gql`
  query AllSelfRegistrationLinks {
    whoami {
      organization {
        patientSelfRegistrationLink
        facilities {
          name
          patientSelfRegistrationLink
        }
      }
    }
  }
`;

/**
 * __useAllSelfRegistrationLinksQuery__
 *
 * To run a query within a React component, call `useAllSelfRegistrationLinksQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllSelfRegistrationLinksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllSelfRegistrationLinksQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllSelfRegistrationLinksQuery(
  baseOptions?: Apollo.QueryHookOptions<
    AllSelfRegistrationLinksQuery,
    AllSelfRegistrationLinksQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    AllSelfRegistrationLinksQuery,
    AllSelfRegistrationLinksQueryVariables
  >(AllSelfRegistrationLinksDocument, options);
}
export function useAllSelfRegistrationLinksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AllSelfRegistrationLinksQuery,
    AllSelfRegistrationLinksQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AllSelfRegistrationLinksQuery,
    AllSelfRegistrationLinksQueryVariables
  >(AllSelfRegistrationLinksDocument, options);
}
export type AllSelfRegistrationLinksQueryHookResult = ReturnType<
  typeof useAllSelfRegistrationLinksQuery
>;
export type AllSelfRegistrationLinksLazyQueryHookResult = ReturnType<
  typeof useAllSelfRegistrationLinksLazyQuery
>;
export type AllSelfRegistrationLinksQueryResult = Apollo.QueryResult<
  AllSelfRegistrationLinksQuery,
  AllSelfRegistrationLinksQueryVariables
>;
export const GetUsersAndStatusDocument = gql`
  query GetUsersAndStatus {
    usersWithStatus {
      id
      firstName
      middleName
      lastName
      email
      status
    }
  }
`;

/**
 * __useGetUsersAndStatusQuery__
 *
 * To run a query within a React component, call `useGetUsersAndStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersAndStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersAndStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersAndStatusQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUsersAndStatusQuery,
    GetUsersAndStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUsersAndStatusQuery,
    GetUsersAndStatusQueryVariables
  >(GetUsersAndStatusDocument, options);
}
export function useGetUsersAndStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUsersAndStatusQuery,
    GetUsersAndStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUsersAndStatusQuery,
    GetUsersAndStatusQueryVariables
  >(GetUsersAndStatusDocument, options);
}
export type GetUsersAndStatusQueryHookResult = ReturnType<
  typeof useGetUsersAndStatusQuery
>;
export type GetUsersAndStatusLazyQueryHookResult = ReturnType<
  typeof useGetUsersAndStatusLazyQuery
>;
export type GetUsersAndStatusQueryResult = Apollo.QueryResult<
  GetUsersAndStatusQuery,
  GetUsersAndStatusQueryVariables
>;
export const GetUserDocument = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      firstName
      middleName
      lastName
      roleDescription
      role
      permissions
      email
      status
      organization {
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const UpdateUserPrivilegesDocument = gql`
  mutation UpdateUserPrivileges(
    $id: ID!
    $role: Role!
    $accessAllFacilities: Boolean!
    $facilities: [ID!]!
  ) {
    updateUserPrivileges(
      id: $id
      role: $role
      accessAllFacilities: $accessAllFacilities
      facilities: $facilities
    ) {
      id
    }
  }
`;
export type UpdateUserPrivilegesMutationFn = Apollo.MutationFunction<
  UpdateUserPrivilegesMutation,
  UpdateUserPrivilegesMutationVariables
>;

/**
 * __useUpdateUserPrivilegesMutation__
 *
 * To run a mutation, you first call `useUpdateUserPrivilegesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPrivilegesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPrivilegesMutation, { data, loading, error }] = useUpdateUserPrivilegesMutation({
 *   variables: {
 *      id: // value for 'id'
 *      role: // value for 'role'
 *      accessAllFacilities: // value for 'accessAllFacilities'
 *      facilities: // value for 'facilities'
 *   },
 * });
 */
export function useUpdateUserPrivilegesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserPrivilegesMutation,
    UpdateUserPrivilegesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserPrivilegesMutation,
    UpdateUserPrivilegesMutationVariables
  >(UpdateUserPrivilegesDocument, options);
}
export type UpdateUserPrivilegesMutationHookResult = ReturnType<
  typeof useUpdateUserPrivilegesMutation
>;
export type UpdateUserPrivilegesMutationResult = Apollo.MutationResult<UpdateUserPrivilegesMutation>;
export type UpdateUserPrivilegesMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserPrivilegesMutation,
  UpdateUserPrivilegesMutationVariables
>;
export const ResetUserPasswordDocument = gql`
  mutation ResetUserPassword($id: ID!) {
    resetUserPassword(id: $id) {
      id
    }
  }
`;
export type ResetUserPasswordMutationFn = Apollo.MutationFunction<
  ResetUserPasswordMutation,
  ResetUserPasswordMutationVariables
>;

/**
 * __useResetUserPasswordMutation__
 *
 * To run a mutation, you first call `useResetUserPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetUserPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetUserPasswordMutation, { data, loading, error }] = useResetUserPasswordMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResetUserPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResetUserPasswordMutation,
    ResetUserPasswordMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResetUserPasswordMutation,
    ResetUserPasswordMutationVariables
  >(ResetUserPasswordDocument, options);
}
export type ResetUserPasswordMutationHookResult = ReturnType<
  typeof useResetUserPasswordMutation
>;
export type ResetUserPasswordMutationResult = Apollo.MutationResult<ResetUserPasswordMutation>;
export type ResetUserPasswordMutationOptions = Apollo.BaseMutationOptions<
  ResetUserPasswordMutation,
  ResetUserPasswordMutationVariables
>;
export const SetUserIsDeletedDocument = gql`
  mutation SetUserIsDeleted($id: ID!, $deleted: Boolean!) {
    setUserIsDeleted(id: $id, deleted: $deleted) {
      id
    }
  }
`;
export type SetUserIsDeletedMutationFn = Apollo.MutationFunction<
  SetUserIsDeletedMutation,
  SetUserIsDeletedMutationVariables
>;

/**
 * __useSetUserIsDeletedMutation__
 *
 * To run a mutation, you first call `useSetUserIsDeletedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetUserIsDeletedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setUserIsDeletedMutation, { data, loading, error }] = useSetUserIsDeletedMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deleted: // value for 'deleted'
 *   },
 * });
 */
export function useSetUserIsDeletedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetUserIsDeletedMutation,
    SetUserIsDeletedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetUserIsDeletedMutation,
    SetUserIsDeletedMutationVariables
  >(SetUserIsDeletedDocument, options);
}
export type SetUserIsDeletedMutationHookResult = ReturnType<
  typeof useSetUserIsDeletedMutation
>;
export type SetUserIsDeletedMutationResult = Apollo.MutationResult<SetUserIsDeletedMutation>;
export type SetUserIsDeletedMutationOptions = Apollo.BaseMutationOptions<
  SetUserIsDeletedMutation,
  SetUserIsDeletedMutationVariables
>;
export const ReactivateUserDocument = gql`
  mutation ReactivateUser($id: ID!) {
    reactivateUser(id: $id) {
      id
    }
  }
`;
export type ReactivateUserMutationFn = Apollo.MutationFunction<
  ReactivateUserMutation,
  ReactivateUserMutationVariables
>;

/**
 * __useReactivateUserMutation__
 *
 * To run a mutation, you first call `useReactivateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactivateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactivateUserMutation, { data, loading, error }] = useReactivateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useReactivateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ReactivateUserMutation,
    ReactivateUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ReactivateUserMutation,
    ReactivateUserMutationVariables
  >(ReactivateUserDocument, options);
}
export type ReactivateUserMutationHookResult = ReturnType<
  typeof useReactivateUserMutation
>;
export type ReactivateUserMutationResult = Apollo.MutationResult<ReactivateUserMutation>;
export type ReactivateUserMutationOptions = Apollo.BaseMutationOptions<
  ReactivateUserMutation,
  ReactivateUserMutationVariables
>;
export const AddUserToCurrentOrgDocument = gql`
  mutation AddUserToCurrentOrg(
    $firstName: String
    $lastName: String!
    $email: String!
    $role: Role!
  ) {
    addUserToCurrentOrg(
      firstName: $firstName
      lastName: $lastName
      email: $email
      role: $role
    ) {
      id
    }
  }
`;
export type AddUserToCurrentOrgMutationFn = Apollo.MutationFunction<
  AddUserToCurrentOrgMutation,
  AddUserToCurrentOrgMutationVariables
>;

/**
 * __useAddUserToCurrentOrgMutation__
 *
 * To run a mutation, you first call `useAddUserToCurrentOrgMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToCurrentOrgMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToCurrentOrgMutation, { data, loading, error }] = useAddUserToCurrentOrgMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      email: // value for 'email'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddUserToCurrentOrgMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddUserToCurrentOrgMutation,
    AddUserToCurrentOrgMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddUserToCurrentOrgMutation,
    AddUserToCurrentOrgMutationVariables
  >(AddUserToCurrentOrgDocument, options);
}
export type AddUserToCurrentOrgMutationHookResult = ReturnType<
  typeof useAddUserToCurrentOrgMutation
>;
export type AddUserToCurrentOrgMutationResult = Apollo.MutationResult<AddUserToCurrentOrgMutation>;
export type AddUserToCurrentOrgMutationOptions = Apollo.BaseMutationOptions<
  AddUserToCurrentOrgMutation,
  AddUserToCurrentOrgMutationVariables
>;
export const GetFacilitiesForManageUsersDocument = gql`
  query GetFacilitiesForManageUsers {
    organization {
      testingFacility {
        id
        name
      }
    }
  }
`;

/**
 * __useGetFacilitiesForManageUsersQuery__
 *
 * To run a query within a React component, call `useGetFacilitiesForManageUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilitiesForManageUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilitiesForManageUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFacilitiesForManageUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacilitiesForManageUsersQuery,
    GetFacilitiesForManageUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilitiesForManageUsersQuery,
    GetFacilitiesForManageUsersQueryVariables
  >(GetFacilitiesForManageUsersDocument, options);
}
export function useGetFacilitiesForManageUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilitiesForManageUsersQuery,
    GetFacilitiesForManageUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilitiesForManageUsersQuery,
    GetFacilitiesForManageUsersQueryVariables
  >(GetFacilitiesForManageUsersDocument, options);
}
export type GetFacilitiesForManageUsersQueryHookResult = ReturnType<
  typeof useGetFacilitiesForManageUsersQuery
>;
export type GetFacilitiesForManageUsersLazyQueryHookResult = ReturnType<
  typeof useGetFacilitiesForManageUsersLazyQuery
>;
export type GetFacilitiesForManageUsersQueryResult = Apollo.QueryResult<
  GetFacilitiesForManageUsersQuery,
  GetFacilitiesForManageUsersQueryVariables
>;
export const CreateDeviceTypeDocument = gql`
  mutation createDeviceType(
    $name: String!
    $manufacturer: String!
    $model: String!
    $loincCode: String!
    $swabType: String!
  ) {
    createDeviceType(
      name: $name
      manufacturer: $manufacturer
      model: $model
      loincCode: $loincCode
      swabType: $swabType
    ) {
      internalId
    }
  }
`;
export type CreateDeviceTypeMutationFn = Apollo.MutationFunction<
  CreateDeviceTypeMutation,
  CreateDeviceTypeMutationVariables
>;

/**
 * __useCreateDeviceTypeMutation__
 *
 * To run a mutation, you first call `useCreateDeviceTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDeviceTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDeviceTypeMutation, { data, loading, error }] = useCreateDeviceTypeMutation({
 *   variables: {
 *      name: // value for 'name'
 *      manufacturer: // value for 'manufacturer'
 *      model: // value for 'model'
 *      loincCode: // value for 'loincCode'
 *      swabType: // value for 'swabType'
 *   },
 * });
 */
export function useCreateDeviceTypeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateDeviceTypeMutation,
    CreateDeviceTypeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateDeviceTypeMutation,
    CreateDeviceTypeMutationVariables
  >(CreateDeviceTypeDocument, options);
}
export type CreateDeviceTypeMutationHookResult = ReturnType<
  typeof useCreateDeviceTypeMutation
>;
export type CreateDeviceTypeMutationResult = Apollo.MutationResult<CreateDeviceTypeMutation>;
export type CreateDeviceTypeMutationOptions = Apollo.BaseMutationOptions<
  CreateDeviceTypeMutation,
  CreateDeviceTypeMutationVariables
>;
export const AddUserDocument = gql`
  mutation AddUser(
    $firstName: String
    $middleName: String
    $lastName: String
    $suffix: String
    $email: String!
    $organizationExternalId: String!
    $role: Role!
  ) {
    addUser(
      name: {
        firstName: $firstName
        middleName: $middleName
        lastName: $lastName
        suffix: $suffix
      }
      email: $email
      organizationExternalId: $organizationExternalId
      role: $role
    ) {
      id
      name {
        firstName
        middleName
        lastName
        suffix
      }
      email
      role
      organization {
        name
        externalId
        facilities {
          name
          id
        }
      }
    }
  }
`;
export type AddUserMutationFn = Apollo.MutationFunction<
  AddUserMutation,
  AddUserMutationVariables
>;

/**
 * __useAddUserMutation__
 *
 * To run a mutation, you first call `useAddUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserMutation, { data, loading, error }] = useAddUserMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      middleName: // value for 'middleName'
 *      lastName: // value for 'lastName'
 *      suffix: // value for 'suffix'
 *      email: // value for 'email'
 *      organizationExternalId: // value for 'organizationExternalId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddUserMutation,
    AddUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddUserMutation, AddUserMutationVariables>(
    AddUserDocument,
    options
  );
}
export type AddUserMutationHookResult = ReturnType<typeof useAddUserMutation>;
export type AddUserMutationResult = Apollo.MutationResult<AddUserMutation>;
export type AddUserMutationOptions = Apollo.BaseMutationOptions<
  AddUserMutation,
  AddUserMutationVariables
>;
export const GetOrganizationsDocument = gql`
  query GetOrganizations($identityVerified: Boolean) {
    organizations(identityVerified: $identityVerified) {
      externalId
      name
    }
  }
`;

/**
 * __useGetOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationsQuery({
 *   variables: {
 *      identityVerified: // value for 'identityVerified'
 *   },
 * });
 */
export function useGetOrganizationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrganizationsQuery,
    GetOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(
    GetOrganizationsDocument,
    options
  );
}
export function useGetOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationsQuery,
    GetOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationsQuery,
    GetOrganizationsQueryVariables
  >(GetOrganizationsDocument, options);
}
export type GetOrganizationsQueryHookResult = ReturnType<
  typeof useGetOrganizationsQuery
>;
export type GetOrganizationsLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationsLazyQuery
>;
export type GetOrganizationsQueryResult = Apollo.QueryResult<
  GetOrganizationsQuery,
  GetOrganizationsQueryVariables
>;
export const SetCurrentUserTenantDataAccessOpDocument = gql`
  mutation SetCurrentUserTenantDataAccessOp(
    $organizationExternalId: String
    $justification: String
  ) {
    setCurrentUserTenantDataAccess(
      organizationExternalId: $organizationExternalId
      justification: $justification
    ) {
      id
      email
      permissions
      role
      organization {
        name
        externalId
      }
    }
  }
`;
export type SetCurrentUserTenantDataAccessOpMutationFn = Apollo.MutationFunction<
  SetCurrentUserTenantDataAccessOpMutation,
  SetCurrentUserTenantDataAccessOpMutationVariables
>;

/**
 * __useSetCurrentUserTenantDataAccessOpMutation__
 *
 * To run a mutation, you first call `useSetCurrentUserTenantDataAccessOpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCurrentUserTenantDataAccessOpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCurrentUserTenantDataAccessOpMutation, { data, loading, error }] = useSetCurrentUserTenantDataAccessOpMutation({
 *   variables: {
 *      organizationExternalId: // value for 'organizationExternalId'
 *      justification: // value for 'justification'
 *   },
 * });
 */
export function useSetCurrentUserTenantDataAccessOpMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetCurrentUserTenantDataAccessOpMutation,
    SetCurrentUserTenantDataAccessOpMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetCurrentUserTenantDataAccessOpMutation,
    SetCurrentUserTenantDataAccessOpMutationVariables
  >(SetCurrentUserTenantDataAccessOpDocument, options);
}
export type SetCurrentUserTenantDataAccessOpMutationHookResult = ReturnType<
  typeof useSetCurrentUserTenantDataAccessOpMutation
>;
export type SetCurrentUserTenantDataAccessOpMutationResult = Apollo.MutationResult<SetCurrentUserTenantDataAccessOpMutation>;
export type SetCurrentUserTenantDataAccessOpMutationOptions = Apollo.BaseMutationOptions<
  SetCurrentUserTenantDataAccessOpMutation,
  SetCurrentUserTenantDataAccessOpMutationVariables
>;
export const GetUnverifiedOrganizationsDocument = gql`
  query GetUnverifiedOrganizations($identityVerified: Boolean) {
    organizations(identityVerified: $identityVerified) {
      name
      externalId
    }
  }
`;

/**
 * __useGetUnverifiedOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetUnverifiedOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnverifiedOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnverifiedOrganizationsQuery({
 *   variables: {
 *      identityVerified: // value for 'identityVerified'
 *   },
 * });
 */
export function useGetUnverifiedOrganizationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUnverifiedOrganizationsQuery,
    GetUnverifiedOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUnverifiedOrganizationsQuery,
    GetUnverifiedOrganizationsQueryVariables
  >(GetUnverifiedOrganizationsDocument, options);
}
export function useGetUnverifiedOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUnverifiedOrganizationsQuery,
    GetUnverifiedOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUnverifiedOrganizationsQuery,
    GetUnverifiedOrganizationsQueryVariables
  >(GetUnverifiedOrganizationsDocument, options);
}
export type GetUnverifiedOrganizationsQueryHookResult = ReturnType<
  typeof useGetUnverifiedOrganizationsQuery
>;
export type GetUnverifiedOrganizationsLazyQueryHookResult = ReturnType<
  typeof useGetUnverifiedOrganizationsLazyQuery
>;
export type GetUnverifiedOrganizationsQueryResult = Apollo.QueryResult<
  GetUnverifiedOrganizationsQuery,
  GetUnverifiedOrganizationsQueryVariables
>;
export const SetOrgIdentityVerifiedDocument = gql`
  mutation SetOrgIdentityVerified($externalId: String!, $verified: Boolean!) {
    setOrganizationIdentityVerified(
      externalId: $externalId
      verified: $verified
    )
  }
`;
export type SetOrgIdentityVerifiedMutationFn = Apollo.MutationFunction<
  SetOrgIdentityVerifiedMutation,
  SetOrgIdentityVerifiedMutationVariables
>;

/**
 * __useSetOrgIdentityVerifiedMutation__
 *
 * To run a mutation, you first call `useSetOrgIdentityVerifiedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOrgIdentityVerifiedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOrgIdentityVerifiedMutation, { data, loading, error }] = useSetOrgIdentityVerifiedMutation({
 *   variables: {
 *      externalId: // value for 'externalId'
 *      verified: // value for 'verified'
 *   },
 * });
 */
export function useSetOrgIdentityVerifiedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetOrgIdentityVerifiedMutation,
    SetOrgIdentityVerifiedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetOrgIdentityVerifiedMutation,
    SetOrgIdentityVerifiedMutationVariables
  >(SetOrgIdentityVerifiedDocument, options);
}
export type SetOrgIdentityVerifiedMutationHookResult = ReturnType<
  typeof useSetOrgIdentityVerifiedMutation
>;
export type SetOrgIdentityVerifiedMutationResult = Apollo.MutationResult<SetOrgIdentityVerifiedMutation>;
export type SetOrgIdentityVerifiedMutationOptions = Apollo.BaseMutationOptions<
  SetOrgIdentityVerifiedMutation,
  SetOrgIdentityVerifiedMutationVariables
>;
export const PatientExistsDocument = gql`
  query PatientExists(
    $firstName: String!
    $lastName: String!
    $birthDate: LocalDate!
    $zipCode: String!
    $facilityId: ID
  ) {
    patientExists(
      firstName: $firstName
      lastName: $lastName
      birthDate: $birthDate
      zipCode: $zipCode
      facilityId: $facilityId
    )
  }
`;

/**
 * __usePatientExistsQuery__
 *
 * To run a query within a React component, call `usePatientExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePatientExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePatientExistsQuery({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      birthDate: // value for 'birthDate'
 *      zipCode: // value for 'zipCode'
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function usePatientExistsQuery(
  baseOptions: Apollo.QueryHookOptions<
    PatientExistsQuery,
    PatientExistsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PatientExistsQuery, PatientExistsQueryVariables>(
    PatientExistsDocument,
    options
  );
}
export function usePatientExistsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PatientExistsQuery,
    PatientExistsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PatientExistsQuery, PatientExistsQueryVariables>(
    PatientExistsDocument,
    options
  );
}
export type PatientExistsQueryHookResult = ReturnType<
  typeof usePatientExistsQuery
>;
export type PatientExistsLazyQueryHookResult = ReturnType<
  typeof usePatientExistsLazyQuery
>;
export type PatientExistsQueryResult = Apollo.QueryResult<
  PatientExistsQuery,
  PatientExistsQueryVariables
>;
export const AddPatientDocument = gql`
  mutation AddPatient(
    $facilityId: ID
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatient(
      facilityId: $facilityId
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      birthDate: $birthDate
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      telephone: $telephone
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
      email: $email
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
    ) {
      internalId
      facility {
        id
      }
    }
  }
`;
export type AddPatientMutationFn = Apollo.MutationFunction<
  AddPatientMutation,
  AddPatientMutationVariables
>;

/**
 * __useAddPatientMutation__
 *
 * To run a mutation, you first call `useAddPatientMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPatientMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPatientMutation, { data, loading, error }] = useAddPatientMutation({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      firstName: // value for 'firstName'
 *      middleName: // value for 'middleName'
 *      lastName: // value for 'lastName'
 *      birthDate: // value for 'birthDate'
 *      street: // value for 'street'
 *      streetTwo: // value for 'streetTwo'
 *      city: // value for 'city'
 *      state: // value for 'state'
 *      zipCode: // value for 'zipCode'
 *      telephone: // value for 'telephone'
 *      phoneNumbers: // value for 'phoneNumbers'
 *      role: // value for 'role'
 *      lookupId: // value for 'lookupId'
 *      email: // value for 'email'
 *      county: // value for 'county'
 *      race: // value for 'race'
 *      ethnicity: // value for 'ethnicity'
 *      tribalAffiliation: // value for 'tribalAffiliation'
 *      gender: // value for 'gender'
 *      residentCongregateSetting: // value for 'residentCongregateSetting'
 *      employedInHealthcare: // value for 'employedInHealthcare'
 *      preferredLanguage: // value for 'preferredLanguage'
 *      testResultDelivery: // value for 'testResultDelivery'
 *   },
 * });
 */
export function useAddPatientMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPatientMutation,
    AddPatientMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddPatientMutation, AddPatientMutationVariables>(
    AddPatientDocument,
    options
  );
}
export type AddPatientMutationHookResult = ReturnType<
  typeof useAddPatientMutation
>;
export type AddPatientMutationResult = Apollo.MutationResult<AddPatientMutation>;
export type AddPatientMutationOptions = Apollo.BaseMutationOptions<
  AddPatientMutation,
  AddPatientMutationVariables
>;
export const ArchivePersonDocument = gql`
  mutation ArchivePerson($id: ID!, $deleted: Boolean!) {
    setPatientIsDeleted(id: $id, deleted: $deleted) {
      internalId
    }
  }
`;
export type ArchivePersonMutationFn = Apollo.MutationFunction<
  ArchivePersonMutation,
  ArchivePersonMutationVariables
>;

/**
 * __useArchivePersonMutation__
 *
 * To run a mutation, you first call `useArchivePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchivePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archivePersonMutation, { data, loading, error }] = useArchivePersonMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deleted: // value for 'deleted'
 *   },
 * });
 */
export function useArchivePersonMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ArchivePersonMutation,
    ArchivePersonMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ArchivePersonMutation,
    ArchivePersonMutationVariables
  >(ArchivePersonDocument, options);
}
export type ArchivePersonMutationHookResult = ReturnType<
  typeof useArchivePersonMutation
>;
export type ArchivePersonMutationResult = Apollo.MutationResult<ArchivePersonMutation>;
export type ArchivePersonMutationOptions = Apollo.BaseMutationOptions<
  ArchivePersonMutation,
  ArchivePersonMutationVariables
>;
export const GetPatientDetailsDocument = gql`
  query GetPatientDetails($id: ID!) {
    patient(id: $id) {
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      phoneNumbers {
        type
        number
      }
      role
      lookupId
      email
      county
      race
      ethnicity
      tribalAffiliation
      gender
      residentCongregateSetting
      employedInHealthcare
      preferredLanguage
      facility {
        id
      }
      testResultDelivery
    }
  }
`;

/**
 * __useGetPatientDetailsQuery__
 *
 * To run a query within a React component, call `useGetPatientDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPatientDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientDetailsQuery,
    GetPatientDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientDetailsQuery,
    GetPatientDetailsQueryVariables
  >(GetPatientDetailsDocument, options);
}
export function useGetPatientDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientDetailsQuery,
    GetPatientDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientDetailsQuery,
    GetPatientDetailsQueryVariables
  >(GetPatientDetailsDocument, options);
}
export type GetPatientDetailsQueryHookResult = ReturnType<
  typeof useGetPatientDetailsQuery
>;
export type GetPatientDetailsLazyQueryHookResult = ReturnType<
  typeof useGetPatientDetailsLazyQuery
>;
export type GetPatientDetailsQueryResult = Apollo.QueryResult<
  GetPatientDetailsQuery,
  GetPatientDetailsQueryVariables
>;
export const UpdatePatientDocument = gql`
  mutation UpdatePatient(
    $facilityId: ID
    $patientId: ID!
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    updatePatient(
      facilityId: $facilityId
      patientId: $patientId
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      birthDate: $birthDate
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      telephone: $telephone
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
      email: $email
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
    ) {
      internalId
    }
  }
`;
export type UpdatePatientMutationFn = Apollo.MutationFunction<
  UpdatePatientMutation,
  UpdatePatientMutationVariables
>;

/**
 * __useUpdatePatientMutation__
 *
 * To run a mutation, you first call `useUpdatePatientMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePatientMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePatientMutation, { data, loading, error }] = useUpdatePatientMutation({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      firstName: // value for 'firstName'
 *      middleName: // value for 'middleName'
 *      lastName: // value for 'lastName'
 *      birthDate: // value for 'birthDate'
 *      street: // value for 'street'
 *      streetTwo: // value for 'streetTwo'
 *      city: // value for 'city'
 *      state: // value for 'state'
 *      zipCode: // value for 'zipCode'
 *      telephone: // value for 'telephone'
 *      phoneNumbers: // value for 'phoneNumbers'
 *      role: // value for 'role'
 *      lookupId: // value for 'lookupId'
 *      email: // value for 'email'
 *      county: // value for 'county'
 *      race: // value for 'race'
 *      ethnicity: // value for 'ethnicity'
 *      tribalAffiliation: // value for 'tribalAffiliation'
 *      gender: // value for 'gender'
 *      residentCongregateSetting: // value for 'residentCongregateSetting'
 *      employedInHealthcare: // value for 'employedInHealthcare'
 *      preferredLanguage: // value for 'preferredLanguage'
 *      testResultDelivery: // value for 'testResultDelivery'
 *   },
 * });
 */
export function useUpdatePatientMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePatientMutation,
    UpdatePatientMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdatePatientMutation,
    UpdatePatientMutationVariables
  >(UpdatePatientDocument, options);
}
export type UpdatePatientMutationHookResult = ReturnType<
  typeof useUpdatePatientMutation
>;
export type UpdatePatientMutationResult = Apollo.MutationResult<UpdatePatientMutation>;
export type UpdatePatientMutationOptions = Apollo.BaseMutationOptions<
  UpdatePatientMutation,
  UpdatePatientMutationVariables
>;
export const GetPatientsCountByFacilityDocument = gql`
  query GetPatientsCountByFacility(
    $facilityId: ID!
    $showDeleted: Boolean!
    $namePrefixMatch: String
  ) {
    patientsCount(
      facilityId: $facilityId
      showDeleted: $showDeleted
      namePrefixMatch: $namePrefixMatch
    )
  }
`;

/**
 * __useGetPatientsCountByFacilityQuery__
 *
 * To run a query within a React component, call `useGetPatientsCountByFacilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsCountByFacilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsCountByFacilityQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      showDeleted: // value for 'showDeleted'
 *      namePrefixMatch: // value for 'namePrefixMatch'
 *   },
 * });
 */
export function useGetPatientsCountByFacilityQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  >(GetPatientsCountByFacilityDocument, options);
}
export function useGetPatientsCountByFacilityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  >(GetPatientsCountByFacilityDocument, options);
}
export type GetPatientsCountByFacilityQueryHookResult = ReturnType<
  typeof useGetPatientsCountByFacilityQuery
>;
export type GetPatientsCountByFacilityLazyQueryHookResult = ReturnType<
  typeof useGetPatientsCountByFacilityLazyQuery
>;
export type GetPatientsCountByFacilityQueryResult = Apollo.QueryResult<
  GetPatientsCountByFacilityQuery,
  GetPatientsCountByFacilityQueryVariables
>;
export const GetPatientsByFacilityDocument = gql`
  query GetPatientsByFacility(
    $facilityId: ID!
    $pageNumber: Int!
    $pageSize: Int!
    $showDeleted: Boolean
    $namePrefixMatch: String
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      showDeleted: $showDeleted
      namePrefixMatch: $namePrefixMatch
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      isDeleted
      role
      lastTest {
        dateAdded
      }
    }
  }
`;

/**
 * __useGetPatientsByFacilityQuery__
 *
 * To run a query within a React component, call `useGetPatientsByFacilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsByFacilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsByFacilityQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *      showDeleted: // value for 'showDeleted'
 *      namePrefixMatch: // value for 'namePrefixMatch'
 *   },
 * });
 */
export function useGetPatientsByFacilityQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  >(GetPatientsByFacilityDocument, options);
}
export function useGetPatientsByFacilityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  >(GetPatientsByFacilityDocument, options);
}
export type GetPatientsByFacilityQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityQuery
>;
export type GetPatientsByFacilityLazyQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityLazyQuery
>;
export type GetPatientsByFacilityQueryResult = Apollo.QueryResult<
  GetPatientsByFacilityQuery,
  GetPatientsByFacilityQueryVariables
>;
export const UploadPatientsDocument = gql`
  mutation UploadPatients($patientList: Upload!) {
    uploadPatients(patientList: $patientList)
  }
`;
export type UploadPatientsMutationFn = Apollo.MutationFunction<
  UploadPatientsMutation,
  UploadPatientsMutationVariables
>;

/**
 * __useUploadPatientsMutation__
 *
 * To run a mutation, you first call `useUploadPatientsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadPatientsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadPatientsMutation, { data, loading, error }] = useUploadPatientsMutation({
 *   variables: {
 *      patientList: // value for 'patientList'
 *   },
 * });
 */
export function useUploadPatientsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UploadPatientsMutation,
    UploadPatientsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UploadPatientsMutation,
    UploadPatientsMutationVariables
  >(UploadPatientsDocument, options);
}
export type UploadPatientsMutationHookResult = ReturnType<
  typeof useUploadPatientsMutation
>;
export type UploadPatientsMutationResult = Apollo.MutationResult<UploadPatientsMutation>;
export type UploadPatientsMutationOptions = Apollo.BaseMutationOptions<
  UploadPatientsMutation,
  UploadPatientsMutationVariables
>;
export const GetPatientsLastResultDocument = gql`
  query GetPatientsLastResult($patientId: ID!) {
    patient(id: $patientId) {
      lastTest {
        dateTested
        result
      }
    }
  }
`;

/**
 * __useGetPatientsLastResultQuery__
 *
 * To run a query within a React component, call `useGetPatientsLastResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsLastResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsLastResultQuery({
 *   variables: {
 *      patientId: // value for 'patientId'
 *   },
 * });
 */
export function useGetPatientsLastResultQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsLastResultQuery,
    GetPatientsLastResultQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsLastResultQuery,
    GetPatientsLastResultQueryVariables
  >(GetPatientsLastResultDocument, options);
}
export function useGetPatientsLastResultLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsLastResultQuery,
    GetPatientsLastResultQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsLastResultQuery,
    GetPatientsLastResultQueryVariables
  >(GetPatientsLastResultDocument, options);
}
export type GetPatientsLastResultQueryHookResult = ReturnType<
  typeof useGetPatientsLastResultQuery
>;
export type GetPatientsLastResultLazyQueryHookResult = ReturnType<
  typeof useGetPatientsLastResultLazyQuery
>;
export type GetPatientsLastResultQueryResult = Apollo.QueryResult<
  GetPatientsLastResultQuery,
  GetPatientsLastResultQueryVariables
>;
export const RemovePatientFromQueueDocument = gql`
  mutation RemovePatientFromQueue($patientId: ID!) {
    removePatientFromQueue(patientId: $patientId)
  }
`;
export type RemovePatientFromQueueMutationFn = Apollo.MutationFunction<
  RemovePatientFromQueueMutation,
  RemovePatientFromQueueMutationVariables
>;

/**
 * __useRemovePatientFromQueueMutation__
 *
 * To run a mutation, you first call `useRemovePatientFromQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePatientFromQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePatientFromQueueMutation, { data, loading, error }] = useRemovePatientFromQueueMutation({
 *   variables: {
 *      patientId: // value for 'patientId'
 *   },
 * });
 */
export function useRemovePatientFromQueueMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemovePatientFromQueueMutation,
    RemovePatientFromQueueMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemovePatientFromQueueMutation,
    RemovePatientFromQueueMutationVariables
  >(RemovePatientFromQueueDocument, options);
}
export type RemovePatientFromQueueMutationHookResult = ReturnType<
  typeof useRemovePatientFromQueueMutation
>;
export type RemovePatientFromQueueMutationResult = Apollo.MutationResult<RemovePatientFromQueueMutation>;
export type RemovePatientFromQueueMutationOptions = Apollo.BaseMutationOptions<
  RemovePatientFromQueueMutation,
  RemovePatientFromQueueMutationVariables
>;
export const EditQueueItemDocument = gql`
  mutation EditQueueItem(
    $id: ID!
    $deviceId: String
    $result: String
    $dateTested: DateTime
  ) {
    editQueueItem(
      id: $id
      deviceId: $deviceId
      result: $result
      dateTested: $dateTested
    ) {
      result
      dateTested
      deviceType {
        internalId
        testLength
      }
    }
  }
`;
export type EditQueueItemMutationFn = Apollo.MutationFunction<
  EditQueueItemMutation,
  EditQueueItemMutationVariables
>;

/**
 * __useEditQueueItemMutation__
 *
 * To run a mutation, you first call `useEditQueueItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditQueueItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editQueueItemMutation, { data, loading, error }] = useEditQueueItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deviceId: // value for 'deviceId'
 *      result: // value for 'result'
 *      dateTested: // value for 'dateTested'
 *   },
 * });
 */
export function useEditQueueItemMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditQueueItemMutation,
    EditQueueItemMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditQueueItemMutation,
    EditQueueItemMutationVariables
  >(EditQueueItemDocument, options);
}
export type EditQueueItemMutationHookResult = ReturnType<
  typeof useEditQueueItemMutation
>;
export type EditQueueItemMutationResult = Apollo.MutationResult<EditQueueItemMutation>;
export type EditQueueItemMutationOptions = Apollo.BaseMutationOptions<
  EditQueueItemMutation,
  EditQueueItemMutationVariables
>;
export const SubmitTestResultDocument = gql`
  mutation SubmitTestResult(
    $patientId: ID!
    $deviceId: String!
    $result: String!
    $dateTested: DateTime
  ) {
    addTestResultNew(
      patientId: $patientId
      deviceId: $deviceId
      result: $result
      dateTested: $dateTested
    ) {
      testResult {
        internalId
      }
      deliverySuccess
    }
  }
`;
export type SubmitTestResultMutationFn = Apollo.MutationFunction<
  SubmitTestResultMutation,
  SubmitTestResultMutationVariables
>;

/**
 * __useSubmitTestResultMutation__
 *
 * To run a mutation, you first call `useSubmitTestResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitTestResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitTestResultMutation, { data, loading, error }] = useSubmitTestResultMutation({
 *   variables: {
 *      patientId: // value for 'patientId'
 *      deviceId: // value for 'deviceId'
 *      result: // value for 'result'
 *      dateTested: // value for 'dateTested'
 *   },
 * });
 */
export function useSubmitTestResultMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SubmitTestResultMutation,
    SubmitTestResultMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SubmitTestResultMutation,
    SubmitTestResultMutationVariables
  >(SubmitTestResultDocument, options);
}
export type SubmitTestResultMutationHookResult = ReturnType<
  typeof useSubmitTestResultMutation
>;
export type SubmitTestResultMutationResult = Apollo.MutationResult<SubmitTestResultMutation>;
export type SubmitTestResultMutationOptions = Apollo.BaseMutationOptions<
  SubmitTestResultMutation,
  SubmitTestResultMutationVariables
>;
export const GetFacilityQueueDocument = gql`
  query GetFacilityQueue($facilityId: ID!) {
    queue(facilityId: $facilityId) {
      internalId
      pregnancy
      dateAdded
      symptoms
      symptomOnset
      noSymptoms
      firstTest
      priorTestDate
      priorTestType
      priorTestResult
      deviceType {
        internalId
        name
        model
        testLength
      }
      patient {
        internalId
        telephone
        birthDate
        firstName
        middleName
        lastName
        gender
        testResultDelivery
        preferredLanguage
        phoneNumbers {
          type
          number
        }
      }
      result
      dateTested
    }
    organization {
      testingFacility {
        id
        deviceTypes {
          internalId
          name
          model
          testLength
        }
        defaultDeviceType {
          internalId
          name
          model
          testLength
        }
      }
    }
  }
`;

/**
 * __useGetFacilityQueueQuery__
 *
 * To run a query within a React component, call `useGetFacilityQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityQueueQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function useGetFacilityQueueQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFacilityQueueQuery,
    GetFacilityQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFacilityQueueQuery, GetFacilityQueueQueryVariables>(
    GetFacilityQueueDocument,
    options
  );
}
export function useGetFacilityQueueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityQueueQuery,
    GetFacilityQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityQueueQuery,
    GetFacilityQueueQueryVariables
  >(GetFacilityQueueDocument, options);
}
export type GetFacilityQueueQueryHookResult = ReturnType<
  typeof useGetFacilityQueueQuery
>;
export type GetFacilityQueueLazyQueryHookResult = ReturnType<
  typeof useGetFacilityQueueLazyQuery
>;
export type GetFacilityQueueQueryResult = Apollo.QueryResult<
  GetFacilityQueueQuery,
  GetFacilityQueueQueryVariables
>;
export const GetPatientDocument = gql`
  query GetPatient($internalId: ID!) {
    patient(id: $internalId) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      phoneNumbers {
        type
        number
      }
      testResultDelivery
    }
  }
`;

/**
 * __useGetPatientQuery__
 *
 * To run a query within a React component, call `useGetPatientQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientQuery({
 *   variables: {
 *      internalId: // value for 'internalId'
 *   },
 * });
 */
export function useGetPatientQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientQuery,
    GetPatientQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPatientQuery, GetPatientQueryVariables>(
    GetPatientDocument,
    options
  );
}
export function useGetPatientLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientQuery,
    GetPatientQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPatientQuery, GetPatientQueryVariables>(
    GetPatientDocument,
    options
  );
}
export type GetPatientQueryHookResult = ReturnType<typeof useGetPatientQuery>;
export type GetPatientLazyQueryHookResult = ReturnType<
  typeof useGetPatientLazyQuery
>;
export type GetPatientQueryResult = Apollo.QueryResult<
  GetPatientQuery,
  GetPatientQueryVariables
>;
export const GetPatientsByFacilityForQueueDocument = gql`
  query GetPatientsByFacilityForQueue(
    $facilityId: ID!
    $namePrefixMatch: String
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: 0
      pageSize: 100
      showDeleted: false
      namePrefixMatch: $namePrefixMatch
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      phoneNumbers {
        type
        number
      }
      testResultDelivery
    }
  }
`;

/**
 * __useGetPatientsByFacilityForQueueQuery__
 *
 * To run a query within a React component, call `useGetPatientsByFacilityForQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsByFacilityForQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsByFacilityForQueueQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      namePrefixMatch: // value for 'namePrefixMatch'
 *   },
 * });
 */
export function useGetPatientsByFacilityForQueueQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsByFacilityForQueueQuery,
    GetPatientsByFacilityForQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsByFacilityForQueueQuery,
    GetPatientsByFacilityForQueueQueryVariables
  >(GetPatientsByFacilityForQueueDocument, options);
}
export function useGetPatientsByFacilityForQueueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsByFacilityForQueueQuery,
    GetPatientsByFacilityForQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsByFacilityForQueueQuery,
    GetPatientsByFacilityForQueueQueryVariables
  >(GetPatientsByFacilityForQueueDocument, options);
}
export type GetPatientsByFacilityForQueueQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityForQueueQuery
>;
export type GetPatientsByFacilityForQueueLazyQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityForQueueLazyQuery
>;
export type GetPatientsByFacilityForQueueQueryResult = Apollo.QueryResult<
  GetPatientsByFacilityForQueueQuery,
  GetPatientsByFacilityForQueueQueryVariables
>;
export const AddPatientToQueueDocument = gql`
  mutation AddPatientToQueue(
    $facilityId: ID!
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: LocalDate
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
      pregnancy: $pregnancy
      noSymptoms: $noSymptoms
      symptoms: $symptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;
export type AddPatientToQueueMutationFn = Apollo.MutationFunction<
  AddPatientToQueueMutation,
  AddPatientToQueueMutationVariables
>;

/**
 * __useAddPatientToQueueMutation__
 *
 * To run a mutation, you first call `useAddPatientToQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPatientToQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPatientToQueueMutation, { data, loading, error }] = useAddPatientToQueueMutation({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      symptoms: // value for 'symptoms'
 *      symptomOnset: // value for 'symptomOnset'
 *      pregnancy: // value for 'pregnancy'
 *      firstTest: // value for 'firstTest'
 *      priorTestDate: // value for 'priorTestDate'
 *      priorTestType: // value for 'priorTestType'
 *      priorTestResult: // value for 'priorTestResult'
 *      noSymptoms: // value for 'noSymptoms'
 *      testResultDelivery: // value for 'testResultDelivery'
 *   },
 * });
 */
export function useAddPatientToQueueMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPatientToQueueMutation,
    AddPatientToQueueMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddPatientToQueueMutation,
    AddPatientToQueueMutationVariables
  >(AddPatientToQueueDocument, options);
}
export type AddPatientToQueueMutationHookResult = ReturnType<
  typeof useAddPatientToQueueMutation
>;
export type AddPatientToQueueMutationResult = Apollo.MutationResult<AddPatientToQueueMutation>;
export type AddPatientToQueueMutationOptions = Apollo.BaseMutationOptions<
  AddPatientToQueueMutation,
  AddPatientToQueueMutationVariables
>;
export const UpdateAoeDocument = gql`
  mutation UpdateAOE(
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: LocalDate
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;
export type UpdateAoeMutationFn = Apollo.MutationFunction<
  UpdateAoeMutation,
  UpdateAoeMutationVariables
>;

/**
 * __useUpdateAoeMutation__
 *
 * To run a mutation, you first call `useUpdateAoeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAoeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAoeMutation, { data, loading, error }] = useUpdateAoeMutation({
 *   variables: {
 *      patientId: // value for 'patientId'
 *      symptoms: // value for 'symptoms'
 *      symptomOnset: // value for 'symptomOnset'
 *      pregnancy: // value for 'pregnancy'
 *      firstTest: // value for 'firstTest'
 *      priorTestDate: // value for 'priorTestDate'
 *      priorTestType: // value for 'priorTestType'
 *      priorTestResult: // value for 'priorTestResult'
 *      noSymptoms: // value for 'noSymptoms'
 *      testResultDelivery: // value for 'testResultDelivery'
 *   },
 * });
 */
export function useUpdateAoeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAoeMutation,
    UpdateAoeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateAoeMutation, UpdateAoeMutationVariables>(
    UpdateAoeDocument,
    options
  );
}
export type UpdateAoeMutationHookResult = ReturnType<
  typeof useUpdateAoeMutation
>;
export type UpdateAoeMutationResult = Apollo.MutationResult<UpdateAoeMutation>;
export type UpdateAoeMutationOptions = Apollo.BaseMutationOptions<
  UpdateAoeMutation,
  UpdateAoeMutationVariables
>;
export const GetTestResultForCorrectionDocument = gql`
  query getTestResultForCorrection($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
    }
  }
`;

/**
 * __useGetTestResultForCorrectionQuery__
 *
 * To run a query within a React component, call `useGetTestResultForCorrectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultForCorrectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultForCorrectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestResultForCorrectionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultForCorrectionQuery,
    GetTestResultForCorrectionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultForCorrectionQuery,
    GetTestResultForCorrectionQueryVariables
  >(GetTestResultForCorrectionDocument, options);
}
export function useGetTestResultForCorrectionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultForCorrectionQuery,
    GetTestResultForCorrectionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultForCorrectionQuery,
    GetTestResultForCorrectionQueryVariables
  >(GetTestResultForCorrectionDocument, options);
}
export type GetTestResultForCorrectionQueryHookResult = ReturnType<
  typeof useGetTestResultForCorrectionQuery
>;
export type GetTestResultForCorrectionLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForCorrectionLazyQuery
>;
export type GetTestResultForCorrectionQueryResult = Apollo.QueryResult<
  GetTestResultForCorrectionQuery,
  GetTestResultForCorrectionQueryVariables
>;
export const MarkTestAsErrorDocument = gql`
  mutation MarkTestAsError($id: ID!, $reason: String!) {
    correctTestMarkAsError(id: $id, reason: $reason) {
      internalId
    }
  }
`;
export type MarkTestAsErrorMutationFn = Apollo.MutationFunction<
  MarkTestAsErrorMutation,
  MarkTestAsErrorMutationVariables
>;

/**
 * __useMarkTestAsErrorMutation__
 *
 * To run a mutation, you first call `useMarkTestAsErrorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkTestAsErrorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markTestAsErrorMutation, { data, loading, error }] = useMarkTestAsErrorMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useMarkTestAsErrorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkTestAsErrorMutation,
    MarkTestAsErrorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkTestAsErrorMutation,
    MarkTestAsErrorMutationVariables
  >(MarkTestAsErrorDocument, options);
}
export type MarkTestAsErrorMutationHookResult = ReturnType<
  typeof useMarkTestAsErrorMutation
>;
export type MarkTestAsErrorMutationResult = Apollo.MutationResult<MarkTestAsErrorMutation>;
export type MarkTestAsErrorMutationOptions = Apollo.BaseMutationOptions<
  MarkTestAsErrorMutation,
  MarkTestAsErrorMutationVariables
>;
export const GetTestResultDetailsDocument = gql`
  query getTestResultDetails($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      symptoms
      symptomOnset
      pregnancy
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
      createdBy {
        name {
          firstName
          middleName
          lastName
        }
      }
    }
  }
`;

/**
 * __useGetTestResultDetailsQuery__
 *
 * To run a query within a React component, call `useGetTestResultDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestResultDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultDetailsQuery,
    GetTestResultDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultDetailsQuery,
    GetTestResultDetailsQueryVariables
  >(GetTestResultDetailsDocument, options);
}
export function useGetTestResultDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultDetailsQuery,
    GetTestResultDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultDetailsQuery,
    GetTestResultDetailsQueryVariables
  >(GetTestResultDetailsDocument, options);
}
export type GetTestResultDetailsQueryHookResult = ReturnType<
  typeof useGetTestResultDetailsQuery
>;
export type GetTestResultDetailsLazyQueryHookResult = ReturnType<
  typeof useGetTestResultDetailsLazyQuery
>;
export type GetTestResultDetailsQueryResult = Apollo.QueryResult<
  GetTestResultDetailsQuery,
  GetTestResultDetailsQueryVariables
>;
export const GetTestResultForPrintDocument = gql`
  query getTestResultForPrint($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
      facility {
        name
        cliaNumber
        phone
        street
        streetTwo
        city
        state
        zipCode
        orderingProvider {
          firstName
          middleName
          lastName
          NPI
        }
      }
      testPerformed {
        name
        loincCode
      }
    }
  }
`;

/**
 * __useGetTestResultForPrintQuery__
 *
 * To run a query within a React component, call `useGetTestResultForPrintQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultForPrintQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultForPrintQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestResultForPrintQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultForPrintQuery,
    GetTestResultForPrintQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultForPrintQuery,
    GetTestResultForPrintQueryVariables
  >(GetTestResultForPrintDocument, options);
}
export function useGetTestResultForPrintLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultForPrintQuery,
    GetTestResultForPrintQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultForPrintQuery,
    GetTestResultForPrintQueryVariables
  >(GetTestResultForPrintDocument, options);
}
export type GetTestResultForPrintQueryHookResult = ReturnType<
  typeof useGetTestResultForPrintQuery
>;
export type GetTestResultForPrintLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForPrintLazyQuery
>;
export type GetTestResultForPrintQueryResult = Apollo.QueryResult<
  GetTestResultForPrintQuery,
  GetTestResultForPrintQueryVariables
>;
export const GetResultsCountByFacilityDocument = gql`
  query GetResultsCountByFacility(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    testResultsCount(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      startDate: $startDate
      endDate: $endDate
    )
  }
`;

/**
 * __useGetResultsCountByFacilityQuery__
 *
 * To run a query within a React component, call `useGetResultsCountByFacilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResultsCountByFacilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResultsCountByFacilityQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      result: // value for 'result'
 *      role: // value for 'role'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetResultsCountByFacilityQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetResultsCountByFacilityQuery,
    GetResultsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetResultsCountByFacilityQuery,
    GetResultsCountByFacilityQueryVariables
  >(GetResultsCountByFacilityDocument, options);
}
export function useGetResultsCountByFacilityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetResultsCountByFacilityQuery,
    GetResultsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetResultsCountByFacilityQuery,
    GetResultsCountByFacilityQueryVariables
  >(GetResultsCountByFacilityDocument, options);
}
export type GetResultsCountByFacilityQueryHookResult = ReturnType<
  typeof useGetResultsCountByFacilityQuery
>;
export type GetResultsCountByFacilityLazyQueryHookResult = ReturnType<
  typeof useGetResultsCountByFacilityLazyQuery
>;
export type GetResultsCountByFacilityQueryResult = Apollo.QueryResult<
  GetResultsCountByFacilityQuery,
  GetResultsCountByFacilityQueryVariables
>;
export const GetFacilityResultsDocument = gql`
  query GetFacilityResults(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    testResults(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      internalId
      dateTested
      result
      correctionStatus
      deviceType {
        internalId
        name
      }
      patient {
        internalId
        firstName
        middleName
        lastName
        birthDate
        gender
        lookupId
      }
      createdBy {
        nameInfo {
          firstName
          middleName
          lastName
        }
      }
      patientLink {
        internalId
      }
      symptoms
      noSymptoms
    }
  }
`;

/**
 * __useGetFacilityResultsQuery__
 *
 * To run a query within a React component, call `useGetFacilityResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityResultsQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      result: // value for 'result'
 *      role: // value for 'role'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetFacilityResultsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacilityResultsQuery,
    GetFacilityResultsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilityResultsQuery,
    GetFacilityResultsQueryVariables
  >(GetFacilityResultsDocument, options);
}
export function useGetFacilityResultsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityResultsQuery,
    GetFacilityResultsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityResultsQuery,
    GetFacilityResultsQueryVariables
  >(GetFacilityResultsDocument, options);
}
export type GetFacilityResultsQueryHookResult = ReturnType<
  typeof useGetFacilityResultsQuery
>;
export type GetFacilityResultsLazyQueryHookResult = ReturnType<
  typeof useGetFacilityResultsLazyQuery
>;
export type GetFacilityResultsQueryResult = Apollo.QueryResult<
  GetFacilityResultsQuery,
  GetFacilityResultsQueryVariables
>;

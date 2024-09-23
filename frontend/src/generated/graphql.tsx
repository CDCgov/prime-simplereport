import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
  LocalDate: { input: any; output: any };
};

export type AddFacilityInput = {
  address: FacilityAddressInput;
  cliaNumber?: InputMaybe<Scalars["String"]["input"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]["input"]>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  facilityName: Scalars["String"]["input"];
  orderingProvider?: InputMaybe<ProviderInput>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddTestResultResponse = {
  __typename?: "AddTestResultResponse";
  deliverySuccess?: Maybe<Scalars["Boolean"]["output"]>;
  testEventId: Scalars["ID"]["output"];
  testResult: TestOrder;
};

export type AddressInfo = {
  __typename?: "AddressInfo";
  city?: Maybe<Scalars["String"]["output"]>;
  county?: Maybe<Scalars["String"]["output"]>;
  postalCode?: Maybe<Scalars["String"]["output"]>;
  state?: Maybe<Scalars["String"]["output"]>;
  streetOne?: Maybe<Scalars["String"]["output"]>;
  streetTwo?: Maybe<Scalars["String"]["output"]>;
};

export type AggregateFacilityMetrics = {
  __typename?: "AggregateFacilityMetrics";
  facilityName?: Maybe<Scalars["String"]["output"]>;
  negativeTestCount?: Maybe<Scalars["Int"]["output"]>;
  positiveTestCount?: Maybe<Scalars["Int"]["output"]>;
  totalTestCount?: Maybe<Scalars["Int"]["output"]>;
};

export type ApiUser = {
  __typename?: "ApiUser";
  email: Scalars["String"]["output"];
  firstName?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  lastName: Scalars["String"]["output"];
  middleName?: Maybe<Scalars["String"]["output"]>;
  name: NameInfo;
  /** @deprecated needless connection of type to field name */
  nameInfo?: Maybe<NameInfo>;
  suffix?: Maybe<Scalars["String"]["output"]>;
};

export type ApiUserWithStatus = {
  __typename?: "ApiUserWithStatus";
  email: Scalars["String"]["output"];
  firstName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lastName: Scalars["String"]["output"];
  middleName?: Maybe<Scalars["String"]["output"]>;
  name: NameInfo;
  status?: Maybe<Scalars["String"]["output"]>;
  suffix?: Maybe<Scalars["String"]["output"]>;
};

export enum ArchivedStatus {
  All = "ALL",
  Archived = "ARCHIVED",
  Unarchived = "UNARCHIVED",
}

export type AskOnEntrySurvey = {
  __typename?: "AskOnEntrySurvey";
  genderOfSexualPartners?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  noSymptoms?: Maybe<Scalars["Boolean"]["output"]>;
  pregnancy?: Maybe<Scalars["String"]["output"]>;
  symptomOnset?: Maybe<Scalars["LocalDate"]["output"]>;
  symptoms?: Maybe<Scalars["String"]["output"]>;
  syphilisHistory?: Maybe<Scalars["String"]["output"]>;
};

export type CreateDeviceType = {
  manufacturer: Scalars["String"]["input"];
  model: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  supportedDiseaseTestPerformed: Array<SupportedDiseaseTestPerformedInput>;
  swabTypes: Array<Scalars["ID"]["input"]>;
  testLength: Scalars["Int"]["input"];
};

export type CreateSpecimenType = {
  collectionLocationCode?: InputMaybe<Scalars["String"]["input"]>;
  collectionLocationName?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  typeCode: Scalars["String"]["input"];
};

export type DeviceType = {
  __typename?: "DeviceType";
  internalId: Scalars["ID"]["output"];
  manufacturer: Scalars["String"]["output"];
  model: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  supportedDiseaseTestPerformed: Array<SupportedDiseaseTestPerformed>;
  swabTypes: Array<SpecimenType>;
  testLength: Scalars["Int"]["output"];
};

export type Facility = {
  __typename?: "Facility";
  address?: Maybe<AddressInfo>;
  city?: Maybe<Scalars["String"]["output"]>;
  cliaNumber?: Maybe<Scalars["String"]["output"]>;
  county?: Maybe<Scalars["String"]["output"]>;
  deviceTypes: Array<DeviceType>;
  email?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isDeleted?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  orderingProvider?: Maybe<Provider>;
  patientSelfRegistrationLink?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  state?: Maybe<Scalars["String"]["output"]>;
  street?: Maybe<Scalars["String"]["output"]>;
  streetTwo?: Maybe<Scalars["String"]["output"]>;
  zipCode?: Maybe<Scalars["String"]["output"]>;
};

export type FacilityAddressInput = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  zipCode: Scalars["String"]["input"];
};

export type FacilityStats = {
  __typename?: "FacilityStats";
  patientsSingleAccessCount?: Maybe<Scalars["Int"]["output"]>;
  usersSingleAccessCount?: Maybe<Scalars["Int"]["output"]>;
};

export type FeatureFlag = {
  __typename?: "FeatureFlag";
  name: Scalars["String"]["output"];
  value: Scalars["Boolean"]["output"];
};

export type FeedbackMessage = {
  __typename?: "FeedbackMessage";
  errorType: Scalars["String"]["output"];
  fieldHeader: Scalars["String"]["output"];
  fieldRequired: Scalars["Boolean"]["output"];
  indices?: Maybe<Array<Maybe<Scalars["Int"]["output"]>>>;
  message?: Maybe<Scalars["String"]["output"]>;
  scope?: Maybe<Scalars["String"]["output"]>;
};

export type MultiplexResult = {
  __typename?: "MultiplexResult";
  disease: SupportedDisease;
  testResult: Scalars["String"]["output"];
};

export type MultiplexResultInput = {
  diseaseName?: InputMaybe<Scalars["String"]["input"]>;
  testResult?: InputMaybe<Scalars["String"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addFacility?: Maybe<Facility>;
  addPatient?: Maybe<Patient>;
  addPatientToQueue?: Maybe<Scalars["String"]["output"]>;
  addUser?: Maybe<User>;
  addUserToCurrentOrg?: Maybe<User>;
  adminUpdateOrganization?: Maybe<Scalars["String"]["output"]>;
  clearUserRolesAndFacilities?: Maybe<ApiUser>;
  correctTestMarkAsCorrection?: Maybe<TestResult>;
  correctTestMarkAsError?: Maybe<TestResult>;
  createApiUserNoOkta?: Maybe<ApiUser>;
  createDeviceType?: Maybe<DeviceType>;
  createFacilityRegistrationLink?: Maybe<Scalars["String"]["output"]>;
  createOrganizationRegistrationLink?: Maybe<Scalars["String"]["output"]>;
  createSpecimenType?: Maybe<SpecimenType>;
  deleteE2EOktaOrganizations?: Maybe<Organization>;
  editPendingOrganization?: Maybe<Scalars["String"]["output"]>;
  editQueueItem?: Maybe<TestOrder>;
  markDeviceTypeAsDeleted?: Maybe<DeviceType>;
  markFacilityAsDeleted?: Maybe<Scalars["String"]["output"]>;
  markOrganizationAsDeleted?: Maybe<Scalars["String"]["output"]>;
  markPendingOrganizationAsDeleted?: Maybe<Scalars["String"]["output"]>;
  reactivateUser?: Maybe<User>;
  reactivateUserAndResetPassword?: Maybe<User>;
  removePatientFromQueue?: Maybe<Scalars["String"]["output"]>;
  resendActivationEmail?: Maybe<User>;
  resendToReportStream?: Maybe<Scalars["Boolean"]["output"]>;
  resetUserMfa?: Maybe<User>;
  resetUserPassword?: Maybe<User>;
  sendOrgAdminEmailCSV?: Maybe<Scalars["Boolean"]["output"]>;
  sendPatientLinkEmail?: Maybe<Scalars["Boolean"]["output"]>;
  sendPatientLinkEmailByTestEventId?: Maybe<Scalars["Boolean"]["output"]>;
  sendPatientLinkSms?: Maybe<Scalars["Boolean"]["output"]>;
  sendPatientLinkSmsByTestEventId?: Maybe<Scalars["Boolean"]["output"]>;
  sendSupportEscalation?: Maybe<Scalars["String"]["output"]>;
  setCurrentUserTenantDataAccess?: Maybe<User>;
  setOrganizationIdentityVerified?: Maybe<Scalars["Boolean"]["output"]>;
  setPatientIsDeleted?: Maybe<Patient>;
  setRegistrationLinkIsDeleted?: Maybe<Scalars["String"]["output"]>;
  setUserIsDeleted?: Maybe<User>;
  submitQueueItem?: Maybe<AddTestResultResponse>;
  updateAoeQuestions?: Maybe<Scalars["String"]["output"]>;
  updateDeviceType?: Maybe<DeviceType>;
  updateFacility?: Maybe<Facility>;
  updateFeatureFlag?: Maybe<FeatureFlag>;
  updateOrganization?: Maybe<Scalars["String"]["output"]>;
  updatePatient?: Maybe<Patient>;
  updateRegistrationLink?: Maybe<Scalars["String"]["output"]>;
  updateSpecimenType?: Maybe<SpecimenType>;
  updateTestOrderTimerStartedAt?: Maybe<Scalars["String"]["output"]>;
  updateUser?: Maybe<User>;
  updateUserEmail?: Maybe<User>;
  updateUserPrivileges?: Maybe<User>;
  updateUserPrivilegesAndGroupAccess: User;
};

export type MutationAddFacilityArgs = {
  facilityInfo: AddFacilityInput;
};

export type MutationAddPatientArgs = {
  birthDate: Scalars["LocalDate"]["input"];
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  county?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]["input"]>;
  ethnicity?: InputMaybe<Scalars["String"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  firstName: Scalars["String"]["input"];
  gender?: InputMaybe<Scalars["String"]["input"]>;
  genderIdentity?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  lookupId?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput>>;
  preferredLanguage?: InputMaybe<Scalars["String"]["input"]>;
  race?: InputMaybe<Scalars["String"]["input"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
  telephone?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  tribalAffiliation?: InputMaybe<Scalars["String"]["input"]>;
  zipCode: Scalars["String"]["input"];
};

export type MutationAddPatientToQueueArgs = {
  facilityId: Scalars["ID"]["input"];
  noSymptoms?: InputMaybe<Scalars["Boolean"]["input"]>;
  patientId: Scalars["ID"]["input"];
  pregnancy?: InputMaybe<Scalars["String"]["input"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]["input"]>;
  symptoms?: InputMaybe<Scalars["String"]["input"]>;
  syphilisHistory?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
};

export type MutationAddUserArgs = {
  user: UserInput;
};

export type MutationAddUserToCurrentOrgArgs = {
  userInput: UserInput;
};

export type MutationAdminUpdateOrganizationArgs = {
  name: Scalars["String"]["input"];
  type: Scalars["String"]["input"];
};

export type MutationClearUserRolesAndFacilitiesArgs = {
  username: Scalars["String"]["input"];
};

export type MutationCorrectTestMarkAsCorrectionArgs = {
  id: Scalars["ID"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCorrectTestMarkAsErrorArgs = {
  id: Scalars["ID"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateApiUserNoOktaArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<NameInput>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateDeviceTypeArgs = {
  input: CreateDeviceType;
};

export type MutationCreateFacilityRegistrationLinkArgs = {
  facilityId: Scalars["ID"]["input"];
  link: Scalars["String"]["input"];
  organizationExternalId: Scalars["String"]["input"];
};

export type MutationCreateOrganizationRegistrationLinkArgs = {
  link: Scalars["String"]["input"];
  organizationExternalId: Scalars["String"]["input"];
};

export type MutationCreateSpecimenTypeArgs = {
  input: CreateSpecimenType;
};

export type MutationDeleteE2EOktaOrganizationsArgs = {
  orgExternalId: Scalars["String"]["input"];
};

export type MutationEditPendingOrganizationArgs = {
  adminEmail?: InputMaybe<Scalars["String"]["input"]>;
  adminFirstName?: InputMaybe<Scalars["String"]["input"]>;
  adminLastName?: InputMaybe<Scalars["String"]["input"]>;
  adminPhone?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  orgExternalId: Scalars["String"]["input"];
};

export type MutationEditQueueItemArgs = {
  dateTested?: InputMaybe<Scalars["DateTime"]["input"]>;
  deviceTypeId?: InputMaybe<Scalars["ID"]["input"]>;
  id: Scalars["ID"]["input"];
  results?: InputMaybe<Array<InputMaybe<MultiplexResultInput>>>;
  specimenTypeId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationMarkDeviceTypeAsDeletedArgs = {
  deviceId?: InputMaybe<Scalars["ID"]["input"]>;
  deviceName?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationMarkFacilityAsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  facilityId: Scalars["ID"]["input"];
};

export type MutationMarkOrganizationAsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  organizationId: Scalars["ID"]["input"];
};

export type MutationMarkPendingOrganizationAsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  orgExternalId: Scalars["String"]["input"];
};

export type MutationReactivateUserArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationReactivateUserAndResetPasswordArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRemovePatientFromQueueArgs = {
  patientId: Scalars["ID"]["input"];
};

export type MutationResendActivationEmailArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationResendToReportStreamArgs = {
  covidOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  fhirOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  testEventIds: Array<Scalars["ID"]["input"]>;
};

export type MutationResetUserMfaArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationResetUserPasswordArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationSendOrgAdminEmailCsvArgs = {
  state: Scalars["String"]["input"];
  type: Scalars["String"]["input"];
};

export type MutationSendPatientLinkEmailArgs = {
  internalId: Scalars["ID"]["input"];
};

export type MutationSendPatientLinkEmailByTestEventIdArgs = {
  testEventId: Scalars["ID"]["input"];
};

export type MutationSendPatientLinkSmsArgs = {
  internalId: Scalars["ID"]["input"];
};

export type MutationSendPatientLinkSmsByTestEventIdArgs = {
  testEventId: Scalars["ID"]["input"];
};

export type MutationSetCurrentUserTenantDataAccessArgs = {
  justification?: InputMaybe<Scalars["String"]["input"]>;
  organizationExternalId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationSetOrganizationIdentityVerifiedArgs = {
  externalId: Scalars["String"]["input"];
  verified: Scalars["Boolean"]["input"];
};

export type MutationSetPatientIsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
  orgExternalId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationSetRegistrationLinkIsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  link?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationSetUserIsDeletedArgs = {
  deleted: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationSubmitQueueItemArgs = {
  dateTested?: InputMaybe<Scalars["DateTime"]["input"]>;
  deviceTypeId: Scalars["ID"]["input"];
  patientId: Scalars["ID"]["input"];
  results: Array<InputMaybe<MultiplexResultInput>>;
  specimenTypeId: Scalars["ID"]["input"];
};

export type MutationUpdateAoeQuestionsArgs = {
  genderOfSexualPartners?: InputMaybe<
    Array<InputMaybe<Scalars["String"]["input"]>>
  >;
  noSymptoms?: InputMaybe<Scalars["Boolean"]["input"]>;
  patientId: Scalars["ID"]["input"];
  pregnancy?: InputMaybe<Scalars["String"]["input"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]["input"]>;
  symptoms?: InputMaybe<Scalars["String"]["input"]>;
  syphilisHistory?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
};

export type MutationUpdateDeviceTypeArgs = {
  input: UpdateDeviceType;
};

export type MutationUpdateFacilityArgs = {
  facilityInfo: UpdateFacilityInput;
};

export type MutationUpdateFeatureFlagArgs = {
  name: Scalars["String"]["input"];
  value: Scalars["Boolean"]["input"];
};

export type MutationUpdateOrganizationArgs = {
  type: Scalars["String"]["input"];
};

export type MutationUpdatePatientArgs = {
  birthDate: Scalars["LocalDate"]["input"];
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  county?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]["input"]>;
  ethnicity?: InputMaybe<Scalars["String"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  firstName: Scalars["String"]["input"];
  gender?: InputMaybe<Scalars["String"]["input"]>;
  genderIdentity?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  lookupId?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  patientId: Scalars["ID"]["input"];
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput>>;
  preferredLanguage?: InputMaybe<Scalars["String"]["input"]>;
  race?: InputMaybe<Scalars["String"]["input"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
  telephone?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  tribalAffiliation?: InputMaybe<Scalars["String"]["input"]>;
  zipCode: Scalars["String"]["input"];
};

export type MutationUpdateRegistrationLinkArgs = {
  link: Scalars["String"]["input"];
  newLink: Scalars["String"]["input"];
};

export type MutationUpdateSpecimenTypeArgs = {
  input: UpdateSpecimenType;
};

export type MutationUpdateTestOrderTimerStartedAtArgs = {
  startedAt?: InputMaybe<Scalars["String"]["input"]>;
  testOrderId: Scalars["ID"]["input"];
};

export type MutationUpdateUserArgs = {
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<NameInput>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateUserEmailArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationUpdateUserPrivilegesArgs = {
  accessAllFacilities: Scalars["Boolean"]["input"];
  facilities?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  id: Scalars["ID"]["input"];
  role: Role;
};

export type MutationUpdateUserPrivilegesAndGroupAccessArgs = {
  accessAllFacilities?: InputMaybe<Scalars["Boolean"]["input"]>;
  facilities?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  orgExternalId: Scalars["String"]["input"];
  role: Role;
  username: Scalars["String"]["input"];
};

export type NameInfo = {
  __typename?: "NameInfo";
  firstName?: Maybe<Scalars["String"]["output"]>;
  lastName: Scalars["String"]["output"];
  middleName?: Maybe<Scalars["String"]["output"]>;
  suffix?: Maybe<Scalars["String"]["output"]>;
};

export type NameInput = {
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
};

export type Organization = {
  __typename?: "Organization";
  externalId: Scalars["String"]["output"];
  facilities: Array<Facility>;
  id: Scalars["ID"]["output"];
  identityVerified: Scalars["Boolean"]["output"];
  /** @deprecated alias for 'id' */
  internalId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  patientSelfRegistrationLink?: Maybe<Scalars["String"]["output"]>;
  /** @deprecated Use the one that makes sense */
  testingFacility: Array<Facility>;
  type: Scalars["String"]["output"];
};

export type OrganizationLevelDashboardMetrics = {
  __typename?: "OrganizationLevelDashboardMetrics";
  facilityMetrics?: Maybe<Array<Maybe<AggregateFacilityMetrics>>>;
  organizationNegativeTestCount?: Maybe<Scalars["Int"]["output"]>;
  organizationPositiveTestCount?: Maybe<Scalars["Int"]["output"]>;
  organizationTotalTestCount?: Maybe<Scalars["Int"]["output"]>;
};

export type Patient = {
  __typename?: "Patient";
  address?: Maybe<AddressInfo>;
  birthDate?: Maybe<Scalars["LocalDate"]["output"]>;
  city?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  county?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  emails?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  employedInHealthcare?: Maybe<Scalars["Boolean"]["output"]>;
  ethnicity?: Maybe<Scalars["String"]["output"]>;
  facility?: Maybe<Facility>;
  firstName?: Maybe<Scalars["String"]["output"]>;
  gender?: Maybe<Scalars["String"]["output"]>;
  genderIdentity?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  /** @deprecated alias for 'id' */
  internalId: Scalars["ID"]["output"];
  isDeleted?: Maybe<Scalars["Boolean"]["output"]>;
  lastName?: Maybe<Scalars["String"]["output"]>;
  lastTest?: Maybe<TestResult>;
  lookupId?: Maybe<Scalars["String"]["output"]>;
  middleName?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<NameInfo>;
  notes?: Maybe<Scalars["String"]["output"]>;
  phoneNumbers?: Maybe<Array<Maybe<PhoneNumber>>>;
  preferredLanguage?: Maybe<Scalars["String"]["output"]>;
  race?: Maybe<Scalars["String"]["output"]>;
  residentCongregateSetting?: Maybe<Scalars["Boolean"]["output"]>;
  role?: Maybe<Scalars["String"]["output"]>;
  state?: Maybe<Scalars["String"]["output"]>;
  street?: Maybe<Scalars["String"]["output"]>;
  streetTwo?: Maybe<Scalars["String"]["output"]>;
  suffix?: Maybe<Scalars["String"]["output"]>;
  telephone?: Maybe<Scalars["String"]["output"]>;
  testResultDelivery?: Maybe<TestResultDeliveryPreference>;
  tribalAffiliation?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  zipCode?: Maybe<Scalars["String"]["output"]>;
};

export type PatientLink = {
  __typename?: "PatientLink";
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  internalId?: Maybe<Scalars["ID"]["output"]>;
  testOrder?: Maybe<TestOrder>;
};

export type PendingOrganization = {
  __typename?: "PendingOrganization";
  adminEmail: Scalars["String"]["output"];
  adminFirstName: Scalars["String"]["output"];
  adminLastName: Scalars["String"]["output"];
  adminPhone: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  externalId: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type PhoneNumber = {
  __typename?: "PhoneNumber";
  number?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<PhoneType>;
};

export type PhoneNumberInput = {
  number?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
};

export enum PhoneType {
  Landline = "LANDLINE",
  Mobile = "MOBILE",
}

export type Provider = {
  __typename?: "Provider";
  NPI?: Maybe<Scalars["String"]["output"]>;
  address?: Maybe<AddressInfo>;
  city?: Maybe<Scalars["String"]["output"]>;
  county?: Maybe<Scalars["String"]["output"]>;
  firstName?: Maybe<Scalars["String"]["output"]>;
  lastName?: Maybe<Scalars["String"]["output"]>;
  middleName?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<NameInfo>;
  phone?: Maybe<Scalars["String"]["output"]>;
  state?: Maybe<Scalars["String"]["output"]>;
  street?: Maybe<Scalars["String"]["output"]>;
  streetTwo?: Maybe<Scalars["String"]["output"]>;
  suffix?: Maybe<Scalars["String"]["output"]>;
  zipCode?: Maybe<Scalars["String"]["output"]>;
};

export type ProviderInput = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  county?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  npi?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  state?: InputMaybe<Scalars["String"]["input"]>;
  street?: InputMaybe<Scalars["String"]["input"]>;
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
  zipCode?: InputMaybe<Scalars["String"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  /** @deprecated use the pluralized form to reduce confusion */
  deviceType: Array<DeviceType>;
  deviceTypes: Array<DeviceType>;
  facilities?: Maybe<Array<Maybe<Facility>>>;
  facility?: Maybe<Facility>;
  facilityStats?: Maybe<FacilityStats>;
  getOrgAdminUserIds?: Maybe<Array<Maybe<Scalars["ID"]["output"]>>>;
  organization?: Maybe<Organization>;
  organizationLevelDashboardMetrics?: Maybe<OrganizationLevelDashboardMetrics>;
  organizations: Array<Organization>;
  organizationsByName?: Maybe<Array<Maybe<Organization>>>;
  patient?: Maybe<Patient>;
  patientExists?: Maybe<Scalars["Boolean"]["output"]>;
  patientExistsWithoutZip?: Maybe<Scalars["Boolean"]["output"]>;
  patients?: Maybe<Array<Maybe<Patient>>>;
  patientsCount?: Maybe<Scalars["Int"]["output"]>;
  pendingOrganizations: Array<PendingOrganization>;
  queue?: Maybe<Array<Maybe<TestOrder>>>;
  resultsPage?: Maybe<ResultsPage>;
  specimenType?: Maybe<Array<Maybe<SpecimenType>>>;
  specimenTypes: Array<SpecimenType>;
  supportedDiseases: Array<SupportedDisease>;
  testResult?: Maybe<TestResult>;
  testResults?: Maybe<Array<Maybe<TestResult>>>;
  testResultsCount?: Maybe<Scalars["Int"]["output"]>;
  testResultsPage?: Maybe<TestResultsPage>;
  topLevelDashboardMetrics?: Maybe<TopLevelDashboardMetrics>;
  uploadSubmission: UploadResponse;
  uploadSubmissions: UploadSubmissionPage;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<ApiUser>>>;
  usersWithStatus?: Maybe<Array<ApiUserWithStatus>>;
  whoami: User;
};

export type QueryFacilitiesArgs = {
  showArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryFacilityArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryFacilityStatsArgs = {
  facilityId: Scalars["ID"]["input"];
};

export type QueryGetOrgAdminUserIdsArgs = {
  orgId: Scalars["ID"]["input"];
};

export type QueryOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrganizationLevelDashboardMetricsArgs = {
  endDate: Scalars["DateTime"]["input"];
  startDate: Scalars["DateTime"]["input"];
};

export type QueryOrganizationsArgs = {
  identityVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryOrganizationsByNameArgs = {
  isDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
};

export type QueryPatientArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPatientExistsArgs = {
  birthDate: Scalars["LocalDate"]["input"];
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
  zipCode: Scalars["String"]["input"];
};

export type QueryPatientExistsWithoutZipArgs = {
  birthDate: Scalars["LocalDate"]["input"];
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
};

export type QueryPatientsArgs = {
  archivedStatus?: InputMaybe<ArchivedStatus>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeArchivedFacilities?: InputMaybe<Scalars["Boolean"]["input"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]["input"]>;
  orgExternalId?: InputMaybe<Scalars["String"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryPatientsCountArgs = {
  archivedStatus?: InputMaybe<ArchivedStatus>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]["input"]>;
  orgExternalId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryQueueArgs = {
  facilityId: Scalars["ID"]["input"];
};

export type QueryResultsPageArgs = {
  disease?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryTestResultArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTestResultsArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryTestResultsCountArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  orgId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryTestResultsPageArgs = {
  disease?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryTopLevelDashboardMetricsArgs = {
  disease?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryUploadSubmissionArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryUploadSubmissionsArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type QueryUserArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type Result = {
  __typename?: "Result";
  correctionStatus?: Maybe<Scalars["String"]["output"]>;
  createdBy?: Maybe<ApiUser>;
  dateAdded: Scalars["String"]["output"];
  dateTested: Scalars["DateTime"]["output"];
  dateUpdated?: Maybe<Scalars["DateTime"]["output"]>;
  deviceType: DeviceType;
  disease: Scalars["String"]["output"];
  facility: Facility;
  id: Scalars["ID"]["output"];
  patient: Patient;
  patientLink?: Maybe<PatientLink>;
  reasonForCorrection?: Maybe<Scalars["String"]["output"]>;
  surveyData?: Maybe<AskOnEntrySurvey>;
  testResult: Scalars["String"]["output"];
};

export enum ResultValue {
  Negative = "NEGATIVE",
  Positive = "POSITIVE",
  Undetermined = "UNDETERMINED",
}

export type ResultsPage = {
  __typename?: "ResultsPage";
  content?: Maybe<Array<Maybe<Result>>>;
  totalElements?: Maybe<Scalars["Int"]["output"]>;
};

export enum Role {
  Admin = "ADMIN",
  EntryOnly = "ENTRY_ONLY",
  TestResultUploadUser = "TEST_RESULT_UPLOAD_USER",
  User = "USER",
}

export type SpecimenType = {
  __typename?: "SpecimenType";
  collectionLocationCode?: Maybe<Scalars["String"]["output"]>;
  collectionLocationName?: Maybe<Scalars["String"]["output"]>;
  internalId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  typeCode: Scalars["String"]["output"];
};

export type SupportedDisease = {
  __typename?: "SupportedDisease";
  internalId: Scalars["ID"]["output"];
  loinc: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type SupportedDiseaseTestPerformed = {
  __typename?: "SupportedDiseaseTestPerformed";
  equipmentUid?: Maybe<Scalars["String"]["output"]>;
  equipmentUidType?: Maybe<Scalars["String"]["output"]>;
  supportedDisease: SupportedDisease;
  testOrderedLoincCode?: Maybe<Scalars["String"]["output"]>;
  testOrderedLoincLongName?: Maybe<Scalars["String"]["output"]>;
  testPerformedLoincCode: Scalars["String"]["output"];
  testPerformedLoincLongName?: Maybe<Scalars["String"]["output"]>;
  testkitNameId?: Maybe<Scalars["String"]["output"]>;
};

export type SupportedDiseaseTestPerformedInput = {
  equipmentUid?: InputMaybe<Scalars["String"]["input"]>;
  equipmentUidType?: InputMaybe<Scalars["String"]["input"]>;
  supportedDisease: Scalars["ID"]["input"];
  testOrderedLoincCode?: InputMaybe<Scalars["String"]["input"]>;
  testOrderedLoincLongName?: InputMaybe<Scalars["String"]["input"]>;
  testPerformedLoincCode: Scalars["String"]["input"];
  testPerformedLoincLongName?: InputMaybe<Scalars["String"]["input"]>;
  testkitNameId?: InputMaybe<Scalars["String"]["input"]>;
};

export enum TestCorrectionStatus {
  Corrected = "CORRECTED",
  Original = "ORIGINAL",
  Removed = "REMOVED",
}

export type TestOrder = {
  __typename?: "TestOrder";
  correctionStatus?: Maybe<Scalars["String"]["output"]>;
  dateAdded: Scalars["String"]["output"];
  dateTested?: Maybe<Scalars["DateTime"]["output"]>;
  dateUpdated?: Maybe<Scalars["DateTime"]["output"]>;
  deviceType: DeviceType;
  facility: Facility;
  genderOfSexualPartners?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  id: Scalars["ID"]["output"];
  /** @deprecated alias for 'id' */
  internalId: Scalars["ID"]["output"];
  noSymptoms?: Maybe<Scalars["Boolean"]["output"]>;
  patient: Patient;
  pregnancy?: Maybe<Scalars["String"]["output"]>;
  reasonForCorrection?: Maybe<Scalars["String"]["output"]>;
  results: Array<MultiplexResult>;
  specimenType: SpecimenType;
  symptomOnset?: Maybe<Scalars["LocalDate"]["output"]>;
  symptoms?: Maybe<Scalars["String"]["output"]>;
  syphilisHistory?: Maybe<Scalars["String"]["output"]>;
  timerStartedAt?: Maybe<Scalars["String"]["output"]>;
};

export type TestResult = {
  __typename?: "TestResult";
  correctionStatus?: Maybe<Scalars["String"]["output"]>;
  createdBy?: Maybe<ApiUser>;
  dateAdded?: Maybe<Scalars["String"]["output"]>;
  dateTested?: Maybe<Scalars["DateTime"]["output"]>;
  dateUpdated?: Maybe<Scalars["DateTime"]["output"]>;
  deviceType?: Maybe<DeviceType>;
  facility?: Maybe<Facility>;
  genderOfSexualPartners?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  internalId?: Maybe<Scalars["ID"]["output"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]["output"]>;
  patient?: Maybe<Patient>;
  patientLink?: Maybe<PatientLink>;
  pregnancy?: Maybe<Scalars["String"]["output"]>;
  reasonForCorrection?: Maybe<Scalars["String"]["output"]>;
  results?: Maybe<Array<Maybe<MultiplexResult>>>;
  symptomOnset?: Maybe<Scalars["LocalDate"]["output"]>;
  symptoms?: Maybe<Scalars["String"]["output"]>;
  syphilisHistory?: Maybe<Scalars["String"]["output"]>;
};

export enum TestResultDeliveryPreference {
  All = "ALL",
  Email = "EMAIL",
  None = "NONE",
  Sms = "SMS",
}

export type TestResultsPage = {
  __typename?: "TestResultsPage";
  content?: Maybe<Array<Maybe<TestResult>>>;
  totalElements?: Maybe<Scalars["Int"]["output"]>;
};

export type TopLevelDashboardMetrics = {
  __typename?: "TopLevelDashboardMetrics";
  positiveTestCount?: Maybe<Scalars["Int"]["output"]>;
  totalTestCount?: Maybe<Scalars["Int"]["output"]>;
};

export type UpdateDeviceType = {
  internalId: Scalars["ID"]["input"];
  manufacturer: Scalars["String"]["input"];
  model: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  supportedDiseaseTestPerformed: Array<SupportedDiseaseTestPerformedInput>;
  swabTypes: Array<Scalars["ID"]["input"]>;
  testLength: Scalars["Int"]["input"];
};

export type UpdateFacilityInput = {
  address: FacilityAddressInput;
  cliaNumber?: InputMaybe<Scalars["String"]["input"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]["input"]>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  facilityId: Scalars["ID"]["input"];
  facilityName: Scalars["String"]["input"];
  orderingProvider?: InputMaybe<ProviderInput>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSpecimenType = {
  collectionLocationCode?: InputMaybe<Scalars["String"]["input"]>;
  collectionLocationName?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  typeCode: Scalars["String"]["input"];
};

export type UploadResponse = {
  __typename?: "UploadResponse";
  createdAt: Scalars["DateTime"]["output"];
  errors?: Maybe<Array<Maybe<FeedbackMessage>>>;
  recordsCount: Scalars["Int"]["output"];
  reportId: Scalars["ID"]["output"];
  status: UploadStatus;
  warnings?: Maybe<Array<Maybe<FeedbackMessage>>>;
};

export type UploadResult = {
  __typename?: "UploadResult";
  createdAt: Scalars["DateTime"]["output"];
  errors?: Maybe<Array<Maybe<FeedbackMessage>>>;
  internalId: Scalars["ID"]["output"];
  recordsCount: Scalars["Int"]["output"];
  reportId?: Maybe<Scalars["ID"]["output"]>;
  status: UploadStatus;
  warnings?: Maybe<Array<Maybe<FeedbackMessage>>>;
};

export enum UploadStatus {
  Failure = "FAILURE",
  Pending = "PENDING",
  Success = "SUCCESS",
}

export type UploadSubmissionPage = {
  __typename?: "UploadSubmissionPage";
  content: Array<UploadResult>;
  totalElements: Scalars["Int"]["output"];
};

export type User = {
  __typename?: "User";
  email: Scalars["String"]["output"];
  firstName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isAdmin?: Maybe<Scalars["Boolean"]["output"]>;
  isDeleted?: Maybe<Scalars["Boolean"]["output"]>;
  lastName: Scalars["String"]["output"];
  middleName?: Maybe<Scalars["String"]["output"]>;
  name: NameInfo;
  organization?: Maybe<Organization>;
  permissions: Array<UserPermission>;
  role?: Maybe<Role>;
  roleDescription: Scalars["String"]["output"];
  /** @deprecated Users have only one role now */
  roles: Array<Role>;
  status?: Maybe<Scalars["String"]["output"]>;
  suffix?: Maybe<Scalars["String"]["output"]>;
};

export type UserInput = {
  accessAllFacilities?: InputMaybe<Scalars["Boolean"]["input"]>;
  email: Scalars["String"]["input"];
  facilities?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<NameInput>;
  organizationExternalId?: InputMaybe<Scalars["String"]["input"]>;
  role: Role;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
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
  UploadResultsSpreadsheet = "UPLOAD_RESULTS_SPREADSHEET",
  ViewArchivedFacilities = "VIEW_ARCHIVED_FACILITIES",
}

export type WhoAmIQueryVariables = Exact<{ [key: string]: never }>;

export type WhoAmIQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    id: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName: string;
    suffix?: string | null;
    email: string;
    isAdmin?: boolean | null;
    permissions: Array<UserPermission>;
    roleDescription: string;
    organization?: {
      __typename?: "Organization";
      name: string;
      testingFacility: Array<{
        __typename?: "Facility";
        id: string;
        name: string;
      }>;
    } | null;
  };
};

export type GetManagedFacilitiesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetManagedFacilitiesQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?: {
      __typename?: "Organization";
      facilities: Array<{
        __typename?: "Facility";
        id: string;
        cliaNumber?: string | null;
        name: string;
      }>;
    } | null;
  };
};

export type GetFacilitiesQueryVariables = Exact<{ [key: string]: never }>;

export type GetFacilitiesQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?: {
      __typename?: "Organization";
      internalId: string;
      testingFacility: Array<{
        __typename?: "Facility";
        id: string;
        cliaNumber?: string | null;
        name: string;
        street?: string | null;
        streetTwo?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
        phone?: string | null;
        email?: string | null;
        deviceTypes: Array<{
          __typename?: "DeviceType";
          name: string;
          internalId: string;
        }>;
        orderingProvider?: {
          __typename?: "Provider";
          firstName?: string | null;
          middleName?: string | null;
          lastName?: string | null;
          suffix?: string | null;
          NPI?: string | null;
          street?: string | null;
          streetTwo?: string | null;
          city?: string | null;
          state?: string | null;
          zipCode?: string | null;
          phone?: string | null;
        } | null;
      }>;
    } | null;
  };
  deviceTypes: Array<{
    __typename?: "DeviceType";
    internalId: string;
    name: string;
    model: string;
    manufacturer: string;
    supportedDiseaseTestPerformed: Array<{
      __typename?: "SupportedDiseaseTestPerformed";
      supportedDisease: { __typename?: "SupportedDisease"; name: string };
    }>;
  }>;
};

export type AddFacilityMutationVariables = Exact<{
  testingFacilityName: Scalars["String"]["input"];
  cliaNumber?: InputMaybe<Scalars["String"]["input"]>;
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  zipCode: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]["input"]>;
  devices:
    | Array<InputMaybe<Scalars["ID"]["input"]>>
    | InputMaybe<Scalars["ID"]["input"]>;
}>;

export type AddFacilityMutation = {
  __typename?: "Mutation";
  addFacility?: { __typename?: "Facility"; id: string } | null;
};

export type UpdateFacilityMutationVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  testingFacilityName: Scalars["String"]["input"];
  cliaNumber?: InputMaybe<Scalars["String"]["input"]>;
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  zipCode: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]["input"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]["input"]>;
  devices:
    | Array<InputMaybe<Scalars["ID"]["input"]>>
    | InputMaybe<Scalars["ID"]["input"]>;
}>;

export type UpdateFacilityMutation = {
  __typename?: "Mutation";
  updateFacility?: { __typename?: "Facility"; id: string } | null;
};

export type AllSelfRegistrationLinksQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AllSelfRegistrationLinksQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?: {
      __typename?: "Organization";
      patientSelfRegistrationLink?: string | null;
      facilities: Array<{
        __typename?: "Facility";
        name: string;
        patientSelfRegistrationLink?: string | null;
      }>;
    } | null;
  };
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetUserQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName: string;
    roleDescription: string;
    role?: Role | null;
    permissions: Array<UserPermission>;
    email: string;
    status?: string | null;
    organization?: {
      __typename?: "Organization";
      testingFacility: Array<{
        __typename?: "Facility";
        id: string;
        name: string;
      }>;
    } | null;
  } | null;
};

export type GetUsersAndStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersAndStatusQuery = {
  __typename?: "Query";
  usersWithStatus?: Array<{
    __typename?: "ApiUserWithStatus";
    id: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName: string;
    email: string;
    status?: string | null;
  }> | null;
};

export type ResendActivationEmailMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ResendActivationEmailMutation = {
  __typename?: "Mutation";
  resendActivationEmail?: {
    __typename?: "User";
    id: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName: string;
    email: string;
    status?: string | null;
  } | null;
};

export type UpdateUserNameMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  firstName: Scalars["String"]["input"];
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  suffix?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type UpdateUserNameMutation = {
  __typename?: "Mutation";
  updateUser?: { __typename?: "User"; id: string } | null;
};

export type EditUserEmailMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  email?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type EditUserEmailMutation = {
  __typename?: "Mutation";
  updateUserEmail?: { __typename?: "User"; id: string; email: string } | null;
};

export type ResetUserMfaMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ResetUserMfaMutation = {
  __typename?: "Mutation";
  resetUserMfa?: { __typename?: "User"; id: string } | null;
};

export type ReactivateUserAndResetPasswordMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ReactivateUserAndResetPasswordMutation = {
  __typename?: "Mutation";
  reactivateUserAndResetPassword?: { __typename?: "User"; id: string } | null;
};

export type ReactivateUserMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ReactivateUserMutation = {
  __typename?: "Mutation";
  reactivateUser?: { __typename?: "User"; id: string } | null;
};

export type UpdateUserPrivilegesMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  role: Role;
  accessAllFacilities: Scalars["Boolean"]["input"];
  facilities: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
}>;

export type UpdateUserPrivilegesMutation = {
  __typename?: "Mutation";
  updateUserPrivileges?: { __typename?: "User"; id: string } | null;
};

export type ResetUserPasswordMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ResetUserPasswordMutation = {
  __typename?: "Mutation";
  resetUserPassword?: { __typename?: "User"; id: string } | null;
};

export type SetUserIsDeletedMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  deleted: Scalars["Boolean"]["input"];
}>;

export type SetUserIsDeletedMutation = {
  __typename?: "Mutation";
  setUserIsDeleted?: { __typename?: "User"; id: string } | null;
};

export type AddUserToCurrentOrgMutationVariables = Exact<{
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  role: Role;
  accessAllFacilities?: InputMaybe<Scalars["Boolean"]["input"]>;
  facilities?: InputMaybe<
    Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"]
  >;
}>;

export type AddUserToCurrentOrgMutation = {
  __typename?: "Mutation";
  addUserToCurrentOrg?: { __typename?: "User"; id: string } | null;
};

export type GetCurrentOrganizationQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentOrganizationQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?: {
      __typename?: "Organization";
      name: string;
      type: string;
    } | null;
  };
};

export type AdminSetOrganizationMutationVariables = Exact<{
  name: Scalars["String"]["input"];
  type: Scalars["String"]["input"];
}>;

export type AdminSetOrganizationMutation = {
  __typename?: "Mutation";
  adminUpdateOrganization?: string | null;
};

export type SetOrganizationMutationVariables = Exact<{
  type: Scalars["String"]["input"];
}>;

export type SetOrganizationMutation = {
  __typename?: "Mutation";
  updateOrganization?: string | null;
};

export type GetTopLevelDashboardMetricsNewQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  disease?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetTopLevelDashboardMetricsNewQuery = {
  __typename?: "Query";
  topLevelDashboardMetrics?: {
    __typename?: "TopLevelDashboardMetrics";
    positiveTestCount?: number | null;
    totalTestCount?: number | null;
  } | null;
};

export type PatientExistsQueryVariables = Exact<{
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
  birthDate: Scalars["LocalDate"]["input"];
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type PatientExistsQuery = {
  __typename?: "Query";
  patientExistsWithoutZip?: boolean | null;
};

export type AddPatientMutationVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  firstName: Scalars["String"]["input"];
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  birthDate: Scalars["LocalDate"]["input"];
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  zipCode: Scalars["String"]["input"];
  country: Scalars["String"]["input"];
  telephone?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  lookupId?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
  county?: InputMaybe<Scalars["String"]["input"]>;
  race?: InputMaybe<Scalars["String"]["input"]>;
  ethnicity?: InputMaybe<Scalars["String"]["input"]>;
  tribalAffiliation?: InputMaybe<Scalars["String"]["input"]>;
  gender?: InputMaybe<Scalars["String"]["input"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]["input"]>;
  preferredLanguage?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type AddPatientMutation = {
  __typename?: "Mutation";
  addPatient?: {
    __typename?: "Patient";
    internalId: string;
    facility?: { __typename?: "Facility"; id: string } | null;
  } | null;
};

export type ArchivePersonMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  deleted: Scalars["Boolean"]["input"];
}>;

export type ArchivePersonMutation = {
  __typename?: "Mutation";
  setPatientIsDeleted?: { __typename?: "Patient"; internalId: string } | null;
};

export type GetPatientDetailsQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetPatientDetailsQuery = {
  __typename?: "Query";
  patient?: {
    __typename?: "Patient";
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    birthDate?: any | null;
    street?: string | null;
    streetTwo?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    telephone?: string | null;
    role?: string | null;
    lookupId?: string | null;
    email?: string | null;
    emails?: Array<string | null> | null;
    county?: string | null;
    country?: string | null;
    race?: string | null;
    ethnicity?: string | null;
    tribalAffiliation?: Array<string | null> | null;
    gender?: string | null;
    genderIdentity?: string | null;
    residentCongregateSetting?: boolean | null;
    employedInHealthcare?: boolean | null;
    preferredLanguage?: string | null;
    testResultDelivery?: TestResultDeliveryPreference | null;
    notes?: string | null;
    phoneNumbers?: Array<{
      __typename?: "PhoneNumber";
      type?: PhoneType | null;
      number?: string | null;
    } | null> | null;
    facility?: { __typename?: "Facility"; id: string } | null;
  } | null;
};

export type UpdatePatientMutationVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId: Scalars["ID"]["input"];
  firstName: Scalars["String"]["input"];
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  lastName: Scalars["String"]["input"];
  birthDate: Scalars["LocalDate"]["input"];
  street: Scalars["String"]["input"];
  streetTwo?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  state: Scalars["String"]["input"];
  zipCode: Scalars["String"]["input"];
  telephone?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  lookupId?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
  county?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  race?: InputMaybe<Scalars["String"]["input"]>;
  ethnicity?: InputMaybe<Scalars["String"]["input"]>;
  tribalAffiliation?: InputMaybe<Scalars["String"]["input"]>;
  gender?: InputMaybe<Scalars["String"]["input"]>;
  genderIdentity?: InputMaybe<Scalars["String"]["input"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]["input"]>;
  preferredLanguage?: InputMaybe<Scalars["String"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type UpdatePatientMutation = {
  __typename?: "Mutation";
  updatePatient?: { __typename?: "Patient"; internalId: string } | null;
};

export type GetPatientsCountByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  archivedStatus?: InputMaybe<ArchivedStatus>;
  namePrefixMatch?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetPatientsCountByFacilityQuery = {
  __typename?: "Query";
  patientsCount?: number | null;
};

export type GetPatientsByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  pageNumber: Scalars["Int"]["input"];
  pageSize: Scalars["Int"]["input"];
  archivedStatus?: InputMaybe<ArchivedStatus>;
  namePrefixMatch?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetPatientsByFacilityQuery = {
  __typename?: "Query";
  patients?: Array<{
    __typename?: "Patient";
    internalId: string;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    birthDate?: any | null;
    isDeleted?: boolean | null;
    role?: string | null;
    lastTest?: { __typename?: "TestResult"; dateAdded?: string | null } | null;
  } | null> | null;
};

export type AddUserMutationVariables = Exact<{
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  middleName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
  email: Scalars["String"]["input"];
  organizationExternalId: Scalars["String"]["input"];
  role: Role;
}>;

export type AddUserMutation = {
  __typename?: "Mutation";
  addUser?: { __typename?: "User"; id: string } | null;
};

export type CreateDeviceTypeMutationVariables = Exact<{
  name: Scalars["String"]["input"];
  manufacturer: Scalars["String"]["input"];
  model: Scalars["String"]["input"];
  swabTypes: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
  supportedDiseaseTestPerformed:
    | Array<SupportedDiseaseTestPerformedInput>
    | SupportedDiseaseTestPerformedInput;
  testLength: Scalars["Int"]["input"];
}>;

export type CreateDeviceTypeMutation = {
  __typename?: "Mutation";
  createDeviceType?: { __typename?: "DeviceType"; internalId: string } | null;
};

export type UpdateDeviceTypeMutationVariables = Exact<{
  internalId: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  manufacturer: Scalars["String"]["input"];
  model: Scalars["String"]["input"];
  swabTypes: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
  supportedDiseaseTestPerformed:
    | Array<SupportedDiseaseTestPerformedInput>
    | SupportedDiseaseTestPerformedInput;
  testLength: Scalars["Int"]["input"];
}>;

export type UpdateDeviceTypeMutation = {
  __typename?: "Mutation";
  updateDeviceType?: { __typename?: "DeviceType"; internalId: string } | null;
};

export type GetDeviceTypeListQueryVariables = Exact<{ [key: string]: never }>;

export type GetDeviceTypeListQuery = {
  __typename?: "Query";
  deviceTypes: Array<{
    __typename?: "DeviceType";
    internalId: string;
    name: string;
    manufacturer: string;
    model: string;
    testLength: number;
    swabTypes: Array<{
      __typename?: "SpecimenType";
      internalId: string;
      name: string;
    }>;
    supportedDiseaseTestPerformed: Array<{
      __typename?: "SupportedDiseaseTestPerformed";
      testPerformedLoincCode: string;
      testkitNameId?: string | null;
      equipmentUid?: string | null;
      equipmentUidType?: string | null;
      testOrderedLoincCode?: string | null;
      testOrderedLoincLongName?: string | null;
      testPerformedLoincLongName?: string | null;
      supportedDisease: {
        __typename?: "SupportedDisease";
        internalId: string;
        name: string;
      };
    }>;
  }>;
};

export type GetSpecimenTypesQueryVariables = Exact<{ [key: string]: never }>;

export type GetSpecimenTypesQuery = {
  __typename?: "Query";
  specimenTypes: Array<{
    __typename?: "SpecimenType";
    internalId: string;
    name: string;
    typeCode: string;
  }>;
};

export type GetSupportedDiseasesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetSupportedDiseasesQuery = {
  __typename?: "Query";
  supportedDiseases: Array<{
    __typename?: "SupportedDisease";
    internalId: string;
    name: string;
  }>;
};

export type GetAllOrganizationsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllOrganizationsQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
  }>;
};

export type GetFacilitiesByOrgIdQueryVariables = Exact<{
  orgId: Scalars["ID"]["input"];
}>;

export type GetFacilitiesByOrgIdQuery = {
  __typename?: "Query";
  organization?: {
    __typename?: "Organization";
    id: string;
    externalId: string;
    name: string;
    type: string;
    facilities: Array<{
      __typename?: "Facility";
      name: string;
      id: string;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
    }>;
  } | null;
};

export type GetFacilityStatsQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
}>;

export type GetFacilityStatsQuery = {
  __typename?: "Query";
  facilityStats?: {
    __typename?: "FacilityStats";
    usersSingleAccessCount?: number | null;
    patientsSingleAccessCount?: number | null;
  } | null;
};

export type DeleteFacilityMutationVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
}>;

export type DeleteFacilityMutation = {
  __typename?: "Mutation";
  markFacilityAsDeleted?: string | null;
};

export type FindUserByEmailQueryVariables = Exact<{
  email: Scalars["String"]["input"];
}>;

export type FindUserByEmailQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    firstName?: string | null;
    middleName?: string | null;
    lastName: string;
    roleDescription: string;
    role?: Role | null;
    permissions: Array<UserPermission>;
    email: string;
    status?: string | null;
    isDeleted?: boolean | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      testingFacility: Array<{
        __typename?: "Facility";
        id: string;
        name: string;
      }>;
    } | null;
  } | null;
};

export type UndeleteUserMutationVariables = Exact<{
  userId: Scalars["ID"]["input"];
}>;

export type UndeleteUserMutation = {
  __typename?: "Mutation";
  setUserIsDeleted?: {
    __typename?: "User";
    id: string;
    email: string;
    isDeleted?: boolean | null;
  } | null;
};

export type UpdateUserPrivilegesAndGroupAccessMutationVariables = Exact<{
  username: Scalars["String"]["input"];
  orgExternalId: Scalars["String"]["input"];
  accessAllFacilities: Scalars["Boolean"]["input"];
  role: Role;
  facilities?: InputMaybe<
    | Array<InputMaybe<Scalars["ID"]["input"]>>
    | InputMaybe<Scalars["ID"]["input"]>
  >;
}>;

export type UpdateUserPrivilegesAndGroupAccessMutation = {
  __typename?: "Mutation";
  updateUserPrivilegesAndGroupAccess: { __typename?: "User"; id: string };
};

export type GetTestResultCountByOrgQueryVariables = Exact<{
  orgId: Scalars["ID"]["input"];
}>;

export type GetTestResultCountByOrgQuery = {
  __typename?: "Query";
  testResultsCount?: number | null;
};

export type GetPendingOrganizationsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetPendingOrganizationsQuery = {
  __typename?: "Query";
  pendingOrganizations: Array<{
    __typename?: "PendingOrganization";
    externalId: string;
    name: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPhone: string;
    createdAt: any;
  }>;
};

export type SetOrgIdentityVerifiedMutationVariables = Exact<{
  externalId: Scalars["String"]["input"];
  verified: Scalars["Boolean"]["input"];
}>;

export type SetOrgIdentityVerifiedMutation = {
  __typename?: "Mutation";
  setOrganizationIdentityVerified?: boolean | null;
};

export type MarkPendingOrganizationAsDeletedMutationVariables = Exact<{
  orgExternalId: Scalars["String"]["input"];
  deleted: Scalars["Boolean"]["input"];
}>;

export type MarkPendingOrganizationAsDeletedMutation = {
  __typename?: "Mutation";
  markPendingOrganizationAsDeleted?: string | null;
};

export type EditPendingOrganizationMutationVariables = Exact<{
  externalId: Scalars["String"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  adminFirstName?: InputMaybe<Scalars["String"]["input"]>;
  adminLastName?: InputMaybe<Scalars["String"]["input"]>;
  adminEmail?: InputMaybe<Scalars["String"]["input"]>;
  adminPhone?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type EditPendingOrganizationMutation = {
  __typename?: "Mutation";
  editPendingOrganization?: string | null;
};

export type GetOrganizationsQueryVariables = Exact<{
  identityVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetOrganizationsQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    internalId: string;
    externalId: string;
    name: string;
  }>;
};

export type SetCurrentUserTenantDataAccessOpMutationVariables = Exact<{
  organizationExternalId?: InputMaybe<Scalars["String"]["input"]>;
  justification?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SetCurrentUserTenantDataAccessOpMutation = {
  __typename?: "Mutation";
  setCurrentUserTenantDataAccess?: {
    __typename?: "User";
    id: string;
    email: string;
    permissions: Array<UserPermission>;
    role?: Role | null;
    organization?: {
      __typename?: "Organization";
      name: string;
      externalId: string;
    } | null;
  } | null;
};

export type GetOrganizationWithFacilitiesQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetOrganizationWithFacilitiesQuery = {
  __typename?: "Query";
  organization?: {
    __typename?: "Organization";
    externalId: string;
    name: string;
    facilities: Array<{ __typename?: "Facility"; id: string; name: string }>;
  } | null;
};

export type GetPatientsByFacilityWithOrgQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  pageNumber: Scalars["Int"]["input"];
  pageSize: Scalars["Int"]["input"];
  archivedStatus?: InputMaybe<ArchivedStatus>;
  orgExternalId: Scalars["String"]["input"];
}>;

export type GetPatientsByFacilityWithOrgQuery = {
  __typename?: "Query";
  patients?: Array<{
    __typename?: "Patient";
    internalId: string;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    birthDate?: any | null;
    isDeleted?: boolean | null;
    facility?: { __typename?: "Facility"; id: string; name: string } | null;
  } | null> | null;
};

export type GetPatientsCountByFacilityWithOrgQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  archivedStatus?: InputMaybe<ArchivedStatus>;
  orgExternalId: Scalars["String"]["input"];
}>;

export type GetPatientsCountByFacilityWithOrgQuery = {
  __typename?: "Query";
  patientsCount?: number | null;
};

export type UnarchivePatientMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  orgExternalId: Scalars["String"]["input"];
}>;

export type UnarchivePatientMutation = {
  __typename?: "Mutation";
  setPatientIsDeleted?: { __typename?: "Patient"; internalId: string } | null;
};

export type SendSupportEscalationMutationVariables = Exact<{
  [key: string]: never;
}>;

export type SendSupportEscalationMutation = {
  __typename?: "Mutation";
  sendSupportEscalation?: string | null;
};

export type GetPatientQueryVariables = Exact<{
  internalId: Scalars["ID"]["input"];
}>;

export type GetPatientQuery = {
  __typename?: "Query";
  patient?: {
    __typename?: "Patient";
    internalId: string;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    birthDate?: any | null;
    gender?: string | null;
    telephone?: string | null;
    emails?: Array<string | null> | null;
    testResultDelivery?: TestResultDeliveryPreference | null;
    phoneNumbers?: Array<{
      __typename?: "PhoneNumber";
      type?: PhoneType | null;
      number?: string | null;
    } | null> | null;
  } | null;
};

export type GetPatientsByFacilityForQueueQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]["input"]>;
  archivedStatus?: InputMaybe<ArchivedStatus>;
  includeArchivedFacilities?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetPatientsByFacilityForQueueQuery = {
  __typename?: "Query";
  patients?: Array<{
    __typename?: "Patient";
    internalId: string;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    birthDate?: any | null;
    gender?: string | null;
    telephone?: string | null;
    email?: string | null;
    emails?: Array<string | null> | null;
    testResultDelivery?: TestResultDeliveryPreference | null;
    phoneNumbers?: Array<{
      __typename?: "PhoneNumber";
      type?: PhoneType | null;
      number?: string | null;
    } | null> | null;
  } | null> | null;
};

export type AddPatientToQueueMutationVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
  patientId: Scalars["ID"]["input"];
  symptoms?: InputMaybe<Scalars["String"]["input"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]["input"]>;
  pregnancy?: InputMaybe<Scalars["String"]["input"]>;
  syphilisHistory?: InputMaybe<Scalars["String"]["input"]>;
  noSymptoms?: InputMaybe<Scalars["Boolean"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
}>;

export type AddPatientToQueueMutation = {
  __typename?: "Mutation";
  addPatientToQueue?: string | null;
};

export type UpdateAoeMutationVariables = Exact<{
  patientId: Scalars["ID"]["input"];
  symptoms?: InputMaybe<Scalars["String"]["input"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]["input"]>;
  pregnancy?: InputMaybe<Scalars["String"]["input"]>;
  syphilisHistory?: InputMaybe<Scalars["String"]["input"]>;
  noSymptoms?: InputMaybe<Scalars["Boolean"]["input"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  genderOfSexualPartners?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type UpdateAoeMutation = {
  __typename?: "Mutation";
  updateAoeQuestions?: string | null;
};

export type RemovePatientFromQueueMutationVariables = Exact<{
  patientId: Scalars["ID"]["input"];
}>;

export type RemovePatientFromQueueMutation = {
  __typename?: "Mutation";
  removePatientFromQueue?: string | null;
};

export type EditQueueItemMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  deviceTypeId?: InputMaybe<Scalars["ID"]["input"]>;
  specimenTypeId?: InputMaybe<Scalars["ID"]["input"]>;
  results?: InputMaybe<
    Array<InputMaybe<MultiplexResultInput>> | InputMaybe<MultiplexResultInput>
  >;
  dateTested?: InputMaybe<Scalars["DateTime"]["input"]>;
}>;

export type EditQueueItemMutation = {
  __typename?: "Mutation";
  editQueueItem?: {
    __typename?: "TestOrder";
    dateTested?: any | null;
    results: Array<{
      __typename?: "MultiplexResult";
      testResult: string;
      disease: { __typename?: "SupportedDisease"; name: string };
    }>;
    deviceType: {
      __typename?: "DeviceType";
      internalId: string;
      testLength: number;
    };
  } | null;
};

export type SubmitQueueItemMutationVariables = Exact<{
  patientId: Scalars["ID"]["input"];
  deviceTypeId: Scalars["ID"]["input"];
  specimenTypeId: Scalars["ID"]["input"];
  results:
    | Array<InputMaybe<MultiplexResultInput>>
    | InputMaybe<MultiplexResultInput>;
  dateTested?: InputMaybe<Scalars["DateTime"]["input"]>;
}>;

export type SubmitQueueItemMutation = {
  __typename?: "Mutation";
  submitQueueItem?: {
    __typename?: "AddTestResultResponse";
    deliverySuccess?: boolean | null;
    testEventId: string;
    testResult: { __typename?: "TestOrder"; internalId: string };
  } | null;
};

export type GetFacilityQueueQueryVariables = Exact<{
  facilityId: Scalars["ID"]["input"];
}>;

export type GetFacilityQueueQuery = {
  __typename?: "Query";
  queue?: Array<{
    __typename?: "TestOrder";
    internalId: string;
    pregnancy?: string | null;
    syphilisHistory?: string | null;
    dateAdded: string;
    symptoms?: string | null;
    symptomOnset?: any | null;
    noSymptoms?: boolean | null;
    genderOfSexualPartners?: Array<string | null> | null;
    dateTested?: any | null;
    correctionStatus?: string | null;
    reasonForCorrection?: string | null;
    timerStartedAt?: string | null;
    deviceType: {
      __typename?: "DeviceType";
      internalId: string;
      name: string;
      model: string;
      testLength: number;
    };
    specimenType: {
      __typename?: "SpecimenType";
      internalId: string;
      name: string;
      typeCode: string;
    };
    patient: {
      __typename?: "Patient";
      internalId: string;
      telephone?: string | null;
      birthDate?: any | null;
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      gender?: string | null;
      testResultDelivery?: TestResultDeliveryPreference | null;
      preferredLanguage?: string | null;
      email?: string | null;
      emails?: Array<string | null> | null;
      phoneNumbers?: Array<{
        __typename?: "PhoneNumber";
        type?: PhoneType | null;
        number?: string | null;
      } | null> | null;
    };
    results: Array<{
      __typename?: "MultiplexResult";
      testResult: string;
      disease: { __typename?: "SupportedDisease"; name: string };
    }>;
  } | null> | null;
  facility?: {
    __typename?: "Facility";
    name: string;
    id: string;
    deviceTypes: Array<{
      __typename?: "DeviceType";
      internalId: string;
      name: string;
      testLength: number;
      supportedDiseaseTestPerformed: Array<{
        __typename?: "SupportedDiseaseTestPerformed";
        testPerformedLoincCode: string;
        testOrderedLoincCode?: string | null;
        supportedDisease: {
          __typename?: "SupportedDisease";
          internalId: string;
          name: string;
          loinc: string;
        };
      }>;
      swabTypes: Array<{
        __typename?: "SpecimenType";
        internalId: string;
        name: string;
        typeCode: string;
      }>;
    }>;
  } | null;
};

export type UpdateTestOrderTimerStartedAtMutationVariables = Exact<{
  testOrderId: Scalars["ID"]["input"];
  startedAt?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type UpdateTestOrderTimerStartedAtMutation = {
  __typename?: "Mutation";
  updateTestOrderTimerStartedAt?: string | null;
};

export type GetTestResultForResendingEmailsQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetTestResultForResendingEmailsQuery = {
  __typename?: "Query";
  testResult?: {
    __typename?: "TestResult";
    dateTested?: any | null;
    patient?: {
      __typename?: "Patient";
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      email?: string | null;
      emails?: Array<string | null> | null;
    } | null;
  } | null;
};

export type ResendTestResultsEmailMutationVariables = Exact<{
  testEventId: Scalars["ID"]["input"];
}>;

export type ResendTestResultsEmailMutation = {
  __typename?: "Mutation";
  sendPatientLinkEmailByTestEventId?: boolean | null;
};

export type GetFacilityResultsForCsvWithCountQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  disease?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetFacilityResultsForCsvWithCountQuery = {
  __typename?: "Query";
  testResultsPage?: {
    __typename?: "TestResultsPage";
    totalElements?: number | null;
    content?: Array<{
      __typename?: "TestResult";
      dateTested?: any | null;
      dateUpdated?: any | null;
      correctionStatus?: string | null;
      reasonForCorrection?: string | null;
      symptoms?: string | null;
      noSymptoms?: boolean | null;
      symptomOnset?: any | null;
      facility?: {
        __typename?: "Facility";
        name: string;
        isDeleted?: boolean | null;
      } | null;
      results?: Array<{
        __typename?: "MultiplexResult";
        testResult: string;
        disease: { __typename?: "SupportedDisease"; name: string };
      } | null> | null;
      deviceType?: {
        __typename?: "DeviceType";
        name: string;
        manufacturer: string;
        model: string;
        swabTypes: Array<{
          __typename?: "SpecimenType";
          internalId: string;
          name: string;
        }>;
      } | null;
      patient?: {
        __typename?: "Patient";
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        birthDate?: any | null;
        gender?: string | null;
        race?: string | null;
        ethnicity?: string | null;
        tribalAffiliation?: Array<string | null> | null;
        lookupId?: string | null;
        telephone?: string | null;
        email?: string | null;
        street?: string | null;
        streetTwo?: string | null;
        city?: string | null;
        county?: string | null;
        state?: string | null;
        zipCode?: string | null;
        country?: string | null;
        role?: string | null;
        residentCongregateSetting?: boolean | null;
        employedInHealthcare?: boolean | null;
        preferredLanguage?: string | null;
      } | null;
      createdBy?: {
        __typename?: "ApiUser";
        nameInfo?: {
          __typename?: "NameInfo";
          firstName?: string | null;
          middleName?: string | null;
          lastName: string;
        } | null;
      } | null;
    } | null> | null;
  } | null;
};

export type GetResultsMultiplexWithCountQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  disease?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetResultsMultiplexWithCountQuery = {
  __typename?: "Query";
  resultsPage?: {
    __typename?: "ResultsPage";
    totalElements?: number | null;
    content?: Array<{
      __typename?: "Result";
      id: string;
      dateAdded: string;
      dateTested: any;
      disease: string;
      testResult: string;
      correctionStatus?: string | null;
      reasonForCorrection?: string | null;
      facility: {
        __typename?: "Facility";
        name: string;
        isDeleted?: boolean | null;
      };
      deviceType: {
        __typename?: "DeviceType";
        internalId: string;
        name: string;
      };
      patient: {
        __typename?: "Patient";
        internalId: string;
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        birthDate?: any | null;
        gender?: string | null;
        role?: string | null;
        email?: string | null;
        phoneNumbers?: Array<{
          __typename?: "PhoneNumber";
          type?: PhoneType | null;
          number?: string | null;
        } | null> | null;
      };
      createdBy?: {
        __typename?: "ApiUser";
        nameInfo?: {
          __typename?: "NameInfo";
          firstName?: string | null;
          middleName?: string | null;
          lastName: string;
        } | null;
      } | null;
    } | null> | null;
  } | null;
};

export type GetResultsForDownloadQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  disease?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetResultsForDownloadQuery = {
  __typename?: "Query";
  resultsPage?: {
    __typename?: "ResultsPage";
    totalElements?: number | null;
    content?: Array<{
      __typename?: "Result";
      id: string;
      dateAdded: string;
      dateUpdated?: any | null;
      dateTested: any;
      disease: string;
      testResult: string;
      correctionStatus?: string | null;
      reasonForCorrection?: string | null;
      facility: {
        __typename?: "Facility";
        name: string;
        isDeleted?: boolean | null;
      };
      deviceType: {
        __typename?: "DeviceType";
        name: string;
        manufacturer: string;
        model: string;
        swabTypes: Array<{
          __typename?: "SpecimenType";
          internalId: string;
          name: string;
        }>;
      };
      patient: {
        __typename?: "Patient";
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        birthDate?: any | null;
        gender?: string | null;
        race?: string | null;
        ethnicity?: string | null;
        tribalAffiliation?: Array<string | null> | null;
        role?: string | null;
        lookupId?: string | null;
        street?: string | null;
        streetTwo?: string | null;
        city?: string | null;
        county?: string | null;
        state?: string | null;
        zipCode?: string | null;
        country?: string | null;
        email?: string | null;
        residentCongregateSetting?: boolean | null;
        employedInHealthcare?: boolean | null;
        preferredLanguage?: string | null;
        phoneNumbers?: Array<{
          __typename?: "PhoneNumber";
          type?: PhoneType | null;
          number?: string | null;
        } | null> | null;
      };
      createdBy?: {
        __typename?: "ApiUser";
        nameInfo?: {
          __typename?: "NameInfo";
          firstName?: string | null;
          middleName?: string | null;
          lastName: string;
        } | null;
      } | null;
      surveyData?: {
        __typename?: "AskOnEntrySurvey";
        pregnancy?: string | null;
        syphilisHistory?: string | null;
        symptoms?: string | null;
        symptomOnset?: any | null;
        noSymptoms?: boolean | null;
        genderOfSexualPartners?: Array<string | null> | null;
      } | null;
    } | null> | null;
  } | null;
};

export type GetAllFacilitiesQueryVariables = Exact<{
  showArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetAllFacilitiesQuery = {
  __typename?: "Query";
  facilities?: Array<{
    __typename?: "Facility";
    id: string;
    name: string;
    isDeleted?: boolean | null;
  } | null> | null;
};

export type GetResultsCountByFacilityQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]["input"]>;
  patientId?: InputMaybe<Scalars["ID"]["input"]>;
  result?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
}>;

export type GetResultsCountByFacilityQuery = {
  __typename?: "Query";
  testResultsCount?: number | null;
};

export type GetTestResultForPrintQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetTestResultForPrintQuery = {
  __typename?: "Query";
  testResult?: {
    __typename?: "TestResult";
    dateTested?: any | null;
    correctionStatus?: string | null;
    results?: Array<{
      __typename?: "MultiplexResult";
      testResult: string;
      disease: { __typename?: "SupportedDisease"; name: string };
    } | null> | null;
    deviceType?: {
      __typename?: "DeviceType";
      name: string;
      model: string;
    } | null;
    patient?: {
      __typename?: "Patient";
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      birthDate?: any | null;
    } | null;
    facility?: {
      __typename?: "Facility";
      name: string;
      cliaNumber?: string | null;
      phone?: string | null;
      street?: string | null;
      streetTwo?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      orderingProvider?: {
        __typename?: "Provider";
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        NPI?: string | null;
      } | null;
    } | null;
  } | null;
};

export type GetUploadSubmissionQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetUploadSubmissionQuery = {
  __typename?: "Query";
  uploadSubmission: {
    __typename?: "UploadResponse";
    reportId: string;
    createdAt: any;
    status: UploadStatus;
    recordsCount: number;
    warnings?: Array<{
      __typename?: "FeedbackMessage";
      message?: string | null;
      scope?: string | null;
    } | null> | null;
    errors?: Array<{
      __typename?: "FeedbackMessage";
      message?: string | null;
      scope?: string | null;
    } | null> | null;
  };
};

export type GetUploadSubmissionsQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  pageNumber?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetUploadSubmissionsQuery = {
  __typename?: "Query";
  uploadSubmissions: {
    __typename?: "UploadSubmissionPage";
    totalElements: number;
    content: Array<{
      __typename?: "UploadResult";
      internalId: string;
      reportId?: string | null;
      createdAt: any;
      status: UploadStatus;
      recordsCount: number;
      errors?: Array<{
        __typename?: "FeedbackMessage";
        message?: string | null;
        scope?: string | null;
      } | null> | null;
      warnings?: Array<{
        __typename?: "FeedbackMessage";
        message?: string | null;
        scope?: string | null;
      } | null> | null;
    }>;
  };
};

export type GetTestResultForCorrectionQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetTestResultForCorrectionQuery = {
  __typename?: "Query";
  testResult?: {
    __typename?: "TestResult";
    dateTested?: any | null;
    correctionStatus?: string | null;
    results?: Array<{
      __typename?: "MultiplexResult";
      testResult: string;
      disease: { __typename?: "SupportedDisease"; name: string };
    } | null> | null;
    deviceType?: { __typename?: "DeviceType"; name: string } | null;
    patient?: {
      __typename?: "Patient";
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      birthDate?: any | null;
    } | null;
  } | null;
};

export type MarkTestAsErrorMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  reason: Scalars["String"]["input"];
}>;

export type MarkTestAsErrorMutation = {
  __typename?: "Mutation";
  correctTestMarkAsError?: {
    __typename?: "TestResult";
    internalId?: string | null;
  } | null;
};

export type MarkTestAsCorrectionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  reason: Scalars["String"]["input"];
}>;

export type MarkTestAsCorrectionMutation = {
  __typename?: "Mutation";
  correctTestMarkAsCorrection?: {
    __typename?: "TestResult";
    internalId?: string | null;
  } | null;
};

export type GetTestResultForTextQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetTestResultForTextQuery = {
  __typename?: "Query";
  testResult?: {
    __typename?: "TestResult";
    dateTested?: any | null;
    patient?: {
      __typename?: "Patient";
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      birthDate?: any | null;
      phoneNumbers?: Array<{
        __typename?: "PhoneNumber";
        type?: PhoneType | null;
        number?: string | null;
      } | null> | null;
    } | null;
  } | null;
};

export type SendSmsMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type SendSmsMutation = {
  __typename?: "Mutation";
  sendPatientLinkSmsByTestEventId?: boolean | null;
};

export type GetTestResultDetailsQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetTestResultDetailsQuery = {
  __typename?: "Query";
  testResult?: {
    __typename?: "TestResult";
    dateTested?: any | null;
    correctionStatus?: string | null;
    symptoms?: string | null;
    symptomOnset?: any | null;
    pregnancy?: string | null;
    genderOfSexualPartners?: Array<string | null> | null;
    results?: Array<{
      __typename?: "MultiplexResult";
      testResult: string;
      disease: { __typename?: "SupportedDisease"; name: string };
    } | null> | null;
    deviceType?: { __typename?: "DeviceType"; name: string } | null;
    patient?: {
      __typename?: "Patient";
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      birthDate?: any | null;
    } | null;
    createdBy?: {
      __typename?: "ApiUser";
      name: {
        __typename?: "NameInfo";
        firstName?: string | null;
        middleName?: string | null;
        lastName: string;
      };
    } | null;
  } | null;
};

export type GetDeviceTypesForLookupQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetDeviceTypesForLookupQuery = {
  __typename?: "Query";
  deviceTypes: Array<{
    __typename?: "DeviceType";
    internalId: string;
    name: string;
    manufacturer: string;
    model: string;
    swabTypes: Array<{
      __typename?: "SpecimenType";
      internalId: string;
      name: string;
      typeCode: string;
    }>;
    supportedDiseaseTestPerformed: Array<{
      __typename?: "SupportedDiseaseTestPerformed";
      testPerformedLoincCode: string;
      testkitNameId?: string | null;
      equipmentUid?: string | null;
      testOrderedLoincCode?: string | null;
      supportedDisease: {
        __typename?: "SupportedDisease";
        internalId: string;
        name: string;
        loinc: string;
      };
    }>;
  }>;
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
export function useWhoAmISuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    WhoAmIQuery,
    WhoAmIQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<WhoAmIQuery, WhoAmIQueryVariables>(
    WhoAmIDocument,
    options
  );
}
export type WhoAmIQueryHookResult = ReturnType<typeof useWhoAmIQuery>;
export type WhoAmILazyQueryHookResult = ReturnType<typeof useWhoAmILazyQuery>;
export type WhoAmISuspenseQueryHookResult = ReturnType<
  typeof useWhoAmISuspenseQuery
>;
export type WhoAmIQueryResult = Apollo.QueryResult<
  WhoAmIQuery,
  WhoAmIQueryVariables
>;
export const GetManagedFacilitiesDocument = gql`
  query GetManagedFacilities {
    whoami {
      organization {
        facilities {
          id
          cliaNumber
          name
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
export function useGetManagedFacilitiesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetManagedFacilitiesQuery,
    GetManagedFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetManagedFacilitiesSuspenseQueryHookResult = ReturnType<
  typeof useGetManagedFacilitiesSuspenseQuery
>;
export type GetManagedFacilitiesQueryResult = Apollo.QueryResult<
  GetManagedFacilitiesQuery,
  GetManagedFacilitiesQueryVariables
>;
export const GetFacilitiesDocument = gql`
  query GetFacilities {
    whoami {
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
          deviceTypes {
            name
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
    deviceTypes {
      internalId
      name
      model
      manufacturer
      supportedDiseaseTestPerformed {
        supportedDisease {
          name
        }
      }
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
export function useGetFacilitiesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacilitiesQuery,
    GetFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFacilitiesQuery,
    GetFacilitiesQueryVariables
  >(GetFacilitiesDocument, options);
}
export type GetFacilitiesQueryHookResult = ReturnType<
  typeof useGetFacilitiesQuery
>;
export type GetFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetFacilitiesLazyQuery
>;
export type GetFacilitiesSuspenseQueryHookResult = ReturnType<
  typeof useGetFacilitiesSuspenseQuery
>;
export type GetFacilitiesQueryResult = Apollo.QueryResult<
  GetFacilitiesQuery,
  GetFacilitiesQueryVariables
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
    $devices: [ID]!
  ) {
    addFacility(
      facilityInfo: {
        facilityName: $testingFacilityName
        cliaNumber: $cliaNumber
        address: {
          street: $street
          streetTwo: $streetTwo
          city: $city
          state: $state
          zipCode: $zipCode
        }
        phone: $phone
        email: $email
        orderingProvider: {
          firstName: $orderingProviderFirstName
          middleName: $orderingProviderMiddleName
          lastName: $orderingProviderLastName
          suffix: $orderingProviderSuffix
          npi: $orderingProviderNPI
          street: $orderingProviderStreet
          streetTwo: $orderingProviderStreetTwo
          city: $orderingProviderCity
          state: $orderingProviderState
          zipCode: $orderingProviderZipCode
          phone: $orderingProviderPhone
        }
        deviceIds: $devices
      }
    ) {
      id
    }
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
export type AddFacilityMutationResult =
  Apollo.MutationResult<AddFacilityMutation>;
export type AddFacilityMutationOptions = Apollo.BaseMutationOptions<
  AddFacilityMutation,
  AddFacilityMutationVariables
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
    $devices: [ID]!
  ) {
    updateFacility(
      facilityInfo: {
        facilityId: $facilityId
        facilityName: $testingFacilityName
        cliaNumber: $cliaNumber
        address: {
          street: $street
          streetTwo: $streetTwo
          city: $city
          state: $state
          zipCode: $zipCode
        }
        phone: $phone
        email: $email
        orderingProvider: {
          firstName: $orderingProviderFirstName
          middleName: $orderingProviderMiddleName
          lastName: $orderingProviderLastName
          suffix: $orderingProviderSuffix
          npi: $orderingProviderNPI
          street: $orderingProviderStreet
          streetTwo: $orderingProviderStreetTwo
          city: $orderingProviderCity
          state: $orderingProviderState
          zipCode: $orderingProviderZipCode
          phone: $orderingProviderPhone
        }
        deviceIds: $devices
      }
    ) {
      id
    }
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
export type UpdateFacilityMutationResult =
  Apollo.MutationResult<UpdateFacilityMutation>;
export type UpdateFacilityMutationOptions = Apollo.BaseMutationOptions<
  UpdateFacilityMutation,
  UpdateFacilityMutationVariables
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
export function useAllSelfRegistrationLinksSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    AllSelfRegistrationLinksQuery,
    AllSelfRegistrationLinksQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type AllSelfRegistrationLinksSuspenseQueryHookResult = ReturnType<
  typeof useAllSelfRegistrationLinksSuspenseQuery
>;
export type AllSelfRegistrationLinksQueryResult = Apollo.QueryResult<
  AllSelfRegistrationLinksQuery,
  AllSelfRegistrationLinksQueryVariables
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
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables> &
    ({ variables: GetUserQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useGetUserSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<
  typeof useGetUserSuspenseQuery
>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
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
export function useGetUsersAndStatusSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUsersAndStatusQuery,
    GetUsersAndStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetUsersAndStatusSuspenseQueryHookResult = ReturnType<
  typeof useGetUsersAndStatusSuspenseQuery
>;
export type GetUsersAndStatusQueryResult = Apollo.QueryResult<
  GetUsersAndStatusQuery,
  GetUsersAndStatusQueryVariables
>;
export const ResendActivationEmailDocument = gql`
  mutation ResendActivationEmail($id: ID!) {
    resendActivationEmail(id: $id) {
      id
      firstName
      middleName
      lastName
      email
      status
    }
  }
`;
export type ResendActivationEmailMutationFn = Apollo.MutationFunction<
  ResendActivationEmailMutation,
  ResendActivationEmailMutationVariables
>;

/**
 * __useResendActivationEmailMutation__
 *
 * To run a mutation, you first call `useResendActivationEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendActivationEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendActivationEmailMutation, { data, loading, error }] = useResendActivationEmailMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResendActivationEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResendActivationEmailMutation,
    ResendActivationEmailMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResendActivationEmailMutation,
    ResendActivationEmailMutationVariables
  >(ResendActivationEmailDocument, options);
}
export type ResendActivationEmailMutationHookResult = ReturnType<
  typeof useResendActivationEmailMutation
>;
export type ResendActivationEmailMutationResult =
  Apollo.MutationResult<ResendActivationEmailMutation>;
export type ResendActivationEmailMutationOptions = Apollo.BaseMutationOptions<
  ResendActivationEmailMutation,
  ResendActivationEmailMutationVariables
>;
export const UpdateUserNameDocument = gql`
  mutation UpdateUserName(
    $id: ID!
    $firstName: String!
    $middleName: String
    $lastName: String!
    $suffix: String
  ) {
    updateUser(
      id: $id
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      suffix: $suffix
    ) {
      id
    }
  }
`;
export type UpdateUserNameMutationFn = Apollo.MutationFunction<
  UpdateUserNameMutation,
  UpdateUserNameMutationVariables
>;

/**
 * __useUpdateUserNameMutation__
 *
 * To run a mutation, you first call `useUpdateUserNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserNameMutation, { data, loading, error }] = useUpdateUserNameMutation({
 *   variables: {
 *      id: // value for 'id'
 *      firstName: // value for 'firstName'
 *      middleName: // value for 'middleName'
 *      lastName: // value for 'lastName'
 *      suffix: // value for 'suffix'
 *   },
 * });
 */
export function useUpdateUserNameMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserNameMutation,
    UpdateUserNameMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserNameMutation,
    UpdateUserNameMutationVariables
  >(UpdateUserNameDocument, options);
}
export type UpdateUserNameMutationHookResult = ReturnType<
  typeof useUpdateUserNameMutation
>;
export type UpdateUserNameMutationResult =
  Apollo.MutationResult<UpdateUserNameMutation>;
export type UpdateUserNameMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserNameMutation,
  UpdateUserNameMutationVariables
>;
export const EditUserEmailDocument = gql`
  mutation EditUserEmail($id: ID!, $email: String) {
    updateUserEmail(id: $id, email: $email) {
      id
      email
    }
  }
`;
export type EditUserEmailMutationFn = Apollo.MutationFunction<
  EditUserEmailMutation,
  EditUserEmailMutationVariables
>;

/**
 * __useEditUserEmailMutation__
 *
 * To run a mutation, you first call `useEditUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editUserEmailMutation, { data, loading, error }] = useEditUserEmailMutation({
 *   variables: {
 *      id: // value for 'id'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useEditUserEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditUserEmailMutation,
    EditUserEmailMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditUserEmailMutation,
    EditUserEmailMutationVariables
  >(EditUserEmailDocument, options);
}
export type EditUserEmailMutationHookResult = ReturnType<
  typeof useEditUserEmailMutation
>;
export type EditUserEmailMutationResult =
  Apollo.MutationResult<EditUserEmailMutation>;
export type EditUserEmailMutationOptions = Apollo.BaseMutationOptions<
  EditUserEmailMutation,
  EditUserEmailMutationVariables
>;
export const ResetUserMfaDocument = gql`
  mutation ResetUserMfa($id: ID!) {
    resetUserMfa(id: $id) {
      id
    }
  }
`;
export type ResetUserMfaMutationFn = Apollo.MutationFunction<
  ResetUserMfaMutation,
  ResetUserMfaMutationVariables
>;

/**
 * __useResetUserMfaMutation__
 *
 * To run a mutation, you first call `useResetUserMfaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetUserMfaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetUserMfaMutation, { data, loading, error }] = useResetUserMfaMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResetUserMfaMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResetUserMfaMutation,
    ResetUserMfaMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResetUserMfaMutation,
    ResetUserMfaMutationVariables
  >(ResetUserMfaDocument, options);
}
export type ResetUserMfaMutationHookResult = ReturnType<
  typeof useResetUserMfaMutation
>;
export type ResetUserMfaMutationResult =
  Apollo.MutationResult<ResetUserMfaMutation>;
export type ResetUserMfaMutationOptions = Apollo.BaseMutationOptions<
  ResetUserMfaMutation,
  ResetUserMfaMutationVariables
>;
export const ReactivateUserAndResetPasswordDocument = gql`
  mutation ReactivateUserAndResetPassword($id: ID!) {
    reactivateUserAndResetPassword(id: $id) {
      id
    }
  }
`;
export type ReactivateUserAndResetPasswordMutationFn = Apollo.MutationFunction<
  ReactivateUserAndResetPasswordMutation,
  ReactivateUserAndResetPasswordMutationVariables
>;

/**
 * __useReactivateUserAndResetPasswordMutation__
 *
 * To run a mutation, you first call `useReactivateUserAndResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactivateUserAndResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactivateUserAndResetPasswordMutation, { data, loading, error }] = useReactivateUserAndResetPasswordMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useReactivateUserAndResetPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ReactivateUserAndResetPasswordMutation,
    ReactivateUserAndResetPasswordMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ReactivateUserAndResetPasswordMutation,
    ReactivateUserAndResetPasswordMutationVariables
  >(ReactivateUserAndResetPasswordDocument, options);
}
export type ReactivateUserAndResetPasswordMutationHookResult = ReturnType<
  typeof useReactivateUserAndResetPasswordMutation
>;
export type ReactivateUserAndResetPasswordMutationResult =
  Apollo.MutationResult<ReactivateUserAndResetPasswordMutation>;
export type ReactivateUserAndResetPasswordMutationOptions =
  Apollo.BaseMutationOptions<
    ReactivateUserAndResetPasswordMutation,
    ReactivateUserAndResetPasswordMutationVariables
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
export type ReactivateUserMutationResult =
  Apollo.MutationResult<ReactivateUserMutation>;
export type ReactivateUserMutationOptions = Apollo.BaseMutationOptions<
  ReactivateUserMutation,
  ReactivateUserMutationVariables
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
export type UpdateUserPrivilegesMutationResult =
  Apollo.MutationResult<UpdateUserPrivilegesMutation>;
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
export type ResetUserPasswordMutationResult =
  Apollo.MutationResult<ResetUserPasswordMutation>;
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
export type SetUserIsDeletedMutationResult =
  Apollo.MutationResult<SetUserIsDeletedMutation>;
export type SetUserIsDeletedMutationOptions = Apollo.BaseMutationOptions<
  SetUserIsDeletedMutation,
  SetUserIsDeletedMutationVariables
>;
export const AddUserToCurrentOrgDocument = gql`
  mutation AddUserToCurrentOrg(
    $firstName: String
    $lastName: String!
    $email: String!
    $role: Role!
    $accessAllFacilities: Boolean
    $facilities: [ID!]
  ) {
    addUserToCurrentOrg(
      userInput: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        role: $role
        accessAllFacilities: $accessAllFacilities
        facilities: $facilities
      }
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
 *      accessAllFacilities: // value for 'accessAllFacilities'
 *      facilities: // value for 'facilities'
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
export type AddUserToCurrentOrgMutationResult =
  Apollo.MutationResult<AddUserToCurrentOrgMutation>;
export type AddUserToCurrentOrgMutationOptions = Apollo.BaseMutationOptions<
  AddUserToCurrentOrgMutation,
  AddUserToCurrentOrgMutationVariables
>;
export const GetCurrentOrganizationDocument = gql`
  query GetCurrentOrganization {
    whoami {
      organization {
        name
        type
      }
    }
  }
`;

/**
 * __useGetCurrentOrganizationQuery__
 *
 * To run a query within a React component, call `useGetCurrentOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentOrganizationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentOrganizationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >(GetCurrentOrganizationDocument, options);
}
export function useGetCurrentOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >(GetCurrentOrganizationDocument, options);
}
export function useGetCurrentOrganizationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCurrentOrganizationQuery,
    GetCurrentOrganizationQueryVariables
  >(GetCurrentOrganizationDocument, options);
}
export type GetCurrentOrganizationQueryHookResult = ReturnType<
  typeof useGetCurrentOrganizationQuery
>;
export type GetCurrentOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetCurrentOrganizationLazyQuery
>;
export type GetCurrentOrganizationSuspenseQueryHookResult = ReturnType<
  typeof useGetCurrentOrganizationSuspenseQuery
>;
export type GetCurrentOrganizationQueryResult = Apollo.QueryResult<
  GetCurrentOrganizationQuery,
  GetCurrentOrganizationQueryVariables
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
export type AdminSetOrganizationMutationResult =
  Apollo.MutationResult<AdminSetOrganizationMutation>;
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
export type SetOrganizationMutationResult =
  Apollo.MutationResult<SetOrganizationMutation>;
export type SetOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SetOrganizationMutation,
  SetOrganizationMutationVariables
>;
export const GetTopLevelDashboardMetricsNewDocument = gql`
  query GetTopLevelDashboardMetricsNew(
    $facilityId: ID
    $startDate: DateTime
    $endDate: DateTime
    $disease: String
  ) {
    topLevelDashboardMetrics(
      facilityId: $facilityId
      startDate: $startDate
      endDate: $endDate
      disease: $disease
    ) {
      positiveTestCount
      totalTestCount
    }
  }
`;

/**
 * __useGetTopLevelDashboardMetricsNewQuery__
 *
 * To run a query within a React component, call `useGetTopLevelDashboardMetricsNewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopLevelDashboardMetricsNewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopLevelDashboardMetricsNewQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      disease: // value for 'disease'
 *   },
 * });
 */
export function useGetTopLevelDashboardMetricsNewQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >(GetTopLevelDashboardMetricsNewDocument, options);
}
export function useGetTopLevelDashboardMetricsNewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >(GetTopLevelDashboardMetricsNewDocument, options);
}
export function useGetTopLevelDashboardMetricsNewSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTopLevelDashboardMetricsNewQuery,
    GetTopLevelDashboardMetricsNewQueryVariables
  >(GetTopLevelDashboardMetricsNewDocument, options);
}
export type GetTopLevelDashboardMetricsNewQueryHookResult = ReturnType<
  typeof useGetTopLevelDashboardMetricsNewQuery
>;
export type GetTopLevelDashboardMetricsNewLazyQueryHookResult = ReturnType<
  typeof useGetTopLevelDashboardMetricsNewLazyQuery
>;
export type GetTopLevelDashboardMetricsNewSuspenseQueryHookResult = ReturnType<
  typeof useGetTopLevelDashboardMetricsNewSuspenseQuery
>;
export type GetTopLevelDashboardMetricsNewQueryResult = Apollo.QueryResult<
  GetTopLevelDashboardMetricsNewQuery,
  GetTopLevelDashboardMetricsNewQueryVariables
>;
export const PatientExistsDocument = gql`
  query PatientExists(
    $firstName: String!
    $lastName: String!
    $birthDate: LocalDate!
    $facilityId: ID
  ) {
    patientExistsWithoutZip(
      firstName: $firstName
      lastName: $lastName
      birthDate: $birthDate
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
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function usePatientExistsQuery(
  baseOptions: Apollo.QueryHookOptions<
    PatientExistsQuery,
    PatientExistsQueryVariables
  > &
    (
      | { variables: PatientExistsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function usePatientExistsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    PatientExistsQuery,
    PatientExistsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    PatientExistsQuery,
    PatientExistsQueryVariables
  >(PatientExistsDocument, options);
}
export type PatientExistsQueryHookResult = ReturnType<
  typeof usePatientExistsQuery
>;
export type PatientExistsLazyQueryHookResult = ReturnType<
  typeof usePatientExistsLazyQuery
>;
export type PatientExistsSuspenseQueryHookResult = ReturnType<
  typeof usePatientExistsSuspenseQuery
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
    $country: String!
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
    $emails: [String]
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
    $notes: String
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
      country: $country
      telephone: $telephone
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
      emails: $emails
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
      notes: $notes
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
 *      country: // value for 'country'
 *      telephone: // value for 'telephone'
 *      phoneNumbers: // value for 'phoneNumbers'
 *      role: // value for 'role'
 *      lookupId: // value for 'lookupId'
 *      emails: // value for 'emails'
 *      county: // value for 'county'
 *      race: // value for 'race'
 *      ethnicity: // value for 'ethnicity'
 *      tribalAffiliation: // value for 'tribalAffiliation'
 *      gender: // value for 'gender'
 *      residentCongregateSetting: // value for 'residentCongregateSetting'
 *      employedInHealthcare: // value for 'employedInHealthcare'
 *      preferredLanguage: // value for 'preferredLanguage'
 *      testResultDelivery: // value for 'testResultDelivery'
 *      notes: // value for 'notes'
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
export type AddPatientMutationResult =
  Apollo.MutationResult<AddPatientMutation>;
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
export type ArchivePersonMutationResult =
  Apollo.MutationResult<ArchivePersonMutation>;
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
      emails
      county
      country
      race
      ethnicity
      tribalAffiliation
      gender
      genderIdentity
      residentCongregateSetting
      employedInHealthcare
      preferredLanguage
      facility {
        id
      }
      testResultDelivery
      notes
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
  > &
    (
      | { variables: GetPatientDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetPatientDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientDetailsQuery,
    GetPatientDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetPatientDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetPatientDetailsSuspenseQuery
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
    $emails: [String]
    $county: String
    $country: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $genderIdentity: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
    $notes: String
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
      emails: $emails
      county: $county
      country: $country
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      genderIdentity: $genderIdentity
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
      notes: $notes
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
 *      emails: // value for 'emails'
 *      county: // value for 'county'
 *      country: // value for 'country'
 *      race: // value for 'race'
 *      ethnicity: // value for 'ethnicity'
 *      tribalAffiliation: // value for 'tribalAffiliation'
 *      gender: // value for 'gender'
 *      genderIdentity: // value for 'genderIdentity'
 *      residentCongregateSetting: // value for 'residentCongregateSetting'
 *      employedInHealthcare: // value for 'employedInHealthcare'
 *      preferredLanguage: // value for 'preferredLanguage'
 *      testResultDelivery: // value for 'testResultDelivery'
 *      notes: // value for 'notes'
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
export type UpdatePatientMutationResult =
  Apollo.MutationResult<UpdatePatientMutation>;
export type UpdatePatientMutationOptions = Apollo.BaseMutationOptions<
  UpdatePatientMutation,
  UpdatePatientMutationVariables
>;
export const GetPatientsCountByFacilityDocument = gql`
  query GetPatientsCountByFacility(
    $facilityId: ID!
    $archivedStatus: ArchivedStatus = UNARCHIVED
    $namePrefixMatch: String
  ) {
    patientsCount(
      facilityId: $facilityId
      archivedStatus: $archivedStatus
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
 *      archivedStatus: // value for 'archivedStatus'
 *      namePrefixMatch: // value for 'namePrefixMatch'
 *   },
 * });
 */
export function useGetPatientsCountByFacilityQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  > &
    (
      | { variables: GetPatientsCountByFacilityQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetPatientsCountByFacilitySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientsCountByFacilityQuery,
    GetPatientsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetPatientsCountByFacilitySuspenseQueryHookResult = ReturnType<
  typeof useGetPatientsCountByFacilitySuspenseQuery
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
    $archivedStatus: ArchivedStatus = UNARCHIVED
    $namePrefixMatch: String
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      archivedStatus: $archivedStatus
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
 *      archivedStatus: // value for 'archivedStatus'
 *      namePrefixMatch: // value for 'namePrefixMatch'
 *   },
 * });
 */
export function useGetPatientsByFacilityQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  > &
    (
      | { variables: GetPatientsByFacilityQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetPatientsByFacilitySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientsByFacilityQuery,
    GetPatientsByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetPatientsByFacilitySuspenseQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilitySuspenseQuery
>;
export type GetPatientsByFacilityQueryResult = Apollo.QueryResult<
  GetPatientsByFacilityQuery,
  GetPatientsByFacilityQueryVariables
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
      user: {
        name: {
          firstName: $firstName
          middleName: $middleName
          lastName: $lastName
          suffix: $suffix
        }
        email: $email
        organizationExternalId: $organizationExternalId
        role: $role
      }
    ) {
      id
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
export const CreateDeviceTypeDocument = gql`
  mutation createDeviceType(
    $name: String!
    $manufacturer: String!
    $model: String!
    $swabTypes: [ID!]!
    $supportedDiseaseTestPerformed: [SupportedDiseaseTestPerformedInput!]!
    $testLength: Int!
  ) {
    createDeviceType(
      input: {
        name: $name
        manufacturer: $manufacturer
        model: $model
        swabTypes: $swabTypes
        supportedDiseaseTestPerformed: $supportedDiseaseTestPerformed
        testLength: $testLength
      }
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
 *      swabTypes: // value for 'swabTypes'
 *      supportedDiseaseTestPerformed: // value for 'supportedDiseaseTestPerformed'
 *      testLength: // value for 'testLength'
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
export type CreateDeviceTypeMutationResult =
  Apollo.MutationResult<CreateDeviceTypeMutation>;
export type CreateDeviceTypeMutationOptions = Apollo.BaseMutationOptions<
  CreateDeviceTypeMutation,
  CreateDeviceTypeMutationVariables
>;
export const UpdateDeviceTypeDocument = gql`
  mutation updateDeviceType(
    $internalId: ID!
    $name: String!
    $manufacturer: String!
    $model: String!
    $swabTypes: [ID!]!
    $supportedDiseaseTestPerformed: [SupportedDiseaseTestPerformedInput!]!
    $testLength: Int!
  ) {
    updateDeviceType(
      input: {
        internalId: $internalId
        name: $name
        manufacturer: $manufacturer
        model: $model
        swabTypes: $swabTypes
        supportedDiseaseTestPerformed: $supportedDiseaseTestPerformed
        testLength: $testLength
      }
    ) {
      internalId
    }
  }
`;
export type UpdateDeviceTypeMutationFn = Apollo.MutationFunction<
  UpdateDeviceTypeMutation,
  UpdateDeviceTypeMutationVariables
>;

/**
 * __useUpdateDeviceTypeMutation__
 *
 * To run a mutation, you first call `useUpdateDeviceTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDeviceTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDeviceTypeMutation, { data, loading, error }] = useUpdateDeviceTypeMutation({
 *   variables: {
 *      internalId: // value for 'internalId'
 *      name: // value for 'name'
 *      manufacturer: // value for 'manufacturer'
 *      model: // value for 'model'
 *      swabTypes: // value for 'swabTypes'
 *      supportedDiseaseTestPerformed: // value for 'supportedDiseaseTestPerformed'
 *      testLength: // value for 'testLength'
 *   },
 * });
 */
export function useUpdateDeviceTypeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDeviceTypeMutation,
    UpdateDeviceTypeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateDeviceTypeMutation,
    UpdateDeviceTypeMutationVariables
  >(UpdateDeviceTypeDocument, options);
}
export type UpdateDeviceTypeMutationHookResult = ReturnType<
  typeof useUpdateDeviceTypeMutation
>;
export type UpdateDeviceTypeMutationResult =
  Apollo.MutationResult<UpdateDeviceTypeMutation>;
export type UpdateDeviceTypeMutationOptions = Apollo.BaseMutationOptions<
  UpdateDeviceTypeMutation,
  UpdateDeviceTypeMutationVariables
>;
export const GetDeviceTypeListDocument = gql`
  query getDeviceTypeList {
    deviceTypes {
      internalId
      name
      manufacturer
      model
      testLength
      swabTypes {
        internalId
        name
      }
      supportedDiseaseTestPerformed {
        supportedDisease {
          internalId
          name
        }
        testPerformedLoincCode
        testkitNameId
        equipmentUid
        equipmentUidType
        testOrderedLoincCode
        testOrderedLoincLongName
        testPerformedLoincLongName
      }
      testLength
    }
  }
`;

/**
 * __useGetDeviceTypeListQuery__
 *
 * To run a query within a React component, call `useGetDeviceTypeListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDeviceTypeListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDeviceTypeListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDeviceTypeListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >(GetDeviceTypeListDocument, options);
}
export function useGetDeviceTypeListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >(GetDeviceTypeListDocument, options);
}
export function useGetDeviceTypeListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDeviceTypeListQuery,
    GetDeviceTypeListQueryVariables
  >(GetDeviceTypeListDocument, options);
}
export type GetDeviceTypeListQueryHookResult = ReturnType<
  typeof useGetDeviceTypeListQuery
>;
export type GetDeviceTypeListLazyQueryHookResult = ReturnType<
  typeof useGetDeviceTypeListLazyQuery
>;
export type GetDeviceTypeListSuspenseQueryHookResult = ReturnType<
  typeof useGetDeviceTypeListSuspenseQuery
>;
export type GetDeviceTypeListQueryResult = Apollo.QueryResult<
  GetDeviceTypeListQuery,
  GetDeviceTypeListQueryVariables
>;
export const GetSpecimenTypesDocument = gql`
  query getSpecimenTypes {
    specimenTypes {
      internalId
      name
      typeCode
    }
  }
`;

/**
 * __useGetSpecimenTypesQuery__
 *
 * To run a query within a React component, call `useGetSpecimenTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSpecimenTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSpecimenTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSpecimenTypesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSpecimenTypesQuery,
    GetSpecimenTypesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetSpecimenTypesQuery, GetSpecimenTypesQueryVariables>(
    GetSpecimenTypesDocument,
    options
  );
}
export function useGetSpecimenTypesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSpecimenTypesQuery,
    GetSpecimenTypesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSpecimenTypesQuery,
    GetSpecimenTypesQueryVariables
  >(GetSpecimenTypesDocument, options);
}
export function useGetSpecimenTypesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSpecimenTypesQuery,
    GetSpecimenTypesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSpecimenTypesQuery,
    GetSpecimenTypesQueryVariables
  >(GetSpecimenTypesDocument, options);
}
export type GetSpecimenTypesQueryHookResult = ReturnType<
  typeof useGetSpecimenTypesQuery
>;
export type GetSpecimenTypesLazyQueryHookResult = ReturnType<
  typeof useGetSpecimenTypesLazyQuery
>;
export type GetSpecimenTypesSuspenseQueryHookResult = ReturnType<
  typeof useGetSpecimenTypesSuspenseQuery
>;
export type GetSpecimenTypesQueryResult = Apollo.QueryResult<
  GetSpecimenTypesQuery,
  GetSpecimenTypesQueryVariables
>;
export const GetSupportedDiseasesDocument = gql`
  query getSupportedDiseases {
    supportedDiseases {
      internalId
      name
    }
  }
`;

/**
 * __useGetSupportedDiseasesQuery__
 *
 * To run a query within a React component, call `useGetSupportedDiseasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupportedDiseasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupportedDiseasesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSupportedDiseasesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >(GetSupportedDiseasesDocument, options);
}
export function useGetSupportedDiseasesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >(GetSupportedDiseasesDocument, options);
}
export function useGetSupportedDiseasesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupportedDiseasesQuery,
    GetSupportedDiseasesQueryVariables
  >(GetSupportedDiseasesDocument, options);
}
export type GetSupportedDiseasesQueryHookResult = ReturnType<
  typeof useGetSupportedDiseasesQuery
>;
export type GetSupportedDiseasesLazyQueryHookResult = ReturnType<
  typeof useGetSupportedDiseasesLazyQuery
>;
export type GetSupportedDiseasesSuspenseQueryHookResult = ReturnType<
  typeof useGetSupportedDiseasesSuspenseQuery
>;
export type GetSupportedDiseasesQueryResult = Apollo.QueryResult<
  GetSupportedDiseasesQuery,
  GetSupportedDiseasesQueryVariables
>;
export const GetAllOrganizationsDocument = gql`
  query GetAllOrganizations {
    organizations(identityVerified: true) {
      id
      name
    }
  }
`;

/**
 * __useGetAllOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetAllOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllOrganizationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllOrganizationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >(GetAllOrganizationsDocument, options);
}
export function useGetAllOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >(GetAllOrganizationsDocument, options);
}
export function useGetAllOrganizationsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAllOrganizationsQuery,
    GetAllOrganizationsQueryVariables
  >(GetAllOrganizationsDocument, options);
}
export type GetAllOrganizationsQueryHookResult = ReturnType<
  typeof useGetAllOrganizationsQuery
>;
export type GetAllOrganizationsLazyQueryHookResult = ReturnType<
  typeof useGetAllOrganizationsLazyQuery
>;
export type GetAllOrganizationsSuspenseQueryHookResult = ReturnType<
  typeof useGetAllOrganizationsSuspenseQuery
>;
export type GetAllOrganizationsQueryResult = Apollo.QueryResult<
  GetAllOrganizationsQuery,
  GetAllOrganizationsQueryVariables
>;
export const GetFacilitiesByOrgIdDocument = gql`
  query GetFacilitiesByOrgId($orgId: ID!) {
    organization(id: $orgId) {
      id
      externalId
      name
      type
      facilities {
        name
        id
        city
        state
        zipCode
      }
    }
  }
`;

/**
 * __useGetFacilitiesByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetFacilitiesByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilitiesByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilitiesByOrgIdQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useGetFacilitiesByOrgIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  > &
    (
      | { variables: GetFacilitiesByOrgIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  >(GetFacilitiesByOrgIdDocument, options);
}
export function useGetFacilitiesByOrgIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  >(GetFacilitiesByOrgIdDocument, options);
}
export function useGetFacilitiesByOrgIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFacilitiesByOrgIdQuery,
    GetFacilitiesByOrgIdQueryVariables
  >(GetFacilitiesByOrgIdDocument, options);
}
export type GetFacilitiesByOrgIdQueryHookResult = ReturnType<
  typeof useGetFacilitiesByOrgIdQuery
>;
export type GetFacilitiesByOrgIdLazyQueryHookResult = ReturnType<
  typeof useGetFacilitiesByOrgIdLazyQuery
>;
export type GetFacilitiesByOrgIdSuspenseQueryHookResult = ReturnType<
  typeof useGetFacilitiesByOrgIdSuspenseQuery
>;
export type GetFacilitiesByOrgIdQueryResult = Apollo.QueryResult<
  GetFacilitiesByOrgIdQuery,
  GetFacilitiesByOrgIdQueryVariables
>;
export const GetFacilityStatsDocument = gql`
  query GetFacilityStats($facilityId: ID!) {
    facilityStats(facilityId: $facilityId) {
      usersSingleAccessCount
      patientsSingleAccessCount
    }
  }
`;

/**
 * __useGetFacilityStatsQuery__
 *
 * To run a query within a React component, call `useGetFacilityStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityStatsQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function useGetFacilityStatsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFacilityStatsQuery,
    GetFacilityStatsQueryVariables
  > &
    (
      | { variables: GetFacilityStatsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFacilityStatsQuery, GetFacilityStatsQueryVariables>(
    GetFacilityStatsDocument,
    options
  );
}
export function useGetFacilityStatsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityStatsQuery,
    GetFacilityStatsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityStatsQuery,
    GetFacilityStatsQueryVariables
  >(GetFacilityStatsDocument, options);
}
export function useGetFacilityStatsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacilityStatsQuery,
    GetFacilityStatsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFacilityStatsQuery,
    GetFacilityStatsQueryVariables
  >(GetFacilityStatsDocument, options);
}
export type GetFacilityStatsQueryHookResult = ReturnType<
  typeof useGetFacilityStatsQuery
>;
export type GetFacilityStatsLazyQueryHookResult = ReturnType<
  typeof useGetFacilityStatsLazyQuery
>;
export type GetFacilityStatsSuspenseQueryHookResult = ReturnType<
  typeof useGetFacilityStatsSuspenseQuery
>;
export type GetFacilityStatsQueryResult = Apollo.QueryResult<
  GetFacilityStatsQuery,
  GetFacilityStatsQueryVariables
>;
export const DeleteFacilityDocument = gql`
  mutation DeleteFacility($facilityId: ID!) {
    markFacilityAsDeleted(facilityId: $facilityId, deleted: true)
  }
`;
export type DeleteFacilityMutationFn = Apollo.MutationFunction<
  DeleteFacilityMutation,
  DeleteFacilityMutationVariables
>;

/**
 * __useDeleteFacilityMutation__
 *
 * To run a mutation, you first call `useDeleteFacilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFacilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFacilityMutation, { data, loading, error }] = useDeleteFacilityMutation({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function useDeleteFacilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFacilityMutation,
    DeleteFacilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFacilityMutation,
    DeleteFacilityMutationVariables
  >(DeleteFacilityDocument, options);
}
export type DeleteFacilityMutationHookResult = ReturnType<
  typeof useDeleteFacilityMutation
>;
export type DeleteFacilityMutationResult =
  Apollo.MutationResult<DeleteFacilityMutation>;
export type DeleteFacilityMutationOptions = Apollo.BaseMutationOptions<
  DeleteFacilityMutation,
  DeleteFacilityMutationVariables
>;
export const FindUserByEmailDocument = gql`
  query findUserByEmail($email: String!) {
    user(email: $email) {
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
        id
        testingFacility {
          id
          name
        }
      }
      isDeleted
      status
    }
  }
`;

/**
 * __useFindUserByEmailQuery__
 *
 * To run a query within a React component, call `useFindUserByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUserByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindUserByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useFindUserByEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    FindUserByEmailQuery,
    FindUserByEmailQueryVariables
  > &
    (
      | { variables: FindUserByEmailQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FindUserByEmailQuery, FindUserByEmailQueryVariables>(
    FindUserByEmailDocument,
    options
  );
}
export function useFindUserByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FindUserByEmailQuery,
    FindUserByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FindUserByEmailQuery,
    FindUserByEmailQueryVariables
  >(FindUserByEmailDocument, options);
}
export function useFindUserByEmailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    FindUserByEmailQuery,
    FindUserByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    FindUserByEmailQuery,
    FindUserByEmailQueryVariables
  >(FindUserByEmailDocument, options);
}
export type FindUserByEmailQueryHookResult = ReturnType<
  typeof useFindUserByEmailQuery
>;
export type FindUserByEmailLazyQueryHookResult = ReturnType<
  typeof useFindUserByEmailLazyQuery
>;
export type FindUserByEmailSuspenseQueryHookResult = ReturnType<
  typeof useFindUserByEmailSuspenseQuery
>;
export type FindUserByEmailQueryResult = Apollo.QueryResult<
  FindUserByEmailQuery,
  FindUserByEmailQueryVariables
>;
export const UndeleteUserDocument = gql`
  mutation undeleteUser($userId: ID!) {
    setUserIsDeleted(id: $userId, deleted: false) {
      id
      email
      isDeleted
    }
  }
`;
export type UndeleteUserMutationFn = Apollo.MutationFunction<
  UndeleteUserMutation,
  UndeleteUserMutationVariables
>;

/**
 * __useUndeleteUserMutation__
 *
 * To run a mutation, you first call `useUndeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUndeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [undeleteUserMutation, { data, loading, error }] = useUndeleteUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUndeleteUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UndeleteUserMutation,
    UndeleteUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UndeleteUserMutation,
    UndeleteUserMutationVariables
  >(UndeleteUserDocument, options);
}
export type UndeleteUserMutationHookResult = ReturnType<
  typeof useUndeleteUserMutation
>;
export type UndeleteUserMutationResult =
  Apollo.MutationResult<UndeleteUserMutation>;
export type UndeleteUserMutationOptions = Apollo.BaseMutationOptions<
  UndeleteUserMutation,
  UndeleteUserMutationVariables
>;
export const UpdateUserPrivilegesAndGroupAccessDocument = gql`
  mutation updateUserPrivilegesAndGroupAccess(
    $username: String!
    $orgExternalId: String!
    $accessAllFacilities: Boolean!
    $role: Role!
    $facilities: [ID]
  ) {
    updateUserPrivilegesAndGroupAccess(
      username: $username
      orgExternalId: $orgExternalId
      accessAllFacilities: $accessAllFacilities
      facilities: $facilities
      role: $role
    ) {
      id
    }
  }
`;
export type UpdateUserPrivilegesAndGroupAccessMutationFn =
  Apollo.MutationFunction<
    UpdateUserPrivilegesAndGroupAccessMutation,
    UpdateUserPrivilegesAndGroupAccessMutationVariables
  >;

/**
 * __useUpdateUserPrivilegesAndGroupAccessMutation__
 *
 * To run a mutation, you first call `useUpdateUserPrivilegesAndGroupAccessMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPrivilegesAndGroupAccessMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPrivilegesAndGroupAccessMutation, { data, loading, error }] = useUpdateUserPrivilegesAndGroupAccessMutation({
 *   variables: {
 *      username: // value for 'username'
 *      orgExternalId: // value for 'orgExternalId'
 *      accessAllFacilities: // value for 'accessAllFacilities'
 *      role: // value for 'role'
 *      facilities: // value for 'facilities'
 *   },
 * });
 */
export function useUpdateUserPrivilegesAndGroupAccessMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserPrivilegesAndGroupAccessMutation,
    UpdateUserPrivilegesAndGroupAccessMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserPrivilegesAndGroupAccessMutation,
    UpdateUserPrivilegesAndGroupAccessMutationVariables
  >(UpdateUserPrivilegesAndGroupAccessDocument, options);
}
export type UpdateUserPrivilegesAndGroupAccessMutationHookResult = ReturnType<
  typeof useUpdateUserPrivilegesAndGroupAccessMutation
>;
export type UpdateUserPrivilegesAndGroupAccessMutationResult =
  Apollo.MutationResult<UpdateUserPrivilegesAndGroupAccessMutation>;
export type UpdateUserPrivilegesAndGroupAccessMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserPrivilegesAndGroupAccessMutation,
    UpdateUserPrivilegesAndGroupAccessMutationVariables
  >;
export const GetTestResultCountByOrgDocument = gql`
  query getTestResultCountByOrg($orgId: ID!) {
    testResultsCount(orgId: $orgId)
  }
`;

/**
 * __useGetTestResultCountByOrgQuery__
 *
 * To run a query within a React component, call `useGetTestResultCountByOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultCountByOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultCountByOrgQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useGetTestResultCountByOrgQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  > &
    (
      | { variables: GetTestResultCountByOrgQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  >(GetTestResultCountByOrgDocument, options);
}
export function useGetTestResultCountByOrgLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  >(GetTestResultCountByOrgDocument, options);
}
export function useGetTestResultCountByOrgSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTestResultCountByOrgQuery,
    GetTestResultCountByOrgQueryVariables
  >(GetTestResultCountByOrgDocument, options);
}
export type GetTestResultCountByOrgQueryHookResult = ReturnType<
  typeof useGetTestResultCountByOrgQuery
>;
export type GetTestResultCountByOrgLazyQueryHookResult = ReturnType<
  typeof useGetTestResultCountByOrgLazyQuery
>;
export type GetTestResultCountByOrgSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultCountByOrgSuspenseQuery
>;
export type GetTestResultCountByOrgQueryResult = Apollo.QueryResult<
  GetTestResultCountByOrgQuery,
  GetTestResultCountByOrgQueryVariables
>;
export const GetPendingOrganizationsDocument = gql`
  query GetPendingOrganizations {
    pendingOrganizations {
      externalId
      name
      adminFirstName
      adminLastName
      adminEmail
      adminPhone
      createdAt
    }
  }
`;

/**
 * __useGetPendingOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetPendingOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPendingOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPendingOrganizationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPendingOrganizationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >(GetPendingOrganizationsDocument, options);
}
export function useGetPendingOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >(GetPendingOrganizationsDocument, options);
}
export function useGetPendingOrganizationsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPendingOrganizationsQuery,
    GetPendingOrganizationsQueryVariables
  >(GetPendingOrganizationsDocument, options);
}
export type GetPendingOrganizationsQueryHookResult = ReturnType<
  typeof useGetPendingOrganizationsQuery
>;
export type GetPendingOrganizationsLazyQueryHookResult = ReturnType<
  typeof useGetPendingOrganizationsLazyQuery
>;
export type GetPendingOrganizationsSuspenseQueryHookResult = ReturnType<
  typeof useGetPendingOrganizationsSuspenseQuery
>;
export type GetPendingOrganizationsQueryResult = Apollo.QueryResult<
  GetPendingOrganizationsQuery,
  GetPendingOrganizationsQueryVariables
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
export type SetOrgIdentityVerifiedMutationResult =
  Apollo.MutationResult<SetOrgIdentityVerifiedMutation>;
export type SetOrgIdentityVerifiedMutationOptions = Apollo.BaseMutationOptions<
  SetOrgIdentityVerifiedMutation,
  SetOrgIdentityVerifiedMutationVariables
>;
export const MarkPendingOrganizationAsDeletedDocument = gql`
  mutation MarkPendingOrganizationAsDeleted(
    $orgExternalId: String!
    $deleted: Boolean!
  ) {
    markPendingOrganizationAsDeleted(
      orgExternalId: $orgExternalId
      deleted: $deleted
    )
  }
`;
export type MarkPendingOrganizationAsDeletedMutationFn =
  Apollo.MutationFunction<
    MarkPendingOrganizationAsDeletedMutation,
    MarkPendingOrganizationAsDeletedMutationVariables
  >;

/**
 * __useMarkPendingOrganizationAsDeletedMutation__
 *
 * To run a mutation, you first call `useMarkPendingOrganizationAsDeletedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkPendingOrganizationAsDeletedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markPendingOrganizationAsDeletedMutation, { data, loading, error }] = useMarkPendingOrganizationAsDeletedMutation({
 *   variables: {
 *      orgExternalId: // value for 'orgExternalId'
 *      deleted: // value for 'deleted'
 *   },
 * });
 */
export function useMarkPendingOrganizationAsDeletedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkPendingOrganizationAsDeletedMutation,
    MarkPendingOrganizationAsDeletedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkPendingOrganizationAsDeletedMutation,
    MarkPendingOrganizationAsDeletedMutationVariables
  >(MarkPendingOrganizationAsDeletedDocument, options);
}
export type MarkPendingOrganizationAsDeletedMutationHookResult = ReturnType<
  typeof useMarkPendingOrganizationAsDeletedMutation
>;
export type MarkPendingOrganizationAsDeletedMutationResult =
  Apollo.MutationResult<MarkPendingOrganizationAsDeletedMutation>;
export type MarkPendingOrganizationAsDeletedMutationOptions =
  Apollo.BaseMutationOptions<
    MarkPendingOrganizationAsDeletedMutation,
    MarkPendingOrganizationAsDeletedMutationVariables
  >;
export const EditPendingOrganizationDocument = gql`
  mutation EditPendingOrganization(
    $externalId: String!
    $name: String
    $adminFirstName: String
    $adminLastName: String
    $adminEmail: String
    $adminPhone: String
  ) {
    editPendingOrganization(
      orgExternalId: $externalId
      name: $name
      adminFirstName: $adminFirstName
      adminLastName: $adminLastName
      adminEmail: $adminEmail
      adminPhone: $adminPhone
    )
  }
`;
export type EditPendingOrganizationMutationFn = Apollo.MutationFunction<
  EditPendingOrganizationMutation,
  EditPendingOrganizationMutationVariables
>;

/**
 * __useEditPendingOrganizationMutation__
 *
 * To run a mutation, you first call `useEditPendingOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditPendingOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editPendingOrganizationMutation, { data, loading, error }] = useEditPendingOrganizationMutation({
 *   variables: {
 *      externalId: // value for 'externalId'
 *      name: // value for 'name'
 *      adminFirstName: // value for 'adminFirstName'
 *      adminLastName: // value for 'adminLastName'
 *      adminEmail: // value for 'adminEmail'
 *      adminPhone: // value for 'adminPhone'
 *   },
 * });
 */
export function useEditPendingOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditPendingOrganizationMutation,
    EditPendingOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditPendingOrganizationMutation,
    EditPendingOrganizationMutationVariables
  >(EditPendingOrganizationDocument, options);
}
export type EditPendingOrganizationMutationHookResult = ReturnType<
  typeof useEditPendingOrganizationMutation
>;
export type EditPendingOrganizationMutationResult =
  Apollo.MutationResult<EditPendingOrganizationMutation>;
export type EditPendingOrganizationMutationOptions = Apollo.BaseMutationOptions<
  EditPendingOrganizationMutation,
  EditPendingOrganizationMutationVariables
>;
export const GetOrganizationsDocument = gql`
  query GetOrganizations($identityVerified: Boolean) {
    organizations(identityVerified: $identityVerified) {
      internalId
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
export function useGetOrganizationsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationsQuery,
    GetOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetOrganizationsSuspenseQueryHookResult = ReturnType<
  typeof useGetOrganizationsSuspenseQuery
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
export type SetCurrentUserTenantDataAccessOpMutationFn =
  Apollo.MutationFunction<
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
export type SetCurrentUserTenantDataAccessOpMutationResult =
  Apollo.MutationResult<SetCurrentUserTenantDataAccessOpMutation>;
export type SetCurrentUserTenantDataAccessOpMutationOptions =
  Apollo.BaseMutationOptions<
    SetCurrentUserTenantDataAccessOpMutation,
    SetCurrentUserTenantDataAccessOpMutationVariables
  >;
export const GetOrganizationWithFacilitiesDocument = gql`
  query GetOrganizationWithFacilities($id: ID!) {
    organization(id: $id) {
      externalId
      name
      facilities {
        id
        name
      }
    }
  }
`;

/**
 * __useGetOrganizationWithFacilitiesQuery__
 *
 * To run a query within a React component, call `useGetOrganizationWithFacilitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationWithFacilitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationWithFacilitiesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrganizationWithFacilitiesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  > &
    (
      | {
          variables: GetOrganizationWithFacilitiesQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  >(GetOrganizationWithFacilitiesDocument, options);
}
export function useGetOrganizationWithFacilitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  >(GetOrganizationWithFacilitiesDocument, options);
}
export function useGetOrganizationWithFacilitiesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationWithFacilitiesQuery,
    GetOrganizationWithFacilitiesQueryVariables
  >(GetOrganizationWithFacilitiesDocument, options);
}
export type GetOrganizationWithFacilitiesQueryHookResult = ReturnType<
  typeof useGetOrganizationWithFacilitiesQuery
>;
export type GetOrganizationWithFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationWithFacilitiesLazyQuery
>;
export type GetOrganizationWithFacilitiesSuspenseQueryHookResult = ReturnType<
  typeof useGetOrganizationWithFacilitiesSuspenseQuery
>;
export type GetOrganizationWithFacilitiesQueryResult = Apollo.QueryResult<
  GetOrganizationWithFacilitiesQuery,
  GetOrganizationWithFacilitiesQueryVariables
>;
export const GetPatientsByFacilityWithOrgDocument = gql`
  query GetPatientsByFacilityWithOrg(
    $facilityId: ID!
    $pageNumber: Int!
    $pageSize: Int!
    $archivedStatus: ArchivedStatus = UNARCHIVED
    $orgExternalId: String!
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      archivedStatus: $archivedStatus
      orgExternalId: $orgExternalId
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      isDeleted
      facility {
        id
        name
      }
    }
  }
`;

/**
 * __useGetPatientsByFacilityWithOrgQuery__
 *
 * To run a query within a React component, call `useGetPatientsByFacilityWithOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsByFacilityWithOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsByFacilityWithOrgQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *      archivedStatus: // value for 'archivedStatus'
 *      orgExternalId: // value for 'orgExternalId'
 *   },
 * });
 */
export function useGetPatientsByFacilityWithOrgQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  > &
    (
      | {
          variables: GetPatientsByFacilityWithOrgQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  >(GetPatientsByFacilityWithOrgDocument, options);
}
export function useGetPatientsByFacilityWithOrgLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  >(GetPatientsByFacilityWithOrgDocument, options);
}
export function useGetPatientsByFacilityWithOrgSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPatientsByFacilityWithOrgQuery,
    GetPatientsByFacilityWithOrgQueryVariables
  >(GetPatientsByFacilityWithOrgDocument, options);
}
export type GetPatientsByFacilityWithOrgQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityWithOrgQuery
>;
export type GetPatientsByFacilityWithOrgLazyQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityWithOrgLazyQuery
>;
export type GetPatientsByFacilityWithOrgSuspenseQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityWithOrgSuspenseQuery
>;
export type GetPatientsByFacilityWithOrgQueryResult = Apollo.QueryResult<
  GetPatientsByFacilityWithOrgQuery,
  GetPatientsByFacilityWithOrgQueryVariables
>;
export const GetPatientsCountByFacilityWithOrgDocument = gql`
  query GetPatientsCountByFacilityWithOrg(
    $facilityId: ID!
    $archivedStatus: ArchivedStatus = UNARCHIVED
    $orgExternalId: String!
  ) {
    patientsCount(
      facilityId: $facilityId
      archivedStatus: $archivedStatus
      orgExternalId: $orgExternalId
    )
  }
`;

/**
 * __useGetPatientsCountByFacilityWithOrgQuery__
 *
 * To run a query within a React component, call `useGetPatientsCountByFacilityWithOrgQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsCountByFacilityWithOrgQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsCountByFacilityWithOrgQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      archivedStatus: // value for 'archivedStatus'
 *      orgExternalId: // value for 'orgExternalId'
 *   },
 * });
 */
export function useGetPatientsCountByFacilityWithOrgQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  > &
    (
      | {
          variables: GetPatientsCountByFacilityWithOrgQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  >(GetPatientsCountByFacilityWithOrgDocument, options);
}
export function useGetPatientsCountByFacilityWithOrgLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  >(GetPatientsCountByFacilityWithOrgDocument, options);
}
export function useGetPatientsCountByFacilityWithOrgSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPatientsCountByFacilityWithOrgQuery,
    GetPatientsCountByFacilityWithOrgQueryVariables
  >(GetPatientsCountByFacilityWithOrgDocument, options);
}
export type GetPatientsCountByFacilityWithOrgQueryHookResult = ReturnType<
  typeof useGetPatientsCountByFacilityWithOrgQuery
>;
export type GetPatientsCountByFacilityWithOrgLazyQueryHookResult = ReturnType<
  typeof useGetPatientsCountByFacilityWithOrgLazyQuery
>;
export type GetPatientsCountByFacilityWithOrgSuspenseQueryHookResult =
  ReturnType<typeof useGetPatientsCountByFacilityWithOrgSuspenseQuery>;
export type GetPatientsCountByFacilityWithOrgQueryResult = Apollo.QueryResult<
  GetPatientsCountByFacilityWithOrgQuery,
  GetPatientsCountByFacilityWithOrgQueryVariables
>;
export const UnarchivePatientDocument = gql`
  mutation UnarchivePatient($id: ID!, $orgExternalId: String!) {
    setPatientIsDeleted(
      id: $id
      deleted: false
      orgExternalId: $orgExternalId
    ) {
      internalId
    }
  }
`;
export type UnarchivePatientMutationFn = Apollo.MutationFunction<
  UnarchivePatientMutation,
  UnarchivePatientMutationVariables
>;

/**
 * __useUnarchivePatientMutation__
 *
 * To run a mutation, you first call `useUnarchivePatientMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnarchivePatientMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unarchivePatientMutation, { data, loading, error }] = useUnarchivePatientMutation({
 *   variables: {
 *      id: // value for 'id'
 *      orgExternalId: // value for 'orgExternalId'
 *   },
 * });
 */
export function useUnarchivePatientMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UnarchivePatientMutation,
    UnarchivePatientMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UnarchivePatientMutation,
    UnarchivePatientMutationVariables
  >(UnarchivePatientDocument, options);
}
export type UnarchivePatientMutationHookResult = ReturnType<
  typeof useUnarchivePatientMutation
>;
export type UnarchivePatientMutationResult =
  Apollo.MutationResult<UnarchivePatientMutation>;
export type UnarchivePatientMutationOptions = Apollo.BaseMutationOptions<
  UnarchivePatientMutation,
  UnarchivePatientMutationVariables
>;
export const SendSupportEscalationDocument = gql`
  mutation SendSupportEscalation {
    sendSupportEscalation
  }
`;
export type SendSupportEscalationMutationFn = Apollo.MutationFunction<
  SendSupportEscalationMutation,
  SendSupportEscalationMutationVariables
>;

/**
 * __useSendSupportEscalationMutation__
 *
 * To run a mutation, you first call `useSendSupportEscalationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendSupportEscalationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendSupportEscalationMutation, { data, loading, error }] = useSendSupportEscalationMutation({
 *   variables: {
 *   },
 * });
 */
export function useSendSupportEscalationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SendSupportEscalationMutation,
    SendSupportEscalationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SendSupportEscalationMutation,
    SendSupportEscalationMutationVariables
  >(SendSupportEscalationDocument, options);
}
export type SendSupportEscalationMutationHookResult = ReturnType<
  typeof useSendSupportEscalationMutation
>;
export type SendSupportEscalationMutationResult =
  Apollo.MutationResult<SendSupportEscalationMutation>;
export type SendSupportEscalationMutationOptions = Apollo.BaseMutationOptions<
  SendSupportEscalationMutation,
  SendSupportEscalationMutationVariables
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
      emails
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
  > &
    (
      | { variables: GetPatientQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetPatientSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientQuery,
    GetPatientQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPatientQuery, GetPatientQueryVariables>(
    GetPatientDocument,
    options
  );
}
export type GetPatientQueryHookResult = ReturnType<typeof useGetPatientQuery>;
export type GetPatientLazyQueryHookResult = ReturnType<
  typeof useGetPatientLazyQuery
>;
export type GetPatientSuspenseQueryHookResult = ReturnType<
  typeof useGetPatientSuspenseQuery
>;
export type GetPatientQueryResult = Apollo.QueryResult<
  GetPatientQuery,
  GetPatientQueryVariables
>;
export const GetPatientsByFacilityForQueueDocument = gql`
  query GetPatientsByFacilityForQueue(
    $facilityId: ID
    $namePrefixMatch: String
    $archivedStatus: ArchivedStatus = UNARCHIVED
    $includeArchivedFacilities: Boolean
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: 0
      pageSize: 100
      archivedStatus: $archivedStatus
      namePrefixMatch: $namePrefixMatch
      includeArchivedFacilities: $includeArchivedFacilities
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      email
      emails
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
 *      archivedStatus: // value for 'archivedStatus'
 *      includeArchivedFacilities: // value for 'includeArchivedFacilities'
 *   },
 * });
 */
export function useGetPatientsByFacilityForQueueQuery(
  baseOptions?: Apollo.QueryHookOptions<
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
export function useGetPatientsByFacilityForQueueSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPatientsByFacilityForQueueQuery,
    GetPatientsByFacilityForQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetPatientsByFacilityForQueueSuspenseQueryHookResult = ReturnType<
  typeof useGetPatientsByFacilityForQueueSuspenseQuery
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
    $syphilisHistory: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
      pregnancy: $pregnancy
      syphilisHistory: $syphilisHistory
      noSymptoms: $noSymptoms
      symptoms: $symptoms
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
 *      syphilisHistory: // value for 'syphilisHistory'
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
export type AddPatientToQueueMutationResult =
  Apollo.MutationResult<AddPatientToQueueMutation>;
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
    $syphilisHistory: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
    $genderOfSexualPartners: [String]
  ) {
    updateAoeQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      syphilisHistory: $syphilisHistory
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
      genderOfSexualPartners: $genderOfSexualPartners
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
 *      syphilisHistory: // value for 'syphilisHistory'
 *      noSymptoms: // value for 'noSymptoms'
 *      testResultDelivery: // value for 'testResultDelivery'
 *      genderOfSexualPartners: // value for 'genderOfSexualPartners'
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
export type RemovePatientFromQueueMutationResult =
  Apollo.MutationResult<RemovePatientFromQueueMutation>;
export type RemovePatientFromQueueMutationOptions = Apollo.BaseMutationOptions<
  RemovePatientFromQueueMutation,
  RemovePatientFromQueueMutationVariables
>;
export const EditQueueItemDocument = gql`
  mutation EditQueueItem(
    $id: ID!
    $deviceTypeId: ID
    $specimenTypeId: ID
    $results: [MultiplexResultInput]
    $dateTested: DateTime
  ) {
    editQueueItem(
      id: $id
      deviceTypeId: $deviceTypeId
      specimenTypeId: $specimenTypeId
      results: $results
      dateTested: $dateTested
    ) {
      results {
        disease {
          name
        }
        testResult
      }
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
 *      deviceTypeId: // value for 'deviceTypeId'
 *      specimenTypeId: // value for 'specimenTypeId'
 *      results: // value for 'results'
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
export type EditQueueItemMutationResult =
  Apollo.MutationResult<EditQueueItemMutation>;
export type EditQueueItemMutationOptions = Apollo.BaseMutationOptions<
  EditQueueItemMutation,
  EditQueueItemMutationVariables
>;
export const SubmitQueueItemDocument = gql`
  mutation SubmitQueueItem(
    $patientId: ID!
    $deviceTypeId: ID!
    $specimenTypeId: ID!
    $results: [MultiplexResultInput]!
    $dateTested: DateTime
  ) {
    submitQueueItem(
      patientId: $patientId
      deviceTypeId: $deviceTypeId
      specimenTypeId: $specimenTypeId
      results: $results
      dateTested: $dateTested
    ) {
      testResult {
        internalId
      }
      deliverySuccess
      testEventId
    }
  }
`;
export type SubmitQueueItemMutationFn = Apollo.MutationFunction<
  SubmitQueueItemMutation,
  SubmitQueueItemMutationVariables
>;

/**
 * __useSubmitQueueItemMutation__
 *
 * To run a mutation, you first call `useSubmitQueueItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitQueueItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitQueueItemMutation, { data, loading, error }] = useSubmitQueueItemMutation({
 *   variables: {
 *      patientId: // value for 'patientId'
 *      deviceTypeId: // value for 'deviceTypeId'
 *      specimenTypeId: // value for 'specimenTypeId'
 *      results: // value for 'results'
 *      dateTested: // value for 'dateTested'
 *   },
 * });
 */
export function useSubmitQueueItemMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SubmitQueueItemMutation,
    SubmitQueueItemMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SubmitQueueItemMutation,
    SubmitQueueItemMutationVariables
  >(SubmitQueueItemDocument, options);
}
export type SubmitQueueItemMutationHookResult = ReturnType<
  typeof useSubmitQueueItemMutation
>;
export type SubmitQueueItemMutationResult =
  Apollo.MutationResult<SubmitQueueItemMutation>;
export type SubmitQueueItemMutationOptions = Apollo.BaseMutationOptions<
  SubmitQueueItemMutation,
  SubmitQueueItemMutationVariables
>;
export const GetFacilityQueueDocument = gql`
  query GetFacilityQueue($facilityId: ID!) {
    queue(facilityId: $facilityId) {
      internalId
      pregnancy
      syphilisHistory
      dateAdded
      symptoms
      symptomOnset
      noSymptoms
      genderOfSexualPartners
      deviceType {
        internalId
        name
        model
        testLength
      }
      specimenType {
        internalId
        name
        typeCode
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
        email
        emails
        phoneNumbers {
          type
          number
        }
      }
      results {
        disease {
          name
        }
        testResult
      }
      dateTested
      correctionStatus
      reasonForCorrection
      timerStartedAt
    }
    facility(id: $facilityId) {
      name
      id
      deviceTypes {
        internalId
        name
        testLength
        supportedDiseaseTestPerformed {
          testPerformedLoincCode
          testOrderedLoincCode
          supportedDisease {
            internalId
            name
            loinc
          }
        }
        swabTypes {
          internalId
          name
          typeCode
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
  > &
    (
      | { variables: GetFacilityQueueQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetFacilityQueueSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacilityQueueQuery,
    GetFacilityQueueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetFacilityQueueSuspenseQueryHookResult = ReturnType<
  typeof useGetFacilityQueueSuspenseQuery
>;
export type GetFacilityQueueQueryResult = Apollo.QueryResult<
  GetFacilityQueueQuery,
  GetFacilityQueueQueryVariables
>;
export const UpdateTestOrderTimerStartedAtDocument = gql`
  mutation UpdateTestOrderTimerStartedAt(
    $testOrderId: ID!
    $startedAt: String
  ) {
    updateTestOrderTimerStartedAt(
      testOrderId: $testOrderId
      startedAt: $startedAt
    )
  }
`;
export type UpdateTestOrderTimerStartedAtMutationFn = Apollo.MutationFunction<
  UpdateTestOrderTimerStartedAtMutation,
  UpdateTestOrderTimerStartedAtMutationVariables
>;

/**
 * __useUpdateTestOrderTimerStartedAtMutation__
 *
 * To run a mutation, you first call `useUpdateTestOrderTimerStartedAtMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTestOrderTimerStartedAtMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTestOrderTimerStartedAtMutation, { data, loading, error }] = useUpdateTestOrderTimerStartedAtMutation({
 *   variables: {
 *      testOrderId: // value for 'testOrderId'
 *      startedAt: // value for 'startedAt'
 *   },
 * });
 */
export function useUpdateTestOrderTimerStartedAtMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTestOrderTimerStartedAtMutation,
    UpdateTestOrderTimerStartedAtMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTestOrderTimerStartedAtMutation,
    UpdateTestOrderTimerStartedAtMutationVariables
  >(UpdateTestOrderTimerStartedAtDocument, options);
}
export type UpdateTestOrderTimerStartedAtMutationHookResult = ReturnType<
  typeof useUpdateTestOrderTimerStartedAtMutation
>;
export type UpdateTestOrderTimerStartedAtMutationResult =
  Apollo.MutationResult<UpdateTestOrderTimerStartedAtMutation>;
export type UpdateTestOrderTimerStartedAtMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTestOrderTimerStartedAtMutation,
    UpdateTestOrderTimerStartedAtMutationVariables
  >;
export const GetTestResultForResendingEmailsDocument = gql`
  query getTestResultForResendingEmails($id: ID!) {
    testResult(id: $id) {
      dateTested
      patient {
        firstName
        middleName
        lastName
        email
        emails
      }
    }
  }
`;

/**
 * __useGetTestResultForResendingEmailsQuery__
 *
 * To run a query within a React component, call `useGetTestResultForResendingEmailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultForResendingEmailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultForResendingEmailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestResultForResendingEmailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  > &
    (
      | {
          variables: GetTestResultForResendingEmailsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  >(GetTestResultForResendingEmailsDocument, options);
}
export function useGetTestResultForResendingEmailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  >(GetTestResultForResendingEmailsDocument, options);
}
export function useGetTestResultForResendingEmailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTestResultForResendingEmailsQuery,
    GetTestResultForResendingEmailsQueryVariables
  >(GetTestResultForResendingEmailsDocument, options);
}
export type GetTestResultForResendingEmailsQueryHookResult = ReturnType<
  typeof useGetTestResultForResendingEmailsQuery
>;
export type GetTestResultForResendingEmailsLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForResendingEmailsLazyQuery
>;
export type GetTestResultForResendingEmailsSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultForResendingEmailsSuspenseQuery
>;
export type GetTestResultForResendingEmailsQueryResult = Apollo.QueryResult<
  GetTestResultForResendingEmailsQuery,
  GetTestResultForResendingEmailsQueryVariables
>;
export const ResendTestResultsEmailDocument = gql`
  mutation resendTestResultsEmail($testEventId: ID!) {
    sendPatientLinkEmailByTestEventId(testEventId: $testEventId)
  }
`;
export type ResendTestResultsEmailMutationFn = Apollo.MutationFunction<
  ResendTestResultsEmailMutation,
  ResendTestResultsEmailMutationVariables
>;

/**
 * __useResendTestResultsEmailMutation__
 *
 * To run a mutation, you first call `useResendTestResultsEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendTestResultsEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendTestResultsEmailMutation, { data, loading, error }] = useResendTestResultsEmailMutation({
 *   variables: {
 *      testEventId: // value for 'testEventId'
 *   },
 * });
 */
export function useResendTestResultsEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResendTestResultsEmailMutation,
    ResendTestResultsEmailMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResendTestResultsEmailMutation,
    ResendTestResultsEmailMutationVariables
  >(ResendTestResultsEmailDocument, options);
}
export type ResendTestResultsEmailMutationHookResult = ReturnType<
  typeof useResendTestResultsEmailMutation
>;
export type ResendTestResultsEmailMutationResult =
  Apollo.MutationResult<ResendTestResultsEmailMutation>;
export type ResendTestResultsEmailMutationOptions = Apollo.BaseMutationOptions<
  ResendTestResultsEmailMutation,
  ResendTestResultsEmailMutationVariables
>;
export const GetFacilityResultsForCsvWithCountDocument = gql`
  query GetFacilityResultsForCsvWithCount(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $disease: String
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    testResultsPage(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      disease: $disease
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      content {
        facility {
          name
          isDeleted
        }
        dateTested
        dateUpdated
        results {
          disease {
            name
          }
          testResult
        }
        correctionStatus
        reasonForCorrection
        deviceType {
          name
          manufacturer
          model
          swabTypes {
            internalId
            name
          }
        }
        patient {
          firstName
          middleName
          lastName
          birthDate
          gender
          race
          ethnicity
          tribalAffiliation
          lookupId
          telephone
          email
          street
          streetTwo
          city
          county
          state
          zipCode
          country
          role
          residentCongregateSetting
          employedInHealthcare
          preferredLanguage
        }
        createdBy {
          nameInfo {
            firstName
            middleName
            lastName
          }
        }
        symptoms
        noSymptoms
        symptomOnset
      }
      totalElements
    }
  }
`;

/**
 * __useGetFacilityResultsForCsvWithCountQuery__
 *
 * To run a query within a React component, call `useGetFacilityResultsForCsvWithCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityResultsForCsvWithCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityResultsForCsvWithCountQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      result: // value for 'result'
 *      role: // value for 'role'
 *      disease: // value for 'disease'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetFacilityResultsForCsvWithCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >(GetFacilityResultsForCsvWithCountDocument, options);
}
export function useGetFacilityResultsForCsvWithCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >(GetFacilityResultsForCsvWithCountDocument, options);
}
export function useGetFacilityResultsForCsvWithCountSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFacilityResultsForCsvWithCountQuery,
    GetFacilityResultsForCsvWithCountQueryVariables
  >(GetFacilityResultsForCsvWithCountDocument, options);
}
export type GetFacilityResultsForCsvWithCountQueryHookResult = ReturnType<
  typeof useGetFacilityResultsForCsvWithCountQuery
>;
export type GetFacilityResultsForCsvWithCountLazyQueryHookResult = ReturnType<
  typeof useGetFacilityResultsForCsvWithCountLazyQuery
>;
export type GetFacilityResultsForCsvWithCountSuspenseQueryHookResult =
  ReturnType<typeof useGetFacilityResultsForCsvWithCountSuspenseQuery>;
export type GetFacilityResultsForCsvWithCountQueryResult = Apollo.QueryResult<
  GetFacilityResultsForCsvWithCountQuery,
  GetFacilityResultsForCsvWithCountQueryVariables
>;
export const GetResultsMultiplexWithCountDocument = gql`
  query GetResultsMultiplexWithCount(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $disease: String
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    resultsPage(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      disease: $disease
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      content {
        id
        dateAdded
        dateTested
        disease
        testResult
        correctionStatus
        reasonForCorrection
        facility {
          name
          isDeleted
        }
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
          role
          email
          phoneNumbers {
            type
            number
          }
        }
        createdBy {
          nameInfo {
            firstName
            middleName
            lastName
          }
        }
      }
      totalElements
    }
  }
`;

/**
 * __useGetResultsMultiplexWithCountQuery__
 *
 * To run a query within a React component, call `useGetResultsMultiplexWithCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResultsMultiplexWithCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResultsMultiplexWithCountQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      result: // value for 'result'
 *      role: // value for 'role'
 *      disease: // value for 'disease'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetResultsMultiplexWithCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >(GetResultsMultiplexWithCountDocument, options);
}
export function useGetResultsMultiplexWithCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >(GetResultsMultiplexWithCountDocument, options);
}
export function useGetResultsMultiplexWithCountSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetResultsMultiplexWithCountQuery,
    GetResultsMultiplexWithCountQueryVariables
  >(GetResultsMultiplexWithCountDocument, options);
}
export type GetResultsMultiplexWithCountQueryHookResult = ReturnType<
  typeof useGetResultsMultiplexWithCountQuery
>;
export type GetResultsMultiplexWithCountLazyQueryHookResult = ReturnType<
  typeof useGetResultsMultiplexWithCountLazyQuery
>;
export type GetResultsMultiplexWithCountSuspenseQueryHookResult = ReturnType<
  typeof useGetResultsMultiplexWithCountSuspenseQuery
>;
export type GetResultsMultiplexWithCountQueryResult = Apollo.QueryResult<
  GetResultsMultiplexWithCountQuery,
  GetResultsMultiplexWithCountQueryVariables
>;
export const GetResultsForDownloadDocument = gql`
  query GetResultsForDownload(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $disease: String
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    resultsPage(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      disease: $disease
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      content {
        id
        dateAdded
        dateUpdated
        dateTested
        disease
        testResult
        correctionStatus
        reasonForCorrection
        facility {
          name
          isDeleted
        }
        deviceType {
          name
          manufacturer
          model
          swabTypes {
            internalId
            name
          }
        }
        patient {
          firstName
          middleName
          lastName
          birthDate
          gender
          race
          ethnicity
          tribalAffiliation
          role
          lookupId
          street
          streetTwo
          city
          county
          state
          zipCode
          country
          email
          phoneNumbers {
            type
            number
          }
          residentCongregateSetting
          employedInHealthcare
          preferredLanguage
        }
        createdBy {
          nameInfo {
            firstName
            middleName
            lastName
          }
        }
        surveyData {
          pregnancy
          syphilisHistory
          symptoms
          symptomOnset
          noSymptoms
          genderOfSexualPartners
        }
      }
      totalElements
    }
  }
`;

/**
 * __useGetResultsForDownloadQuery__
 *
 * To run a query within a React component, call `useGetResultsForDownloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResultsForDownloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResultsForDownloadQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *      patientId: // value for 'patientId'
 *      result: // value for 'result'
 *      role: // value for 'role'
 *      disease: // value for 'disease'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetResultsForDownloadQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >(GetResultsForDownloadDocument, options);
}
export function useGetResultsForDownloadLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >(GetResultsForDownloadDocument, options);
}
export function useGetResultsForDownloadSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetResultsForDownloadQuery,
    GetResultsForDownloadQueryVariables
  >(GetResultsForDownloadDocument, options);
}
export type GetResultsForDownloadQueryHookResult = ReturnType<
  typeof useGetResultsForDownloadQuery
>;
export type GetResultsForDownloadLazyQueryHookResult = ReturnType<
  typeof useGetResultsForDownloadLazyQuery
>;
export type GetResultsForDownloadSuspenseQueryHookResult = ReturnType<
  typeof useGetResultsForDownloadSuspenseQuery
>;
export type GetResultsForDownloadQueryResult = Apollo.QueryResult<
  GetResultsForDownloadQuery,
  GetResultsForDownloadQueryVariables
>;
export const GetAllFacilitiesDocument = gql`
  query GetAllFacilities($showArchived: Boolean) {
    facilities(showArchived: $showArchived) {
      id
      name
      isDeleted
    }
  }
`;

/**
 * __useGetAllFacilitiesQuery__
 *
 * To run a query within a React component, call `useGetAllFacilitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllFacilitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllFacilitiesQuery({
 *   variables: {
 *      showArchived: // value for 'showArchived'
 *   },
 * });
 */
export function useGetAllFacilitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAllFacilitiesQuery,
    GetAllFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAllFacilitiesQuery, GetAllFacilitiesQueryVariables>(
    GetAllFacilitiesDocument,
    options
  );
}
export function useGetAllFacilitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllFacilitiesQuery,
    GetAllFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAllFacilitiesQuery,
    GetAllFacilitiesQueryVariables
  >(GetAllFacilitiesDocument, options);
}
export function useGetAllFacilitiesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAllFacilitiesQuery,
    GetAllFacilitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAllFacilitiesQuery,
    GetAllFacilitiesQueryVariables
  >(GetAllFacilitiesDocument, options);
}
export type GetAllFacilitiesQueryHookResult = ReturnType<
  typeof useGetAllFacilitiesQuery
>;
export type GetAllFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetAllFacilitiesLazyQuery
>;
export type GetAllFacilitiesSuspenseQueryHookResult = ReturnType<
  typeof useGetAllFacilitiesSuspenseQuery
>;
export type GetAllFacilitiesQueryResult = Apollo.QueryResult<
  GetAllFacilitiesQuery,
  GetAllFacilitiesQueryVariables
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
export function useGetResultsCountByFacilitySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetResultsCountByFacilityQuery,
    GetResultsCountByFacilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetResultsCountByFacilitySuspenseQueryHookResult = ReturnType<
  typeof useGetResultsCountByFacilitySuspenseQuery
>;
export type GetResultsCountByFacilityQueryResult = Apollo.QueryResult<
  GetResultsCountByFacilityQuery,
  GetResultsCountByFacilityQueryVariables
>;
export const GetTestResultForPrintDocument = gql`
  query GetTestResultForPrint($id: ID!) {
    testResult(id: $id) {
      dateTested
      results {
        disease {
          name
        }
        testResult
      }
      correctionStatus
      deviceType {
        name
        model
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
  > &
    (
      | { variables: GetTestResultForPrintQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetTestResultForPrintSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultForPrintQuery,
    GetTestResultForPrintQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetTestResultForPrintSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultForPrintSuspenseQuery
>;
export type GetTestResultForPrintQueryResult = Apollo.QueryResult<
  GetTestResultForPrintQuery,
  GetTestResultForPrintQueryVariables
>;
export const GetUploadSubmissionDocument = gql`
  query GetUploadSubmission($id: ID!) {
    uploadSubmission(id: $id) {
      reportId
      createdAt
      status
      recordsCount
      warnings {
        message
        scope
      }
      errors {
        message
        scope
      }
    }
  }
`;

/**
 * __useGetUploadSubmissionQuery__
 *
 * To run a query within a React component, call `useGetUploadSubmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUploadSubmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUploadSubmissionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUploadSubmissionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  > &
    (
      | { variables: GetUploadSubmissionQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  >(GetUploadSubmissionDocument, options);
}
export function useGetUploadSubmissionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  >(GetUploadSubmissionDocument, options);
}
export function useGetUploadSubmissionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUploadSubmissionQuery,
    GetUploadSubmissionQueryVariables
  >(GetUploadSubmissionDocument, options);
}
export type GetUploadSubmissionQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionQuery
>;
export type GetUploadSubmissionLazyQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionLazyQuery
>;
export type GetUploadSubmissionSuspenseQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionSuspenseQuery
>;
export type GetUploadSubmissionQueryResult = Apollo.QueryResult<
  GetUploadSubmissionQuery,
  GetUploadSubmissionQueryVariables
>;
export const GetUploadSubmissionsDocument = gql`
  query GetUploadSubmissions(
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    uploadSubmissions(
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      content {
        internalId
        reportId
        createdAt
        status
        recordsCount
        errors {
          message
          scope
        }
        warnings {
          message
          scope
        }
      }
      totalElements
    }
  }
`;

/**
 * __useGetUploadSubmissionsQuery__
 *
 * To run a query within a React component, call `useGetUploadSubmissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUploadSubmissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUploadSubmissionsQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      pageNumber: // value for 'pageNumber'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetUploadSubmissionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >(GetUploadSubmissionsDocument, options);
}
export function useGetUploadSubmissionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >(GetUploadSubmissionsDocument, options);
}
export function useGetUploadSubmissionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUploadSubmissionsQuery,
    GetUploadSubmissionsQueryVariables
  >(GetUploadSubmissionsDocument, options);
}
export type GetUploadSubmissionsQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionsQuery
>;
export type GetUploadSubmissionsLazyQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionsLazyQuery
>;
export type GetUploadSubmissionsSuspenseQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionsSuspenseQuery
>;
export type GetUploadSubmissionsQueryResult = Apollo.QueryResult<
  GetUploadSubmissionsQuery,
  GetUploadSubmissionsQueryVariables
>;
export const GetTestResultForCorrectionDocument = gql`
  query getTestResultForCorrection($id: ID!) {
    testResult(id: $id) {
      dateTested
      results {
        disease {
          name
        }
        testResult
      }
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
  > &
    (
      | { variables: GetTestResultForCorrectionQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetTestResultForCorrectionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultForCorrectionQuery,
    GetTestResultForCorrectionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetTestResultForCorrectionSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultForCorrectionSuspenseQuery
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
export type MarkTestAsErrorMutationResult =
  Apollo.MutationResult<MarkTestAsErrorMutation>;
export type MarkTestAsErrorMutationOptions = Apollo.BaseMutationOptions<
  MarkTestAsErrorMutation,
  MarkTestAsErrorMutationVariables
>;
export const MarkTestAsCorrectionDocument = gql`
  mutation MarkTestAsCorrection($id: ID!, $reason: String!) {
    correctTestMarkAsCorrection(id: $id, reason: $reason) {
      internalId
    }
  }
`;
export type MarkTestAsCorrectionMutationFn = Apollo.MutationFunction<
  MarkTestAsCorrectionMutation,
  MarkTestAsCorrectionMutationVariables
>;

/**
 * __useMarkTestAsCorrectionMutation__
 *
 * To run a mutation, you first call `useMarkTestAsCorrectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkTestAsCorrectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markTestAsCorrectionMutation, { data, loading, error }] = useMarkTestAsCorrectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useMarkTestAsCorrectionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkTestAsCorrectionMutation,
    MarkTestAsCorrectionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkTestAsCorrectionMutation,
    MarkTestAsCorrectionMutationVariables
  >(MarkTestAsCorrectionDocument, options);
}
export type MarkTestAsCorrectionMutationHookResult = ReturnType<
  typeof useMarkTestAsCorrectionMutation
>;
export type MarkTestAsCorrectionMutationResult =
  Apollo.MutationResult<MarkTestAsCorrectionMutation>;
export type MarkTestAsCorrectionMutationOptions = Apollo.BaseMutationOptions<
  MarkTestAsCorrectionMutation,
  MarkTestAsCorrectionMutationVariables
>;
export const GetTestResultForTextDocument = gql`
  query getTestResultForText($id: ID!) {
    testResult(id: $id) {
      dateTested
      patient {
        firstName
        middleName
        lastName
        birthDate
        phoneNumbers {
          type
          number
        }
      }
    }
  }
`;

/**
 * __useGetTestResultForTextQuery__
 *
 * To run a query within a React component, call `useGetTestResultForTextQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestResultForTextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestResultForTextQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestResultForTextQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  > &
    (
      | { variables: GetTestResultForTextQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  >(GetTestResultForTextDocument, options);
}
export function useGetTestResultForTextLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  >(GetTestResultForTextDocument, options);
}
export function useGetTestResultForTextSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTestResultForTextQuery,
    GetTestResultForTextQueryVariables
  >(GetTestResultForTextDocument, options);
}
export type GetTestResultForTextQueryHookResult = ReturnType<
  typeof useGetTestResultForTextQuery
>;
export type GetTestResultForTextLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForTextLazyQuery
>;
export type GetTestResultForTextSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultForTextSuspenseQuery
>;
export type GetTestResultForTextQueryResult = Apollo.QueryResult<
  GetTestResultForTextQuery,
  GetTestResultForTextQueryVariables
>;
export const SendSmsDocument = gql`
  mutation sendSMS($id: ID!) {
    sendPatientLinkSmsByTestEventId(testEventId: $id)
  }
`;
export type SendSmsMutationFn = Apollo.MutationFunction<
  SendSmsMutation,
  SendSmsMutationVariables
>;

/**
 * __useSendSmsMutation__
 *
 * To run a mutation, you first call `useSendSmsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendSmsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendSmsMutation, { data, loading, error }] = useSendSmsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSendSmsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SendSmsMutation,
    SendSmsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SendSmsMutation, SendSmsMutationVariables>(
    SendSmsDocument,
    options
  );
}
export type SendSmsMutationHookResult = ReturnType<typeof useSendSmsMutation>;
export type SendSmsMutationResult = Apollo.MutationResult<SendSmsMutation>;
export type SendSmsMutationOptions = Apollo.BaseMutationOptions<
  SendSmsMutation,
  SendSmsMutationVariables
>;
export const GetTestResultDetailsDocument = gql`
  query GetTestResultDetails($id: ID!) {
    testResult(id: $id) {
      dateTested
      results {
        disease {
          name
        }
        testResult
      }
      correctionStatus
      symptoms
      symptomOnset
      pregnancy
      genderOfSexualPartners
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
  > &
    (
      | { variables: GetTestResultDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
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
export function useGetTestResultDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTestResultDetailsQuery,
    GetTestResultDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type GetTestResultDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetTestResultDetailsSuspenseQuery
>;
export type GetTestResultDetailsQueryResult = Apollo.QueryResult<
  GetTestResultDetailsQuery,
  GetTestResultDetailsQueryVariables
>;
export const GetDeviceTypesForLookupDocument = gql`
  query getDeviceTypesForLookup {
    deviceTypes {
      internalId
      name
      manufacturer
      model
      swabTypes {
        internalId
        name
        typeCode
      }
      supportedDiseaseTestPerformed {
        supportedDisease {
          internalId
          name
          loinc
        }
      }
      supportedDiseaseTestPerformed {
        supportedDisease {
          internalId
          name
        }
        testPerformedLoincCode
        testkitNameId
        equipmentUid
        testOrderedLoincCode
      }
    }
  }
`;

/**
 * __useGetDeviceTypesForLookupQuery__
 *
 * To run a query within a React component, call `useGetDeviceTypesForLookupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDeviceTypesForLookupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDeviceTypesForLookupQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDeviceTypesForLookupQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >(GetDeviceTypesForLookupDocument, options);
}
export function useGetDeviceTypesForLookupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >(GetDeviceTypesForLookupDocument, options);
}
export function useGetDeviceTypesForLookupSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDeviceTypesForLookupQuery,
    GetDeviceTypesForLookupQueryVariables
  >(GetDeviceTypesForLookupDocument, options);
}
export type GetDeviceTypesForLookupQueryHookResult = ReturnType<
  typeof useGetDeviceTypesForLookupQuery
>;
export type GetDeviceTypesForLookupLazyQueryHookResult = ReturnType<
  typeof useGetDeviceTypesForLookupLazyQuery
>;
export type GetDeviceTypesForLookupSuspenseQueryHookResult = ReturnType<
  typeof useGetDeviceTypesForLookupSuspenseQuery
>;
export type GetDeviceTypesForLookupQueryResult = Apollo.QueryResult<
  GetDeviceTypesForLookupQuery,
  GetDeviceTypesForLookupQueryVariables
>;

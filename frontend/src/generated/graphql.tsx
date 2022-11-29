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
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  LocalDate: any;
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

export type AggregateFacilityMetrics = {
  __typename?: "AggregateFacilityMetrics";
  facilityName?: Maybe<Scalars["String"]>;
  negativeTestCount?: Maybe<Scalars["Int"]>;
  positiveTestCount?: Maybe<Scalars["Int"]>;
  totalTestCount?: Maybe<Scalars["Int"]>;
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
  id: Scalars["ID"];
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  name: NameInfo;
  status?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export type CreateDeviceType = {
  loincCode: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  name: Scalars["String"];
  supportedDiseases: Array<Scalars["ID"]>;
  swabTypes: Array<Scalars["ID"]>;
  testLength: Scalars["Int"];
};

export type CreateSpecimenType = {
  collectionLocationCode?: InputMaybe<Scalars["String"]>;
  collectionLocationName?: InputMaybe<Scalars["String"]>;
  name: Scalars["String"];
  typeCode: Scalars["String"];
};

export type DeviceSpecimenType = {
  __typename?: "DeviceSpecimenType";
  deviceType: DeviceType;
  internalId: Scalars["ID"];
  specimenType: SpecimenType;
};

export type DeviceType = {
  __typename?: "DeviceType";
  internalId: Scalars["ID"];
  loincCode: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  name: Scalars["String"];
  supportedDiseases: Array<SupportedDisease>;
  swabType?: Maybe<Scalars["String"]>;
  swabTypes: Array<SpecimenType>;
  testLength?: Maybe<Scalars["Int"]>;
};

export type Facility = {
  __typename?: "Facility";
  address?: Maybe<AddressInfo>;
  city?: Maybe<Scalars["String"]>;
  cliaNumber?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  defaultDeviceSpecimen?: Maybe<Scalars["ID"]>;
  /** @deprecated kept for compatibility */
  defaultDeviceType?: Maybe<DeviceType>;
  /** @deprecated kept for compatibility */
  deviceSpecimenTypes?: Maybe<Array<Maybe<DeviceSpecimenType>>>;
  deviceTypes?: Maybe<Array<Maybe<DeviceType>>>;
  email?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isDeleted?: Maybe<Scalars["Boolean"]>;
  name: Scalars["String"];
  orderingProvider?: Maybe<Provider>;
  patientSelfRegistrationLink?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  street?: Maybe<Scalars["String"]>;
  streetTwo?: Maybe<Scalars["String"]>;
  zipCode?: Maybe<Scalars["String"]>;
};

export type FeedbackMessage = {
  __typename?: "FeedbackMessage";
  indices?: Maybe<Array<Maybe<Scalars["Int"]>>>;
  message?: Maybe<Scalars["String"]>;
  scope?: Maybe<Scalars["String"]>;
};

export type MultiplexResult = {
  __typename?: "MultiplexResult";
  disease?: Maybe<SupportedDisease>;
  testResult?: Maybe<Scalars["String"]>;
};

export type MultiplexResultInput = {
  diseaseName?: InputMaybe<Scalars["String"]>;
  testResult?: InputMaybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addFacility?: Maybe<Facility>;
  addFacilityNew?: Maybe<Scalars["String"]>;
  addMultiplexResult?: Maybe<AddTestResultResponse>;
  addPatient?: Maybe<Patient>;
  addPatientToQueue?: Maybe<Scalars["String"]>;
  addUser?: Maybe<User>;
  addUserToCurrentOrg?: Maybe<User>;
  adminUpdateOrganization?: Maybe<Scalars["String"]>;
  correctTestMarkAsCorrection?: Maybe<TestResult>;
  correctTestMarkAsError?: Maybe<TestResult>;
  createApiUserNoOkta?: Maybe<ApiUser>;
  createDeviceType?: Maybe<DeviceType>;
  createFacilityRegistrationLink?: Maybe<Scalars["String"]>;
  createOrganization?: Maybe<Organization>;
  createOrganizationRegistrationLink?: Maybe<Scalars["String"]>;
  createSpecimenType?: Maybe<SpecimenType>;
  editPendingOrganization?: Maybe<Scalars["String"]>;
  editQueueItemMultiplexResult?: Maybe<TestOrder>;
  markFacilityAsDeleted?: Maybe<Scalars["String"]>;
  markOrganizationAsDeleted?: Maybe<Scalars["String"]>;
  markPendingOrganizationAsDeleted?: Maybe<Scalars["String"]>;
  reactivateUser?: Maybe<User>;
  removePatientFromQueue?: Maybe<Scalars["String"]>;
  resendActivationEmail?: Maybe<User>;
  resendToReportStream?: Maybe<Scalars["Boolean"]>;
  resetUserMfa?: Maybe<User>;
  resetUserPassword?: Maybe<User>;
  sendPatientLinkEmail?: Maybe<Scalars["Boolean"]>;
  sendPatientLinkEmailByTestEventId?: Maybe<Scalars["Boolean"]>;
  sendPatientLinkSms?: Maybe<Scalars["Boolean"]>;
  sendPatientLinkSmsByTestEventId?: Maybe<Scalars["Boolean"]>;
  setCurrentUserTenantDataAccess?: Maybe<User>;
  setOrganizationIdentityVerified?: Maybe<Scalars["Boolean"]>;
  setPatientIsDeleted?: Maybe<Patient>;
  setRegistrationLinkIsDeleted?: Maybe<Scalars["String"]>;
  setUserIsDeleted?: Maybe<User>;
  updateDeviceType?: Maybe<DeviceType>;
  updateFacility?: Maybe<Facility>;
  updateFacilityNew?: Maybe<Scalars["String"]>;
  updateOrganization?: Maybe<Scalars["String"]>;
  updatePatient?: Maybe<Patient>;
  updateRegistrationLink?: Maybe<Scalars["String"]>;
  updateTimeOfTestQuestions?: Maybe<Scalars["String"]>;
  updateUser?: Maybe<User>;
  updateUserEmail?: Maybe<User>;
  updateUserPrivileges?: Maybe<User>;
};

export type MutationAddFacilityArgs = {
  city?: InputMaybe<Scalars["String"]>;
  cliaNumber?: InputMaybe<Scalars["String"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]>>;
  email?: InputMaybe<Scalars["String"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderCounty?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationAddFacilityNewArgs = {
  city?: InputMaybe<Scalars["String"]>;
  cliaNumber?: InputMaybe<Scalars["String"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]>>;
  email?: InputMaybe<Scalars["String"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderCounty?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationAddMultiplexResultArgs = {
  dateTested?: InputMaybe<Scalars["DateTime"]>;
  deviceId: Scalars["String"];
  deviceSpecimenType?: InputMaybe<Scalars["ID"]>;
  patientId: Scalars["ID"];
  results: Array<InputMaybe<MultiplexResultInput>>;
};

export type MutationAddPatientArgs = {
  birthDate: Scalars["LocalDate"];
  city?: InputMaybe<Scalars["String"]>;
  country?: InputMaybe<Scalars["String"]>;
  county?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  emails?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]>;
  ethnicity?: InputMaybe<Scalars["String"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  gender?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lookupId?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput>>;
  preferredLanguage?: InputMaybe<Scalars["String"]>;
  race?: InputMaybe<Scalars["String"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]>;
  role?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  suffix?: InputMaybe<Scalars["String"]>;
  telephone?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  tribalAffiliation?: InputMaybe<Scalars["String"]>;
  zipCode: Scalars["String"];
};

export type MutationAddPatientToQueueArgs = {
  facilityId: Scalars["ID"];
  noSymptoms?: InputMaybe<Scalars["Boolean"]>;
  patientId: Scalars["ID"];
  pregnancy?: InputMaybe<Scalars["String"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]>;
  symptoms?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
};

export type MutationAddUserArgs = {
  email: Scalars["String"];
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<NameInput>;
  organizationExternalId: Scalars["String"];
  role: Role;
  suffix?: InputMaybe<Scalars["String"]>;
};

export type MutationAddUserToCurrentOrgArgs = {
  email: Scalars["String"];
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<NameInput>;
  role: Role;
  suffix?: InputMaybe<Scalars["String"]>;
};

export type MutationAdminUpdateOrganizationArgs = {
  name: Scalars["String"];
  type: Scalars["String"];
};

export type MutationCorrectTestMarkAsCorrectionArgs = {
  id: Scalars["ID"];
  reason?: InputMaybe<Scalars["String"]>;
};

export type MutationCorrectTestMarkAsErrorArgs = {
  id: Scalars["ID"];
  reason?: InputMaybe<Scalars["String"]>;
};

export type MutationCreateApiUserNoOktaArgs = {
  email?: InputMaybe<Scalars["String"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<NameInput>;
  suffix?: InputMaybe<Scalars["String"]>;
};

export type MutationCreateDeviceTypeArgs = {
  input: CreateDeviceType;
};

export type MutationCreateFacilityRegistrationLinkArgs = {
  facilityId: Scalars["ID"];
  link: Scalars["String"];
  organizationExternalId: Scalars["String"];
};

export type MutationCreateOrganizationArgs = {
  adminEmail: Scalars["String"];
  adminFirstName?: InputMaybe<Scalars["String"]>;
  adminLastName?: InputMaybe<Scalars["String"]>;
  adminMiddleName?: InputMaybe<Scalars["String"]>;
  adminName?: InputMaybe<NameInput>;
  adminSuffix?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  cliaNumber?: InputMaybe<Scalars["String"]>;
  county?: InputMaybe<Scalars["String"]>;
  defaultDevice: Scalars["String"];
  deviceTypes: Array<InputMaybe<Scalars["String"]>>;
  email?: InputMaybe<Scalars["String"]>;
  externalId: Scalars["String"];
  name: Scalars["String"];
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderCounty?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderName?: InputMaybe<NameInput>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  type: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationCreateOrganizationRegistrationLinkArgs = {
  link: Scalars["String"];
  organizationExternalId: Scalars["String"];
};

export type MutationCreateSpecimenTypeArgs = {
  input: CreateSpecimenType;
};

export type MutationEditPendingOrganizationArgs = {
  adminEmail?: InputMaybe<Scalars["String"]>;
  adminFirstName?: InputMaybe<Scalars["String"]>;
  adminLastName?: InputMaybe<Scalars["String"]>;
  adminPhone?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  orgExternalId: Scalars["String"];
};

export type MutationEditQueueItemMultiplexResultArgs = {
  dateTested?: InputMaybe<Scalars["DateTime"]>;
  deviceId?: InputMaybe<Scalars["String"]>;
  deviceSpecimenType?: InputMaybe<Scalars["ID"]>;
  id: Scalars["ID"];
  results?: InputMaybe<Array<InputMaybe<MultiplexResultInput>>>;
};

export type MutationMarkFacilityAsDeletedArgs = {
  deleted: Scalars["Boolean"];
  facilityId: Scalars["ID"];
};

export type MutationMarkOrganizationAsDeletedArgs = {
  deleted: Scalars["Boolean"];
  organizationId: Scalars["ID"];
};

export type MutationMarkPendingOrganizationAsDeletedArgs = {
  deleted: Scalars["Boolean"];
  orgExternalId: Scalars["String"];
};

export type MutationReactivateUserArgs = {
  id: Scalars["ID"];
};

export type MutationRemovePatientFromQueueArgs = {
  patientId: Scalars["ID"];
};

export type MutationResendActivationEmailArgs = {
  id: Scalars["ID"];
};

export type MutationResendToReportStreamArgs = {
  testEventIds: Array<Scalars["ID"]>;
};

export type MutationResetUserMfaArgs = {
  id: Scalars["ID"];
};

export type MutationResetUserPasswordArgs = {
  id: Scalars["ID"];
};

export type MutationSendPatientLinkEmailArgs = {
  internalId: Scalars["ID"];
};

export type MutationSendPatientLinkEmailByTestEventIdArgs = {
  testEventId: Scalars["ID"];
};

export type MutationSendPatientLinkSmsArgs = {
  internalId: Scalars["ID"];
};

export type MutationSendPatientLinkSmsByTestEventIdArgs = {
  testEventId: Scalars["ID"];
};

export type MutationSetCurrentUserTenantDataAccessArgs = {
  justification?: InputMaybe<Scalars["String"]>;
  organizationExternalId?: InputMaybe<Scalars["String"]>;
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
  link?: InputMaybe<Scalars["String"]>;
};

export type MutationSetUserIsDeletedArgs = {
  deleted: Scalars["Boolean"];
  id: Scalars["ID"];
};

export type MutationUpdateDeviceTypeArgs = {
  input: UpdateDeviceType;
};

export type MutationUpdateFacilityArgs = {
  city?: InputMaybe<Scalars["String"]>;
  cliaNumber?: InputMaybe<Scalars["String"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]>>;
  email?: InputMaybe<Scalars["String"]>;
  facilityId: Scalars["ID"];
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderCounty?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationUpdateFacilityNewArgs = {
  city?: InputMaybe<Scalars["String"]>;
  cliaNumber?: InputMaybe<Scalars["String"]>;
  deviceIds: Array<InputMaybe<Scalars["ID"]>>;
  email?: InputMaybe<Scalars["String"]>;
  facilityId: Scalars["ID"];
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderCounty?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  testingFacilityName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type MutationUpdateOrganizationArgs = {
  type: Scalars["String"];
};

export type MutationUpdatePatientArgs = {
  birthDate: Scalars["LocalDate"];
  city?: InputMaybe<Scalars["String"]>;
  country?: InputMaybe<Scalars["String"]>;
  county?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  emails?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]>;
  ethnicity?: InputMaybe<Scalars["String"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  gender?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lookupId?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  patientId: Scalars["ID"];
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput>>;
  preferredLanguage?: InputMaybe<Scalars["String"]>;
  race?: InputMaybe<Scalars["String"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]>;
  role?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  suffix?: InputMaybe<Scalars["String"]>;
  telephone?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
  tribalAffiliation?: InputMaybe<Scalars["String"]>;
  zipCode: Scalars["String"];
};

export type MutationUpdateRegistrationLinkArgs = {
  link: Scalars["String"];
  newLink: Scalars["String"];
};

export type MutationUpdateTimeOfTestQuestionsArgs = {
  noSymptoms?: InputMaybe<Scalars["Boolean"]>;
  patientId: Scalars["ID"];
  pregnancy?: InputMaybe<Scalars["String"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]>;
  symptoms?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
};

export type MutationUpdateUserArgs = {
  firstName?: InputMaybe<Scalars["String"]>;
  id: Scalars["ID"];
  lastName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<NameInput>;
  suffix?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateUserEmailArgs = {
  email?: InputMaybe<Scalars["String"]>;
  id: Scalars["ID"];
};

export type MutationUpdateUserPrivilegesArgs = {
  accessAllFacilities: Scalars["Boolean"];
  facilities?: InputMaybe<Array<Scalars["ID"]>>;
  id: Scalars["ID"];
  role: Role;
};

export type NameInfo = {
  __typename?: "NameInfo";
  firstName?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
};

export type NameInput = {
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  suffix?: InputMaybe<Scalars["String"]>;
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

export type OrganizationLevelDashboardMetrics = {
  __typename?: "OrganizationLevelDashboardMetrics";
  facilityMetrics?: Maybe<Array<Maybe<AggregateFacilityMetrics>>>;
  organizationNegativeTestCount?: Maybe<Scalars["Int"]>;
  organizationPositiveTestCount?: Maybe<Scalars["Int"]>;
  organizationTotalTestCount?: Maybe<Scalars["Int"]>;
};

export type Patient = {
  __typename?: "Patient";
  address?: Maybe<AddressInfo>;
  birthDate?: Maybe<Scalars["LocalDate"]>;
  city?: Maybe<Scalars["String"]>;
  country?: Maybe<Scalars["String"]>;
  county?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  emails?: Maybe<Array<Maybe<Scalars["String"]>>>;
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

export type PendingOrganization = {
  __typename?: "PendingOrganization";
  adminEmail?: Maybe<Scalars["String"]>;
  adminFirstName?: Maybe<Scalars["String"]>;
  adminLastName?: Maybe<Scalars["String"]>;
  adminPhone?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  externalId: Scalars["String"];
  name: Scalars["String"];
};

export type PhoneNumber = {
  __typename?: "PhoneNumber";
  number?: Maybe<Scalars["String"]>;
  type?: Maybe<PhoneType>;
};

export type PhoneNumberInput = {
  number?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
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
  deviceSpecimenTypes?: Maybe<Array<Maybe<DeviceSpecimenType>>>;
  /** @deprecated use the pluralized form to reduce confusion */
  deviceType: Array<DeviceType>;
  deviceTypes: Array<DeviceType>;
  facilities?: Maybe<Array<Maybe<Facility>>>;
  /** @deprecated this information is already loaded from the 'whoami' endpoint */
  organization?: Maybe<Organization>;
  organizationLevelDashboardMetrics?: Maybe<OrganizationLevelDashboardMetrics>;
  organizations: Array<Organization>;
  patient?: Maybe<Patient>;
  patientExists?: Maybe<Scalars["Boolean"]>;
  patientExistsWithoutZip?: Maybe<Scalars["Boolean"]>;
  patients?: Maybe<Array<Maybe<Patient>>>;
  patientsCount?: Maybe<Scalars["Int"]>;
  pendingOrganizations: Array<PendingOrganization>;
  queue?: Maybe<Array<Maybe<TestOrder>>>;
  specimenType?: Maybe<Array<Maybe<SpecimenType>>>;
  specimenTypes: Array<SpecimenType>;
  supportedDiseases: Array<SupportedDisease>;
  testResult?: Maybe<TestResult>;
  testResults?: Maybe<Array<Maybe<TestResult>>>;
  testResultsCount?: Maybe<Scalars["Int"]>;
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
  showArchived?: InputMaybe<Scalars["Boolean"]>;
};

export type QueryOrganizationLevelDashboardMetricsArgs = {
  endDate: Scalars["DateTime"];
  startDate: Scalars["DateTime"];
};

export type QueryOrganizationsArgs = {
  identityVerified?: InputMaybe<Scalars["Boolean"]>;
};

export type QueryPatientArgs = {
  id: Scalars["ID"];
};

export type QueryPatientExistsArgs = {
  birthDate: Scalars["LocalDate"];
  facilityId?: InputMaybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  zipCode: Scalars["String"];
};

export type QueryPatientExistsWithoutZipArgs = {
  birthDate: Scalars["LocalDate"];
  facilityId?: InputMaybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
};

export type QueryPatientsArgs = {
  facilityId?: InputMaybe<Scalars["ID"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]>;
  includeArchivedFacilities?: InputMaybe<Scalars["Boolean"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
};

export type QueryPatientsCountArgs = {
  facilityId?: InputMaybe<Scalars["ID"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]>;
};

export type QueryQueueArgs = {
  facilityId: Scalars["ID"];
};

export type QueryTestResultArgs = {
  id: Scalars["ID"];
};

export type QueryTestResultsArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
};

export type QueryTestResultsCountArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
};

export type QueryTestResultsPageArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
};

export type QueryTopLevelDashboardMetricsArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  facilityId?: InputMaybe<Scalars["ID"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
};

export type QueryUploadSubmissionArgs = {
  id: Scalars["ID"];
};

export type QueryUploadSubmissionsArgs = {
  endDate?: InputMaybe<Scalars["DateTime"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
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
  TestResultUploadUser = "TEST_RESULT_UPLOAD_USER",
  User = "USER",
}

export type SpecimenType = {
  __typename?: "SpecimenType";
  collectionLocationCode?: Maybe<Scalars["String"]>;
  collectionLocationName?: Maybe<Scalars["String"]>;
  internalId: Scalars["ID"];
  name: Scalars["String"];
  typeCode: Scalars["String"];
};

export type SupportedDisease = {
  __typename?: "SupportedDisease";
  internalId: Scalars["ID"];
  loinc: Scalars["String"];
  name: Scalars["String"];
};

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
  nameType?: InputMaybe<Scalars["String"]>;
};

export type TestOrder = {
  __typename?: "TestOrder";
  correctionStatus?: Maybe<Scalars["String"]>;
  dateAdded?: Maybe<Scalars["String"]>;
  dateTested?: Maybe<Scalars["DateTime"]>;
  deviceSpecimenType?: Maybe<DeviceSpecimenType>;
  deviceType?: Maybe<DeviceType>;
  id?: Maybe<Scalars["ID"]>;
  /** @deprecated alias for 'id' */
  internalId?: Maybe<Scalars["ID"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patient?: Maybe<Patient>;
  pregnancy?: Maybe<Scalars["String"]>;
  reasonForCorrection?: Maybe<Scalars["String"]>;
  /** @deprecated use results as source of truth */
  result?: Maybe<Scalars["String"]>;
  results?: Maybe<Array<Maybe<MultiplexResult>>>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
};

export type TestResult = {
  __typename?: "TestResult";
  correctionStatus?: Maybe<Scalars["String"]>;
  createdBy?: Maybe<ApiUser>;
  dateAdded?: Maybe<Scalars["String"]>;
  dateTested?: Maybe<Scalars["DateTime"]>;
  dateUpdated?: Maybe<Scalars["DateTime"]>;
  deviceType?: Maybe<DeviceType>;
  facility?: Maybe<Facility>;
  internalId?: Maybe<Scalars["ID"]>;
  noSymptoms?: Maybe<Scalars["Boolean"]>;
  patient?: Maybe<Patient>;
  patientLink?: Maybe<PatientLink>;
  pregnancy?: Maybe<Scalars["String"]>;
  reasonForCorrection?: Maybe<Scalars["String"]>;
  /** @deprecated use results as source of truth */
  result?: Maybe<Scalars["String"]>;
  results?: Maybe<Array<Maybe<MultiplexResult>>>;
  symptomOnset?: Maybe<Scalars["LocalDate"]>;
  symptoms?: Maybe<Scalars["String"]>;
  testPerformed: TestDescription;
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
  totalElements?: Maybe<Scalars["Int"]>;
};

export type TopLevelDashboardMetrics = {
  __typename?: "TopLevelDashboardMetrics";
  positiveTestCount?: Maybe<Scalars["Int"]>;
  totalTestCount?: Maybe<Scalars["Int"]>;
};

export type UpdateDeviceType = {
  internalId: Scalars["ID"];
  loincCode: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  name: Scalars["String"];
  supportedDiseases: Array<Scalars["ID"]>;
  swabTypes: Array<Scalars["ID"]>;
  testLength: Scalars["Int"];
};

export type UploadResponse = {
  __typename?: "UploadResponse";
  createdAt: Scalars["DateTime"];
  errors?: Maybe<Array<Maybe<FeedbackMessage>>>;
  recordsCount: Scalars["Int"];
  reportId: Scalars["ID"];
  status: UploadStatus;
  warnings?: Maybe<Array<Maybe<FeedbackMessage>>>;
};

export type UploadResult = {
  __typename?: "UploadResult";
  createdAt: Scalars["DateTime"];
  errors?: Maybe<Array<Maybe<FeedbackMessage>>>;
  internalId: Scalars["ID"];
  recordsCount: Scalars["Int"];
  reportId?: Maybe<Scalars["ID"]>;
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
  totalElements: Scalars["Int"];
};

export type User = {
  __typename?: "User";
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isAdmin?: Maybe<Scalars["Boolean"]>;
  lastName: Scalars["String"];
  middleName?: Maybe<Scalars["String"]>;
  name: NameInfo;
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
  UploadResultsSpreadsheet = "UPLOAD_RESULTS_SPREADSHEET",
  ViewArchivedFacilities = "VIEW_ARCHIVED_FACILITIES",
}

export type WhoAmIQueryVariables = Exact<{ [key: string]: never }>;

export type WhoAmIQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    id: string;
    firstName?: string | null | undefined;
    middleName?: string | null | undefined;
    lastName: string;
    suffix?: string | null | undefined;
    email: string;
    isAdmin?: boolean | null | undefined;
    permissions: Array<UserPermission>;
    roleDescription: string;
    organization?:
      | {
          __typename?: "Organization";
          name: string;
          testingFacility: Array<{
            __typename?: "Facility";
            id: string;
            name: string;
          }>;
        }
      | null
      | undefined;
  };
};

export type GetFacilitiesQueryVariables = Exact<{ [key: string]: never }>;

export type GetFacilitiesQuery = {
  __typename?: "Query";
  organization?:
    | {
        __typename?: "Organization";
        internalId: string;
        testingFacility: Array<{
          __typename?: "Facility";
          id: string;
          cliaNumber?: string | null | undefined;
          name: string;
          street?: string | null | undefined;
          streetTwo?: string | null | undefined;
          city?: string | null | undefined;
          state?: string | null | undefined;
          zipCode?: string | null | undefined;
          phone?: string | null | undefined;
          email?: string | null | undefined;
          deviceTypes?:
            | Array<
                | {
                    __typename?: "DeviceType";
                    name: string;
                    internalId: string;
                  }
                | null
                | undefined
              >
            | null
            | undefined;
          orderingProvider?:
            | {
                __typename?: "Provider";
                firstName?: string | null | undefined;
                middleName?: string | null | undefined;
                lastName?: string | null | undefined;
                suffix?: string | null | undefined;
                NPI?: string | null | undefined;
                street?: string | null | undefined;
                streetTwo?: string | null | undefined;
                city?: string | null | undefined;
                state?: string | null | undefined;
                zipCode?: string | null | undefined;
                phone?: string | null | undefined;
              }
            | null
            | undefined;
        }>;
      }
    | null
    | undefined;
  deviceTypes: Array<{
    __typename?: "DeviceType";
    internalId: string;
    name: string;
  }>;
};

export type UpdateFacilityMutationVariables = Exact<{
  facilityId: Scalars["ID"];
  testingFacilityName: Scalars["String"];
  cliaNumber?: InputMaybe<Scalars["String"]>;
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  phone?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  devices: Array<InputMaybe<Scalars["ID"]>> | InputMaybe<Scalars["ID"]>;
}>;

export type UpdateFacilityMutation = {
  __typename?: "Mutation";
  updateFacility?: { __typename?: "Facility"; id: string } | null | undefined;
};

export type AddFacilityMutationVariables = Exact<{
  testingFacilityName: Scalars["String"];
  cliaNumber?: InputMaybe<Scalars["String"]>;
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  phone?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  orderingProviderFirstName?: InputMaybe<Scalars["String"]>;
  orderingProviderMiddleName?: InputMaybe<Scalars["String"]>;
  orderingProviderLastName?: InputMaybe<Scalars["String"]>;
  orderingProviderSuffix?: InputMaybe<Scalars["String"]>;
  orderingProviderNPI?: InputMaybe<Scalars["String"]>;
  orderingProviderStreet?: InputMaybe<Scalars["String"]>;
  orderingProviderStreetTwo?: InputMaybe<Scalars["String"]>;
  orderingProviderCity?: InputMaybe<Scalars["String"]>;
  orderingProviderState?: InputMaybe<Scalars["String"]>;
  orderingProviderZipCode?: InputMaybe<Scalars["String"]>;
  orderingProviderPhone?: InputMaybe<Scalars["String"]>;
  devices: Array<InputMaybe<Scalars["ID"]>> | InputMaybe<Scalars["ID"]>;
}>;

export type AddFacilityMutation = {
  __typename?: "Mutation";
  addFacility?: { __typename?: "Facility"; id: string } | null | undefined;
};

export type GetManagedFacilitiesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetManagedFacilitiesQuery = {
  __typename?: "Query";
  organization?:
    | {
        __typename?: "Organization";
        facilities: Array<{
          __typename?: "Facility";
          id: string;
          cliaNumber?: string | null | undefined;
          name: string;
        }>;
      }
    | null
    | undefined;
};

export type GetOrganizationQueryVariables = Exact<{ [key: string]: never }>;

export type GetOrganizationQuery = {
  __typename?: "Query";
  organization?:
    | { __typename?: "Organization"; name: string; type: string }
    | null
    | undefined;
};

export type AdminSetOrganizationMutationVariables = Exact<{
  name: Scalars["String"];
  type: Scalars["String"];
}>;

export type AdminSetOrganizationMutation = {
  __typename?: "Mutation";
  adminUpdateOrganization?: string | null | undefined;
};

export type SetOrganizationMutationVariables = Exact<{
  type: Scalars["String"];
}>;

export type SetOrganizationMutation = {
  __typename?: "Mutation";
  updateOrganization?: string | null | undefined;
};

export type AllSelfRegistrationLinksQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AllSelfRegistrationLinksQuery = {
  __typename?: "Query";
  whoami: {
    __typename?: "User";
    organization?:
      | {
          __typename?: "Organization";
          patientSelfRegistrationLink?: string | null | undefined;
          facilities: Array<{
            __typename?: "Facility";
            name: string;
            patientSelfRegistrationLink?: string | null | undefined;
          }>;
        }
      | null
      | undefined;
  };
};

export type UpdateUserPrivilegesMutationVariables = Exact<{
  id: Scalars["ID"];
  role: Role;
  accessAllFacilities: Scalars["Boolean"];
  facilities: Array<Scalars["ID"]> | Scalars["ID"];
}>;

export type UpdateUserPrivilegesMutation = {
  __typename?: "Mutation";
  updateUserPrivileges?: { __typename?: "User"; id: string } | null | undefined;
};

export type ResetUserPasswordMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ResetUserPasswordMutation = {
  __typename?: "Mutation";
  resetUserPassword?: { __typename?: "User"; id: string } | null | undefined;
};

export type SetUserIsDeletedMutationVariables = Exact<{
  id: Scalars["ID"];
  deleted: Scalars["Boolean"];
}>;

export type SetUserIsDeletedMutation = {
  __typename?: "Mutation";
  setUserIsDeleted?: { __typename?: "User"; id: string } | null | undefined;
};

export type ReactivateUserMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ReactivateUserMutation = {
  __typename?: "Mutation";
  reactivateUser?: { __typename?: "User"; id: string } | null | undefined;
};

export type AddUserToCurrentOrgMutationVariables = Exact<{
  firstName?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  email: Scalars["String"];
  role: Role;
}>;

export type AddUserToCurrentOrgMutation = {
  __typename?: "Mutation";
  addUserToCurrentOrg?: { __typename?: "User"; id: string } | null | undefined;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetUserQuery = {
  __typename?: "Query";
  user?:
    | {
        __typename?: "User";
        id: string;
        firstName?: string | null | undefined;
        middleName?: string | null | undefined;
        lastName: string;
        roleDescription: string;
        role?: Role | null | undefined;
        permissions: Array<UserPermission>;
        email: string;
        status?: string | null | undefined;
        organization?:
          | {
              __typename?: "Organization";
              testingFacility: Array<{
                __typename?: "Facility";
                id: string;
                name: string;
              }>;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetUsersAndStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersAndStatusQuery = {
  __typename?: "Query";
  usersWithStatus?:
    | Array<{
        __typename?: "ApiUserWithStatus";
        id: string;
        firstName?: string | null | undefined;
        middleName?: string | null | undefined;
        lastName: string;
        email: string;
        status?: string | null | undefined;
      }>
    | null
    | undefined;
};

export type ResendActivationEmailMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ResendActivationEmailMutation = {
  __typename?: "Mutation";
  resendActivationEmail?:
    | {
        __typename?: "User";
        id: string;
        firstName?: string | null | undefined;
        middleName?: string | null | undefined;
        lastName: string;
        email: string;
        status?: string | null | undefined;
      }
    | null
    | undefined;
};

export type UpdateUserNameMutationVariables = Exact<{
  id: Scalars["ID"];
  firstName: Scalars["String"];
  middleName?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  suffix?: InputMaybe<Scalars["String"]>;
}>;

export type UpdateUserNameMutation = {
  __typename?: "Mutation";
  updateUser?: { __typename?: "User"; id: string } | null | undefined;
};

export type EditUserEmailMutationVariables = Exact<{
  id: Scalars["ID"];
  email?: InputMaybe<Scalars["String"]>;
}>;

export type EditUserEmailMutation = {
  __typename?: "Mutation";
  updateUserEmail?:
    | { __typename?: "User"; id: string; email: string }
    | null
    | undefined;
};

export type ResetUserMfaMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ResetUserMfaMutation = {
  __typename?: "Mutation";
  resetUserMfa?: { __typename?: "User"; id: string } | null | undefined;
};

export type GetTopLevelDashboardMetricsNewQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
}>;

export type GetTopLevelDashboardMetricsNewQuery = {
  __typename?: "Query";
  topLevelDashboardMetrics?:
    | {
        __typename?: "TopLevelDashboardMetrics";
        positiveTestCount?: number | null | undefined;
        totalTestCount?: number | null | undefined;
      }
    | null
    | undefined;
};

export type PatientExistsQueryVariables = Exact<{
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  facilityId?: InputMaybe<Scalars["ID"]>;
}>;

export type PatientExistsQuery = {
  __typename?: "Query";
  patientExistsWithoutZip?: boolean | null | undefined;
};

export type AddPatientMutationVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  firstName: Scalars["String"];
  middleName?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  country: Scalars["String"];
  telephone?: InputMaybe<Scalars["String"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: InputMaybe<Scalars["String"]>;
  lookupId?: InputMaybe<Scalars["String"]>;
  emails?: InputMaybe<
    Array<InputMaybe<Scalars["String"]>> | InputMaybe<Scalars["String"]>
  >;
  county?: InputMaybe<Scalars["String"]>;
  race?: InputMaybe<Scalars["String"]>;
  ethnicity?: InputMaybe<Scalars["String"]>;
  tribalAffiliation?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<Scalars["String"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]>;
  preferredLanguage?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
}>;

export type AddPatientMutation = {
  __typename?: "Mutation";
  addPatient?:
    | {
        __typename?: "Patient";
        internalId?: string | null | undefined;
        facility?: { __typename?: "Facility"; id: string } | null | undefined;
      }
    | null
    | undefined;
};

export type ArchivePersonMutationVariables = Exact<{
  id: Scalars["ID"];
  deleted: Scalars["Boolean"];
}>;

export type ArchivePersonMutation = {
  __typename?: "Mutation";
  setPatientIsDeleted?:
    | { __typename?: "Patient"; internalId?: string | null | undefined }
    | null
    | undefined;
};

export type GetPatientDetailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetPatientDetailsQuery = {
  __typename?: "Query";
  patient?:
    | {
        __typename?: "Patient";
        firstName?: string | null | undefined;
        middleName?: string | null | undefined;
        lastName?: string | null | undefined;
        birthDate?: any | null | undefined;
        street?: string | null | undefined;
        streetTwo?: string | null | undefined;
        city?: string | null | undefined;
        state?: string | null | undefined;
        zipCode?: string | null | undefined;
        telephone?: string | null | undefined;
        role?: string | null | undefined;
        lookupId?: string | null | undefined;
        email?: string | null | undefined;
        emails?: Array<string | null | undefined> | null | undefined;
        county?: string | null | undefined;
        country?: string | null | undefined;
        race?: string | null | undefined;
        ethnicity?: string | null | undefined;
        tribalAffiliation?: Array<string | null | undefined> | null | undefined;
        gender?: string | null | undefined;
        residentCongregateSetting?: boolean | null | undefined;
        employedInHealthcare?: boolean | null | undefined;
        preferredLanguage?: string | null | undefined;
        testResultDelivery?: TestResultDeliveryPreference | null | undefined;
        phoneNumbers?:
          | Array<
              | {
                  __typename?: "PhoneNumber";
                  type?: PhoneType | null | undefined;
                  number?: string | null | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
        facility?: { __typename?: "Facility"; id: string } | null | undefined;
      }
    | null
    | undefined;
};

export type UpdatePatientMutationVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  patientId: Scalars["ID"];
  firstName: Scalars["String"];
  middleName?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  birthDate: Scalars["LocalDate"];
  street: Scalars["String"];
  streetTwo?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  state: Scalars["String"];
  zipCode: Scalars["String"];
  telephone?: InputMaybe<Scalars["String"]>;
  phoneNumbers?: InputMaybe<Array<PhoneNumberInput> | PhoneNumberInput>;
  role?: InputMaybe<Scalars["String"]>;
  lookupId?: InputMaybe<Scalars["String"]>;
  emails?: InputMaybe<
    Array<InputMaybe<Scalars["String"]>> | InputMaybe<Scalars["String"]>
  >;
  county?: InputMaybe<Scalars["String"]>;
  country?: InputMaybe<Scalars["String"]>;
  race?: InputMaybe<Scalars["String"]>;
  ethnicity?: InputMaybe<Scalars["String"]>;
  tribalAffiliation?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<Scalars["String"]>;
  residentCongregateSetting?: InputMaybe<Scalars["Boolean"]>;
  employedInHealthcare?: InputMaybe<Scalars["Boolean"]>;
  preferredLanguage?: InputMaybe<Scalars["String"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
}>;

export type UpdatePatientMutation = {
  __typename?: "Mutation";
  updatePatient?:
    | { __typename?: "Patient"; internalId?: string | null | undefined }
    | null
    | undefined;
};

export type GetPatientsCountByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"];
  includeArchived: Scalars["Boolean"];
  namePrefixMatch?: InputMaybe<Scalars["String"]>;
}>;

export type GetPatientsCountByFacilityQuery = {
  __typename?: "Query";
  patientsCount?: number | null | undefined;
};

export type GetPatientsByFacilityQueryVariables = Exact<{
  facilityId: Scalars["ID"];
  pageNumber: Scalars["Int"];
  pageSize: Scalars["Int"];
  includeArchived?: InputMaybe<Scalars["Boolean"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]>;
}>;

export type GetPatientsByFacilityQuery = {
  __typename?: "Query";
  patients?:
    | Array<
        | {
            __typename?: "Patient";
            internalId?: string | null | undefined;
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
            middleName?: string | null | undefined;
            birthDate?: any | null | undefined;
            isDeleted?: boolean | null | undefined;
            role?: string | null | undefined;
            lastTest?:
              | {
                  __typename?: "TestResult";
                  dateAdded?: string | null | undefined;
                }
              | null
              | undefined;
          }
        | null
        | undefined
      >
    | null
    | undefined;
};

export type AddUserMutationVariables = Exact<{
  firstName?: InputMaybe<Scalars["String"]>;
  middleName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  suffix?: InputMaybe<Scalars["String"]>;
  email: Scalars["String"];
  organizationExternalId: Scalars["String"];
  role: Role;
}>;

export type AddUserMutation = {
  __typename?: "Mutation";
  addUser?: { __typename?: "User"; id: string } | null | undefined;
};

export type CreateDeviceTypeMutationVariables = Exact<{
  name: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  loincCode: Scalars["String"];
  swabTypes: Array<Scalars["ID"]> | Scalars["ID"];
  supportedDiseases: Array<Scalars["ID"]> | Scalars["ID"];
  testLength: Scalars["Int"];
}>;

export type CreateDeviceTypeMutation = {
  __typename?: "Mutation";
  createDeviceType?:
    | { __typename?: "DeviceType"; internalId: string }
    | null
    | undefined;
};

export type UpdateDeviceTypeMutationVariables = Exact<{
  internalId: Scalars["ID"];
  name: Scalars["String"];
  manufacturer: Scalars["String"];
  model: Scalars["String"];
  loincCode: Scalars["String"];
  swabTypes: Array<Scalars["ID"]> | Scalars["ID"];
  supportedDiseases: Array<Scalars["ID"]> | Scalars["ID"];
  testLength: Scalars["Int"];
}>;

export type UpdateDeviceTypeMutation = {
  __typename?: "Mutation";
  updateDeviceType?:
    | { __typename?: "DeviceType"; internalId: string }
    | null
    | undefined;
};

export type GetDeviceTypeListQueryVariables = Exact<{ [key: string]: never }>;

export type GetDeviceTypeListQuery = {
  __typename?: "Query";
  deviceTypes: Array<{
    __typename?: "DeviceType";
    internalId: string;
    name: string;
    loincCode: string;
    manufacturer: string;
    model: string;
    testLength?: number | null | undefined;
    swabTypes: Array<{
      __typename?: "SpecimenType";
      internalId: string;
      name: string;
    }>;
    supportedDiseases: Array<{
      __typename?: "SupportedDisease";
      internalId: string;
      name: string;
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

export type GetPendingOrganizationsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetPendingOrganizationsQuery = {
  __typename?: "Query";
  pendingOrganizations: Array<{
    __typename?: "PendingOrganization";
    externalId: string;
    name: string;
    adminFirstName?: string | null | undefined;
    adminLastName?: string | null | undefined;
    adminEmail?: string | null | undefined;
    adminPhone?: string | null | undefined;
    createdAt: any;
  }>;
};

export type SetOrgIdentityVerifiedMutationVariables = Exact<{
  externalId: Scalars["String"];
  verified: Scalars["Boolean"];
}>;

export type SetOrgIdentityVerifiedMutation = {
  __typename?: "Mutation";
  setOrganizationIdentityVerified?: boolean | null | undefined;
};

export type MarkPendingOrganizationAsDeletedMutationVariables = Exact<{
  orgExternalId: Scalars["String"];
  deleted: Scalars["Boolean"];
}>;

export type MarkPendingOrganizationAsDeletedMutation = {
  __typename?: "Mutation";
  markPendingOrganizationAsDeleted?: string | null | undefined;
};

export type EditPendingOrganizationMutationVariables = Exact<{
  externalId: Scalars["String"];
  name?: InputMaybe<Scalars["String"]>;
  adminFirstName?: InputMaybe<Scalars["String"]>;
  adminLastName?: InputMaybe<Scalars["String"]>;
  adminEmail?: InputMaybe<Scalars["String"]>;
  adminPhone?: InputMaybe<Scalars["String"]>;
}>;

export type EditPendingOrganizationMutation = {
  __typename?: "Mutation";
  editPendingOrganization?: string | null | undefined;
};

export type GetOrganizationsQueryVariables = Exact<{
  identityVerified?: InputMaybe<Scalars["Boolean"]>;
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
  organizationExternalId?: InputMaybe<Scalars["String"]>;
  justification?: InputMaybe<Scalars["String"]>;
}>;

export type SetCurrentUserTenantDataAccessOpMutation = {
  __typename?: "Mutation";
  setCurrentUserTenantDataAccess?:
    | {
        __typename?: "User";
        id: string;
        email: string;
        permissions: Array<UserPermission>;
        role?: Role | null | undefined;
        organization?:
          | { __typename?: "Organization"; name: string; externalId: string }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetFacilityQueueMultiplexQueryVariables = Exact<{
  facilityId: Scalars["ID"];
}>;

export type GetFacilityQueueMultiplexQuery = {
  __typename?: "Query";
  queue?:
    | Array<
        | {
            __typename?: "TestOrder";
            internalId?: string | null | undefined;
            pregnancy?: string | null | undefined;
            dateAdded?: string | null | undefined;
            symptoms?: string | null | undefined;
            symptomOnset?: any | null | undefined;
            noSymptoms?: boolean | null | undefined;
            dateTested?: any | null | undefined;
            correctionStatus?: string | null | undefined;
            reasonForCorrection?: string | null | undefined;
            deviceType?:
              | {
                  __typename?: "DeviceType";
                  internalId: string;
                  name: string;
                  model: string;
                  testLength?: number | null | undefined;
                }
              | null
              | undefined;
            deviceSpecimenType?:
              | { __typename?: "DeviceSpecimenType"; internalId: string }
              | null
              | undefined;
            patient?:
              | {
                  __typename?: "Patient";
                  internalId?: string | null | undefined;
                  telephone?: string | null | undefined;
                  birthDate?: any | null | undefined;
                  firstName?: string | null | undefined;
                  middleName?: string | null | undefined;
                  lastName?: string | null | undefined;
                  gender?: string | null | undefined;
                  testResultDelivery?:
                    | TestResultDeliveryPreference
                    | null
                    | undefined;
                  preferredLanguage?: string | null | undefined;
                  email?: string | null | undefined;
                  emails?: Array<string | null | undefined> | null | undefined;
                  phoneNumbers?:
                    | Array<
                        | {
                            __typename?: "PhoneNumber";
                            type?: PhoneType | null | undefined;
                            number?: string | null | undefined;
                          }
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                }
              | null
              | undefined;
            results?:
              | Array<
                  | {
                      __typename?: "MultiplexResult";
                      testResult?: string | null | undefined;
                      disease?:
                        | { __typename?: "SupportedDisease"; name: string }
                        | null
                        | undefined;
                    }
                  | null
                  | undefined
                >
              | null
              | undefined;
          }
        | null
        | undefined
      >
    | null
    | undefined;
  organization?:
    | {
        __typename?: "Organization";
        testingFacility: Array<{
          __typename?: "Facility";
          id: string;
          defaultDeviceSpecimen?: string | null | undefined;
          deviceTypes?:
            | Array<
                | {
                    __typename?: "DeviceType";
                    internalId: string;
                    name: string;
                    model: string;
                    testLength?: number | null | undefined;
                  }
                | null
                | undefined
              >
            | null
            | undefined;
        }>;
      }
    | null
    | undefined;
  deviceSpecimenTypes?:
    | Array<
        | {
            __typename?: "DeviceSpecimenType";
            internalId: string;
            deviceType: {
              __typename?: "DeviceType";
              internalId: string;
              name: string;
              testLength?: number | null | undefined;
              supportedDiseases: Array<{
                __typename?: "SupportedDisease";
                name: string;
              }>;
            };
            specimenType: {
              __typename?: "SpecimenType";
              internalId: string;
              name: string;
            };
          }
        | null
        | undefined
      >
    | null
    | undefined;
};

export type GetPatientQueryVariables = Exact<{
  internalId: Scalars["ID"];
}>;

export type GetPatientQuery = {
  __typename?: "Query";
  patient?:
    | {
        __typename?: "Patient";
        internalId?: string | null | undefined;
        firstName?: string | null | undefined;
        lastName?: string | null | undefined;
        middleName?: string | null | undefined;
        birthDate?: any | null | undefined;
        gender?: string | null | undefined;
        telephone?: string | null | undefined;
        emails?: Array<string | null | undefined> | null | undefined;
        testResultDelivery?: TestResultDeliveryPreference | null | undefined;
        phoneNumbers?:
          | Array<
              | {
                  __typename?: "PhoneNumber";
                  type?: PhoneType | null | undefined;
                  number?: string | null | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetPatientsByFacilityForQueueQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  namePrefixMatch?: InputMaybe<Scalars["String"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]>;
  includeArchivedFacilities?: InputMaybe<Scalars["Boolean"]>;
}>;

export type GetPatientsByFacilityForQueueQuery = {
  __typename?: "Query";
  patients?:
    | Array<
        | {
            __typename?: "Patient";
            internalId?: string | null | undefined;
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
            middleName?: string | null | undefined;
            birthDate?: any | null | undefined;
            gender?: string | null | undefined;
            telephone?: string | null | undefined;
            email?: string | null | undefined;
            emails?: Array<string | null | undefined> | null | undefined;
            testResultDelivery?:
              | TestResultDeliveryPreference
              | null
              | undefined;
            phoneNumbers?:
              | Array<
                  | {
                      __typename?: "PhoneNumber";
                      type?: PhoneType | null | undefined;
                      number?: string | null | undefined;
                    }
                  | null
                  | undefined
                >
              | null
              | undefined;
          }
        | null
        | undefined
      >
    | null
    | undefined;
};

export type AddPatientToQueueMutationVariables = Exact<{
  facilityId: Scalars["ID"];
  patientId: Scalars["ID"];
  symptoms?: InputMaybe<Scalars["String"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]>;
  pregnancy?: InputMaybe<Scalars["String"]>;
  noSymptoms?: InputMaybe<Scalars["Boolean"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
}>;

export type AddPatientToQueueMutation = {
  __typename?: "Mutation";
  addPatientToQueue?: string | null | undefined;
};

export type UpdateAoeMutationVariables = Exact<{
  patientId: Scalars["ID"];
  symptoms?: InputMaybe<Scalars["String"]>;
  symptomOnset?: InputMaybe<Scalars["LocalDate"]>;
  pregnancy?: InputMaybe<Scalars["String"]>;
  noSymptoms?: InputMaybe<Scalars["Boolean"]>;
  testResultDelivery?: InputMaybe<TestResultDeliveryPreference>;
}>;

export type UpdateAoeMutation = {
  __typename?: "Mutation";
  updateTimeOfTestQuestions?: string | null | undefined;
};

export type RemovePatientFromQueueMutationVariables = Exact<{
  patientId: Scalars["ID"];
}>;

export type RemovePatientFromQueueMutation = {
  __typename?: "Mutation";
  removePatientFromQueue?: string | null | undefined;
};

export type EditQueueItemMultiplexResultMutationVariables = Exact<{
  id: Scalars["ID"];
  deviceId?: InputMaybe<Scalars["String"]>;
  deviceSpecimenType?: InputMaybe<Scalars["ID"]>;
  results?: InputMaybe<
    Array<InputMaybe<MultiplexResultInput>> | InputMaybe<MultiplexResultInput>
  >;
  dateTested?: InputMaybe<Scalars["DateTime"]>;
}>;

export type EditQueueItemMultiplexResultMutation = {
  __typename?: "Mutation";
  editQueueItemMultiplexResult?:
    | {
        __typename?: "TestOrder";
        dateTested?: any | null | undefined;
        results?:
          | Array<
              | {
                  __typename?: "MultiplexResult";
                  testResult?: string | null | undefined;
                  disease?:
                    | { __typename?: "SupportedDisease"; name: string }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
        deviceType?:
          | {
              __typename?: "DeviceType";
              internalId: string;
              testLength?: number | null | undefined;
            }
          | null
          | undefined;
        deviceSpecimenType?:
          | {
              __typename?: "DeviceSpecimenType";
              internalId: string;
              deviceType: {
                __typename?: "DeviceType";
                internalId: string;
                testLength?: number | null | undefined;
              };
              specimenType: { __typename?: "SpecimenType"; internalId: string };
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type AddMultiplexResultMutationVariables = Exact<{
  patientId: Scalars["ID"];
  deviceId: Scalars["String"];
  deviceSpecimenType?: InputMaybe<Scalars["ID"]>;
  results:
    | Array<InputMaybe<MultiplexResultInput>>
    | InputMaybe<MultiplexResultInput>;
  dateTested?: InputMaybe<Scalars["DateTime"]>;
}>;

export type AddMultiplexResultMutation = {
  __typename?: "Mutation";
  addMultiplexResult?:
    | {
        __typename?: "AddTestResultResponse";
        deliverySuccess?: boolean | null | undefined;
        testResult: {
          __typename?: "TestOrder";
          internalId?: string | null | undefined;
        };
      }
    | null
    | undefined;
};

export type GetTestResultForCorrectionQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForCorrectionQuery = {
  __typename?: "Query";
  testResult?:
    | {
        __typename?: "TestResult";
        dateTested?: any | null | undefined;
        correctionStatus?: string | null | undefined;
        results?:
          | Array<
              | {
                  __typename?: "MultiplexResult";
                  testResult?: string | null | undefined;
                  disease?:
                    | { __typename?: "SupportedDisease"; name: string }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
        deviceType?:
          | { __typename?: "DeviceType"; name: string }
          | null
          | undefined;
        patient?:
          | {
              __typename?: "Patient";
              firstName?: string | null | undefined;
              middleName?: string | null | undefined;
              lastName?: string | null | undefined;
              birthDate?: any | null | undefined;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type MarkTestAsErrorMutationVariables = Exact<{
  id: Scalars["ID"];
  reason: Scalars["String"];
}>;

export type MarkTestAsErrorMutation = {
  __typename?: "Mutation";
  correctTestMarkAsError?:
    | { __typename?: "TestResult"; internalId?: string | null | undefined }
    | null
    | undefined;
};

export type MarkTestAsCorrectionMutationVariables = Exact<{
  id: Scalars["ID"];
  reason: Scalars["String"];
}>;

export type MarkTestAsCorrectionMutation = {
  __typename?: "Mutation";
  correctTestMarkAsCorrection?:
    | { __typename?: "TestResult"; internalId?: string | null | undefined }
    | null
    | undefined;
};

export type GetTestResultDetailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultDetailsQuery = {
  __typename?: "Query";
  testResult?:
    | {
        __typename?: "TestResult";
        dateTested?: any | null | undefined;
        correctionStatus?: string | null | undefined;
        symptoms?: string | null | undefined;
        symptomOnset?: any | null | undefined;
        pregnancy?: string | null | undefined;
        results?:
          | Array<
              | {
                  __typename?: "MultiplexResult";
                  testResult?: string | null | undefined;
                  disease?:
                    | { __typename?: "SupportedDisease"; name: string }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
        deviceType?:
          | { __typename?: "DeviceType"; name: string }
          | null
          | undefined;
        patient?:
          | {
              __typename?: "Patient";
              firstName?: string | null | undefined;
              middleName?: string | null | undefined;
              lastName?: string | null | undefined;
              birthDate?: any | null | undefined;
            }
          | null
          | undefined;
        createdBy?:
          | {
              __typename?: "ApiUser";
              name: {
                __typename?: "NameInfo";
                firstName?: string | null | undefined;
                middleName?: string | null | undefined;
                lastName: string;
              };
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetTestResultForTextQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForTextQuery = {
  __typename?: "Query";
  testResult?:
    | {
        __typename?: "TestResult";
        dateTested?: any | null | undefined;
        patient?:
          | {
              __typename?: "Patient";
              firstName?: string | null | undefined;
              middleName?: string | null | undefined;
              lastName?: string | null | undefined;
              birthDate?: any | null | undefined;
              phoneNumbers?:
                | Array<
                    | {
                        __typename?: "PhoneNumber";
                        type?: PhoneType | null | undefined;
                        number?: string | null | undefined;
                      }
                    | null
                    | undefined
                  >
                | null
                | undefined;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type SendSmsMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type SendSmsMutation = {
  __typename?: "Mutation";
  sendPatientLinkSmsByTestEventId?: boolean | null | undefined;
};

export type GetTestResultForResendingEmailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForResendingEmailsQuery = {
  __typename?: "Query";
  testResult?:
    | {
        __typename?: "TestResult";
        dateTested?: any | null | undefined;
        patient?:
          | {
              __typename?: "Patient";
              firstName?: string | null | undefined;
              middleName?: string | null | undefined;
              lastName?: string | null | undefined;
              email?: string | null | undefined;
              emails?: Array<string | null | undefined> | null | undefined;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type ResendTestResultsEmailMutationVariables = Exact<{
  testEventId: Scalars["ID"];
}>;

export type ResendTestResultsEmailMutation = {
  __typename?: "Mutation";
  sendPatientLinkEmailByTestEventId?: boolean | null | undefined;
};

export type GetFacilityResultsForCsvWithCountQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
}>;

export type GetFacilityResultsForCsvWithCountQuery = {
  __typename?: "Query";
  testResultsPage?:
    | {
        __typename?: "TestResultsPage";
        totalElements?: number | null | undefined;
        content?:
          | Array<
              | {
                  __typename?: "TestResult";
                  dateTested?: any | null | undefined;
                  dateUpdated?: any | null | undefined;
                  correctionStatus?: string | null | undefined;
                  reasonForCorrection?: string | null | undefined;
                  symptoms?: string | null | undefined;
                  noSymptoms?: boolean | null | undefined;
                  symptomOnset?: any | null | undefined;
                  facility?:
                    | {
                        __typename?: "Facility";
                        name: string;
                        isDeleted?: boolean | null | undefined;
                      }
                    | null
                    | undefined;
                  results?:
                    | Array<
                        | {
                            __typename?: "MultiplexResult";
                            testResult?: string | null | undefined;
                            disease?:
                              | {
                                  __typename?: "SupportedDisease";
                                  name: string;
                                }
                              | null
                              | undefined;
                          }
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  deviceType?:
                    | {
                        __typename?: "DeviceType";
                        name: string;
                        manufacturer: string;
                        model: string;
                        swabType?: string | null | undefined;
                      }
                    | null
                    | undefined;
                  patient?:
                    | {
                        __typename?: "Patient";
                        firstName?: string | null | undefined;
                        middleName?: string | null | undefined;
                        lastName?: string | null | undefined;
                        birthDate?: any | null | undefined;
                        gender?: string | null | undefined;
                        race?: string | null | undefined;
                        ethnicity?: string | null | undefined;
                        tribalAffiliation?:
                          | Array<string | null | undefined>
                          | null
                          | undefined;
                        lookupId?: string | null | undefined;
                        telephone?: string | null | undefined;
                        email?: string | null | undefined;
                        street?: string | null | undefined;
                        streetTwo?: string | null | undefined;
                        city?: string | null | undefined;
                        county?: string | null | undefined;
                        state?: string | null | undefined;
                        zipCode?: string | null | undefined;
                        country?: string | null | undefined;
                        role?: string | null | undefined;
                        residentCongregateSetting?: boolean | null | undefined;
                        employedInHealthcare?: boolean | null | undefined;
                        preferredLanguage?: string | null | undefined;
                      }
                    | null
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: "ApiUser";
                        nameInfo?:
                          | {
                              __typename?: "NameInfo";
                              firstName?: string | null | undefined;
                              middleName?: string | null | undefined;
                              lastName: string;
                            }
                          | null
                          | undefined;
                      }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetFacilityResultsMultiplexWithCountQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
}>;

export type GetFacilityResultsMultiplexWithCountQuery = {
  __typename?: "Query";
  testResultsPage?:
    | {
        __typename?: "TestResultsPage";
        totalElements?: number | null | undefined;
        content?:
          | Array<
              | {
                  __typename?: "TestResult";
                  internalId?: string | null | undefined;
                  dateTested?: any | null | undefined;
                  correctionStatus?: string | null | undefined;
                  results?:
                    | Array<
                        | {
                            __typename?: "MultiplexResult";
                            testResult?: string | null | undefined;
                            disease?:
                              | {
                                  __typename?: "SupportedDisease";
                                  name: string;
                                }
                              | null
                              | undefined;
                          }
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  deviceType?:
                    | {
                        __typename?: "DeviceType";
                        internalId: string;
                        name: string;
                      }
                    | null
                    | undefined;
                  patient?:
                    | {
                        __typename?: "Patient";
                        internalId?: string | null | undefined;
                        firstName?: string | null | undefined;
                        middleName?: string | null | undefined;
                        lastName?: string | null | undefined;
                        birthDate?: any | null | undefined;
                        gender?: string | null | undefined;
                        lookupId?: string | null | undefined;
                        email?: string | null | undefined;
                        phoneNumbers?:
                          | Array<
                              | {
                                  __typename?: "PhoneNumber";
                                  type?: PhoneType | null | undefined;
                                  number?: string | null | undefined;
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                      }
                    | null
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: "ApiUser";
                        nameInfo?:
                          | {
                              __typename?: "NameInfo";
                              firstName?: string | null | undefined;
                              lastName: string;
                            }
                          | null
                          | undefined;
                      }
                    | null
                    | undefined;
                  patientLink?:
                    | {
                        __typename?: "PatientLink";
                        internalId?: string | null | undefined;
                      }
                    | null
                    | undefined;
                  facility?:
                    | { __typename?: "Facility"; name: string }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetAllFacilitiesQueryVariables = Exact<{
  showArchived?: InputMaybe<Scalars["Boolean"]>;
}>;

export type GetAllFacilitiesQuery = {
  __typename?: "Query";
  facilities?:
    | Array<
        | {
            __typename?: "Facility";
            id: string;
            name: string;
            isDeleted?: boolean | null | undefined;
          }
        | null
        | undefined
      >
    | null
    | undefined;
};

export type GetResultsCountByFacilityQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars["ID"]>;
  patientId?: InputMaybe<Scalars["ID"]>;
  result?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["DateTime"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
}>;

export type GetResultsCountByFacilityQuery = {
  __typename?: "Query";
  testResultsCount?: number | null | undefined;
};

export type GetTestResultForPrintQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTestResultForPrintQuery = {
  __typename?: "Query";
  testResult?:
    | {
        __typename?: "TestResult";
        dateTested?: any | null | undefined;
        correctionStatus?: string | null | undefined;
        results?:
          | Array<
              | {
                  __typename?: "MultiplexResult";
                  testResult?: string | null | undefined;
                  disease?:
                    | { __typename?: "SupportedDisease"; name: string }
                    | null
                    | undefined;
                }
              | null
              | undefined
            >
          | null
          | undefined;
        deviceType?:
          | { __typename?: "DeviceType"; name: string; model: string }
          | null
          | undefined;
        patient?:
          | {
              __typename?: "Patient";
              firstName?: string | null | undefined;
              middleName?: string | null | undefined;
              lastName?: string | null | undefined;
              birthDate?: any | null | undefined;
            }
          | null
          | undefined;
        facility?:
          | {
              __typename?: "Facility";
              name: string;
              cliaNumber?: string | null | undefined;
              phone?: string | null | undefined;
              street?: string | null | undefined;
              streetTwo?: string | null | undefined;
              city?: string | null | undefined;
              state?: string | null | undefined;
              zipCode?: string | null | undefined;
              orderingProvider?:
                | {
                    __typename?: "Provider";
                    firstName?: string | null | undefined;
                    middleName?: string | null | undefined;
                    lastName?: string | null | undefined;
                    NPI?: string | null | undefined;
                  }
                | null
                | undefined;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetUploadSubmissionQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetUploadSubmissionQuery = {
  __typename?: "Query";
  uploadSubmission: {
    __typename?: "UploadResponse";
    reportId: string;
    createdAt: any;
    status: UploadStatus;
    recordsCount: number;
    warnings?:
      | Array<
          | {
              __typename?: "FeedbackMessage";
              message?: string | null | undefined;
              scope?: string | null | undefined;
            }
          | null
          | undefined
        >
      | null
      | undefined;
    errors?:
      | Array<
          | {
              __typename?: "FeedbackMessage";
              message?: string | null | undefined;
              scope?: string | null | undefined;
            }
          | null
          | undefined
        >
      | null
      | undefined;
  };
};

export type GetUploadSubmissionsQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars["DateTime"]>;
  endDate?: InputMaybe<Scalars["DateTime"]>;
  pageNumber?: InputMaybe<Scalars["Int"]>;
  pageSize?: InputMaybe<Scalars["Int"]>;
}>;

export type GetUploadSubmissionsQuery = {
  __typename?: "Query";
  uploadSubmissions: {
    __typename?: "UploadSubmissionPage";
    totalElements: number;
    content: Array<{
      __typename?: "UploadResult";
      internalId: string;
      reportId?: string | null | undefined;
      createdAt: any;
      status: UploadStatus;
      recordsCount: number;
      errors?:
        | Array<
            | {
                __typename?: "FeedbackMessage";
                message?: string | null | undefined;
                scope?: string | null | undefined;
              }
            | null
            | undefined
          >
        | null
        | undefined;
      warnings?:
        | Array<
            | {
                __typename?: "FeedbackMessage";
                message?: string | null | undefined;
                scope?: string | null | undefined;
              }
            | null
            | undefined
          >
        | null
        | undefined;
    }>;
  };
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
    loincCode: string;
    manufacturer: string;
    model: string;
    swabTypes: Array<{
      __typename?: "SpecimenType";
      internalId: string;
      name: string;
      typeCode: string;
    }>;
    supportedDiseases: Array<{ __typename?: "SupportedDisease"; name: string }>;
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
    deviceTypes {
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
    $devices: [ID]!
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
      deviceIds: $devices
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
      deviceIds: $devices
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
export const GetManagedFacilitiesDocument = gql`
  query GetManagedFacilities {
    organization {
      facilities {
        id
        cliaNumber
        name
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
export type AddUserToCurrentOrgMutationResult =
  Apollo.MutationResult<AddUserToCurrentOrgMutation>;
export type AddUserToCurrentOrgMutationOptions = Apollo.BaseMutationOptions<
  AddUserToCurrentOrgMutation,
  AddUserToCurrentOrgMutationVariables
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
export const GetTopLevelDashboardMetricsNewDocument = gql`
  query GetTopLevelDashboardMetricsNew(
    $facilityId: ID
    $startDate: DateTime
    $endDate: DateTime
  ) {
    topLevelDashboardMetrics(
      facilityId: $facilityId
      startDate: $startDate
      endDate: $endDate
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
export type GetTopLevelDashboardMetricsNewQueryHookResult = ReturnType<
  typeof useGetTopLevelDashboardMetricsNewQuery
>;
export type GetTopLevelDashboardMetricsNewLazyQueryHookResult = ReturnType<
  typeof useGetTopLevelDashboardMetricsNewLazyQuery
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
    $emails: [String]
    $county: String
    $country: String
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
      emails: $emails
      county: $county
      country: $country
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
 *      emails: // value for 'emails'
 *      county: // value for 'county'
 *      country: // value for 'country'
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
export type UpdatePatientMutationResult =
  Apollo.MutationResult<UpdatePatientMutation>;
export type UpdatePatientMutationOptions = Apollo.BaseMutationOptions<
  UpdatePatientMutation,
  UpdatePatientMutationVariables
>;
export const GetPatientsCountByFacilityDocument = gql`
  query GetPatientsCountByFacility(
    $facilityId: ID!
    $includeArchived: Boolean!
    $namePrefixMatch: String
  ) {
    patientsCount(
      facilityId: $facilityId
      includeArchived: $includeArchived
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
 *      includeArchived: // value for 'includeArchived'
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
    $includeArchived: Boolean
    $namePrefixMatch: String
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      includeArchived: $includeArchived
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
 *      includeArchived: // value for 'includeArchived'
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
    $loincCode: String!
    $swabTypes: [ID!]!
    $supportedDiseases: [ID!]!
    $testLength: Int!
  ) {
    createDeviceType(
      input: {
        name: $name
        manufacturer: $manufacturer
        model: $model
        loincCode: $loincCode
        swabTypes: $swabTypes
        supportedDiseases: $supportedDiseases
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
 *      loincCode: // value for 'loincCode'
 *      swabTypes: // value for 'swabTypes'
 *      supportedDiseases: // value for 'supportedDiseases'
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
    $loincCode: String!
    $swabTypes: [ID!]!
    $supportedDiseases: [ID!]!
    $testLength: Int!
  ) {
    updateDeviceType(
      input: {
        internalId: $internalId
        name: $name
        manufacturer: $manufacturer
        model: $model
        loincCode: $loincCode
        swabTypes: $swabTypes
        supportedDiseases: $supportedDiseases
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
 *      loincCode: // value for 'loincCode'
 *      swabTypes: // value for 'swabTypes'
 *      supportedDiseases: // value for 'supportedDiseases'
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
      loincCode
      manufacturer
      model
      testLength
      swabTypes {
        internalId
        name
      }
      supportedDiseases {
        internalId
        name
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
export type GetDeviceTypeListQueryHookResult = ReturnType<
  typeof useGetDeviceTypeListQuery
>;
export type GetDeviceTypeListLazyQueryHookResult = ReturnType<
  typeof useGetDeviceTypeListLazyQuery
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
export type GetSpecimenTypesQueryHookResult = ReturnType<
  typeof useGetSpecimenTypesQuery
>;
export type GetSpecimenTypesLazyQueryHookResult = ReturnType<
  typeof useGetSpecimenTypesLazyQuery
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
export type GetSupportedDiseasesQueryHookResult = ReturnType<
  typeof useGetSupportedDiseasesQuery
>;
export type GetSupportedDiseasesLazyQueryHookResult = ReturnType<
  typeof useGetSupportedDiseasesLazyQuery
>;
export type GetSupportedDiseasesQueryResult = Apollo.QueryResult<
  GetSupportedDiseasesQuery,
  GetSupportedDiseasesQueryVariables
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
export type GetPendingOrganizationsQueryHookResult = ReturnType<
  typeof useGetPendingOrganizationsQuery
>;
export type GetPendingOrganizationsLazyQueryHookResult = ReturnType<
  typeof useGetPendingOrganizationsLazyQuery
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
export const GetFacilityQueueMultiplexDocument = gql`
  query GetFacilityQueueMultiplex($facilityId: ID!) {
    queue(facilityId: $facilityId) {
      internalId
      pregnancy
      dateAdded
      symptoms
      symptomOnset
      noSymptoms
      deviceType {
        internalId
        name
        model
        testLength
      }
      deviceSpecimenType {
        internalId
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
        defaultDeviceSpecimen
      }
    }
    deviceSpecimenTypes {
      internalId
      deviceType {
        internalId
        name
        testLength
        supportedDiseases {
          name
        }
      }
      specimenType {
        internalId
        name
      }
    }
  }
`;

/**
 * __useGetFacilityQueueMultiplexQuery__
 *
 * To run a query within a React component, call `useGetFacilityQueueMultiplexQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityQueueMultiplexQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityQueueMultiplexQuery({
 *   variables: {
 *      facilityId: // value for 'facilityId'
 *   },
 * });
 */
export function useGetFacilityQueueMultiplexQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFacilityQueueMultiplexQuery,
    GetFacilityQueueMultiplexQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilityQueueMultiplexQuery,
    GetFacilityQueueMultiplexQueryVariables
  >(GetFacilityQueueMultiplexDocument, options);
}
export function useGetFacilityQueueMultiplexLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityQueueMultiplexQuery,
    GetFacilityQueueMultiplexQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityQueueMultiplexQuery,
    GetFacilityQueueMultiplexQueryVariables
  >(GetFacilityQueueMultiplexDocument, options);
}
export type GetFacilityQueueMultiplexQueryHookResult = ReturnType<
  typeof useGetFacilityQueueMultiplexQuery
>;
export type GetFacilityQueueMultiplexLazyQueryHookResult = ReturnType<
  typeof useGetFacilityQueueMultiplexLazyQuery
>;
export type GetFacilityQueueMultiplexQueryResult = Apollo.QueryResult<
  GetFacilityQueueMultiplexQuery,
  GetFacilityQueueMultiplexQueryVariables
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
    $facilityId: ID
    $namePrefixMatch: String
    $includeArchived: Boolean = false
    $includeArchivedFacilities: Boolean
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: 0
      pageSize: 100
      includeArchived: $includeArchived
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
 *      includeArchived: // value for 'includeArchived'
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
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
      pregnancy: $pregnancy
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
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
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
export const EditQueueItemMultiplexResultDocument = gql`
  mutation EditQueueItemMultiplexResult(
    $id: ID!
    $deviceId: String
    $deviceSpecimenType: ID
    $results: [MultiplexResultInput]
    $dateTested: DateTime
  ) {
    editQueueItemMultiplexResult(
      id: $id
      deviceId: $deviceId
      deviceSpecimenType: $deviceSpecimenType
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
      deviceSpecimenType {
        internalId
        deviceType {
          internalId
          testLength
        }
        specimenType {
          internalId
        }
      }
    }
  }
`;
export type EditQueueItemMultiplexResultMutationFn = Apollo.MutationFunction<
  EditQueueItemMultiplexResultMutation,
  EditQueueItemMultiplexResultMutationVariables
>;

/**
 * __useEditQueueItemMultiplexResultMutation__
 *
 * To run a mutation, you first call `useEditQueueItemMultiplexResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditQueueItemMultiplexResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editQueueItemMultiplexResultMutation, { data, loading, error }] = useEditQueueItemMultiplexResultMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deviceId: // value for 'deviceId'
 *      deviceSpecimenType: // value for 'deviceSpecimenType'
 *      results: // value for 'results'
 *      dateTested: // value for 'dateTested'
 *   },
 * });
 */
export function useEditQueueItemMultiplexResultMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditQueueItemMultiplexResultMutation,
    EditQueueItemMultiplexResultMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditQueueItemMultiplexResultMutation,
    EditQueueItemMultiplexResultMutationVariables
  >(EditQueueItemMultiplexResultDocument, options);
}
export type EditQueueItemMultiplexResultMutationHookResult = ReturnType<
  typeof useEditQueueItemMultiplexResultMutation
>;
export type EditQueueItemMultiplexResultMutationResult =
  Apollo.MutationResult<EditQueueItemMultiplexResultMutation>;
export type EditQueueItemMultiplexResultMutationOptions =
  Apollo.BaseMutationOptions<
    EditQueueItemMultiplexResultMutation,
    EditQueueItemMultiplexResultMutationVariables
  >;
export const AddMultiplexResultDocument = gql`
  mutation AddMultiplexResult(
    $patientId: ID!
    $deviceId: String!
    $deviceSpecimenType: ID
    $results: [MultiplexResultInput]!
    $dateTested: DateTime
  ) {
    addMultiplexResult(
      patientId: $patientId
      deviceId: $deviceId
      deviceSpecimenType: $deviceSpecimenType
      results: $results
      dateTested: $dateTested
    ) {
      testResult {
        internalId
      }
      deliverySuccess
    }
  }
`;
export type AddMultiplexResultMutationFn = Apollo.MutationFunction<
  AddMultiplexResultMutation,
  AddMultiplexResultMutationVariables
>;

/**
 * __useAddMultiplexResultMutation__
 *
 * To run a mutation, you first call `useAddMultiplexResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMultiplexResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMultiplexResultMutation, { data, loading, error }] = useAddMultiplexResultMutation({
 *   variables: {
 *      patientId: // value for 'patientId'
 *      deviceId: // value for 'deviceId'
 *      deviceSpecimenType: // value for 'deviceSpecimenType'
 *      results: // value for 'results'
 *      dateTested: // value for 'dateTested'
 *   },
 * });
 */
export function useAddMultiplexResultMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddMultiplexResultMutation,
    AddMultiplexResultMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddMultiplexResultMutation,
    AddMultiplexResultMutationVariables
  >(AddMultiplexResultDocument, options);
}
export type AddMultiplexResultMutationHookResult = ReturnType<
  typeof useAddMultiplexResultMutation
>;
export type AddMultiplexResultMutationResult =
  Apollo.MutationResult<AddMultiplexResultMutation>;
export type AddMultiplexResultMutationOptions = Apollo.BaseMutationOptions<
  AddMultiplexResultMutation,
  AddMultiplexResultMutationVariables
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
export const GetTestResultDetailsDocument = gql`
  query getTestResultDetails($id: ID!) {
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
  >
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
export type GetTestResultForTextQueryHookResult = ReturnType<
  typeof useGetTestResultForTextQuery
>;
export type GetTestResultForTextLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForTextLazyQuery
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
  >
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
export type GetTestResultForResendingEmailsQueryHookResult = ReturnType<
  typeof useGetTestResultForResendingEmailsQuery
>;
export type GetTestResultForResendingEmailsLazyQueryHookResult = ReturnType<
  typeof useGetTestResultForResendingEmailsLazyQuery
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
          swabType
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
export type GetFacilityResultsForCsvWithCountQueryHookResult = ReturnType<
  typeof useGetFacilityResultsForCsvWithCountQuery
>;
export type GetFacilityResultsForCsvWithCountLazyQueryHookResult = ReturnType<
  typeof useGetFacilityResultsForCsvWithCountLazyQuery
>;
export type GetFacilityResultsForCsvWithCountQueryResult = Apollo.QueryResult<
  GetFacilityResultsForCsvWithCountQuery,
  GetFacilityResultsForCsvWithCountQueryVariables
>;
export const GetFacilityResultsMultiplexWithCountDocument = gql`
  query GetFacilityResultsMultiplexWithCount(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
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
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      content {
        internalId
        dateTested
        results {
          disease {
            name
          }
          testResult
        }
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
          email
          phoneNumbers {
            type
            number
          }
        }
        createdBy {
          nameInfo {
            firstName
            lastName
          }
        }
        patientLink {
          internalId
        }
        facility {
          name
        }
      }
      totalElements
    }
  }
`;

/**
 * __useGetFacilityResultsMultiplexWithCountQuery__
 *
 * To run a query within a React component, call `useGetFacilityResultsMultiplexWithCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacilityResultsMultiplexWithCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacilityResultsMultiplexWithCountQuery({
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
export function useGetFacilityResultsMultiplexWithCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacilityResultsMultiplexWithCountQuery,
    GetFacilityResultsMultiplexWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacilityResultsMultiplexWithCountQuery,
    GetFacilityResultsMultiplexWithCountQueryVariables
  >(GetFacilityResultsMultiplexWithCountDocument, options);
}
export function useGetFacilityResultsMultiplexWithCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacilityResultsMultiplexWithCountQuery,
    GetFacilityResultsMultiplexWithCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacilityResultsMultiplexWithCountQuery,
    GetFacilityResultsMultiplexWithCountQueryVariables
  >(GetFacilityResultsMultiplexWithCountDocument, options);
}
export type GetFacilityResultsMultiplexWithCountQueryHookResult = ReturnType<
  typeof useGetFacilityResultsMultiplexWithCountQuery
>;
export type GetFacilityResultsMultiplexWithCountLazyQueryHookResult =
  ReturnType<typeof useGetFacilityResultsMultiplexWithCountLazyQuery>;
export type GetFacilityResultsMultiplexWithCountQueryResult =
  Apollo.QueryResult<
    GetFacilityResultsMultiplexWithCountQuery,
    GetFacilityResultsMultiplexWithCountQueryVariables
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
export type GetAllFacilitiesQueryHookResult = ReturnType<
  typeof useGetAllFacilitiesQuery
>;
export type GetAllFacilitiesLazyQueryHookResult = ReturnType<
  typeof useGetAllFacilitiesLazyQuery
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
  >
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
export type GetUploadSubmissionQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionQuery
>;
export type GetUploadSubmissionLazyQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionLazyQuery
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
export type GetUploadSubmissionsQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionsQuery
>;
export type GetUploadSubmissionsLazyQueryHookResult = ReturnType<
  typeof useGetUploadSubmissionsLazyQuery
>;
export type GetUploadSubmissionsQueryResult = Apollo.QueryResult<
  GetUploadSubmissionsQuery,
  GetUploadSubmissionsQueryVariables
>;
export const GetDeviceTypesForLookupDocument = gql`
  query getDeviceTypesForLookup {
    deviceTypes {
      internalId
      name
      loincCode
      manufacturer
      model
      swabTypes {
        internalId
        name
        typeCode
      }
      supportedDiseases {
        name
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
export type GetDeviceTypesForLookupQueryHookResult = ReturnType<
  typeof useGetDeviceTypesForLookupQuery
>;
export type GetDeviceTypesForLookupLazyQueryHookResult = ReturnType<
  typeof useGetDeviceTypesForLookupLazyQuery
>;
export type GetDeviceTypesForLookupQueryResult = Apollo.QueryResult<
  GetDeviceTypesForLookupQuery,
  GetDeviceTypesForLookupQueryVariables
>;

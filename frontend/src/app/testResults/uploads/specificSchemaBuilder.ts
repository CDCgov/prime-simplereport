import { validate } from "uuid";

import { MULTIPLEX_DISEASES } from "../constants";

import { CsvSchemaItem } from "./CsvSchemaDocumentation";

export interface CsvSchema {
  fields: Field[];
}

export interface Field {
  sections: Section[];
}

export interface Section {
  title: string;
  slug: string;
  items: CsvSchemaItem[];
  tabs?: Section[];
}

export enum RequiredStatusTag {
  REQUIRED = "Required",
  REQUIRED_FOR_POSITIVES = "Required for Positives",
  OPTIONAL = "Optional",
}

const aoeDocumententationItems: Record<string, CsvSchemaItem> = {
  pregnant: {
    name: "Pregnant",
    colHeader: "pregnant",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format: "Use one of the accepted values listed below",
  },
  employed_in_healthcare: {
    name: "Employed in healthcare",
    colHeader: "employed_in_healthcare",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format: "Use one of the accepted values listed below",
  },
  symptomatic_for_disease: {
    name: "Symptomatic for disease",
    colHeader: "symptomatic_for_disease",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format: "Use one of the accepted values listed below.",
  },
  illness_onset_date: {
    name: "Illness onset date",
    colHeader: "illness_onset_date",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    format: "M/D/YYYY",
    examples: ["9/2/2022", "10/13/2021"],
    description: ["Date"],
  },
  resident_congregate_setting: {
    name: "Resident congregate setting",
    colHeader: "resident_congregate_setting",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format:
      "If the patient lives in a setting with shared group spaces, such as assisted living or a prison.<br/>Use one of the accepted values listed below.",
  },
  residence_type: {
    name: "Residence type",
    colHeader: "residence_type",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    format: "Use one of the accepted values listed below",
    acceptedValues: [
      "<mark><code>Hospital</code></mark> or <mark><code>22232009</code></mark>",
      "<mark><code>Hospital Ship</code></mark> or <mark><code>2081004</code></mark>",
      "<mark><code>Long Term Care Hospital</code></mark> or <mark><code>32074000</code></mark>",
      "<mark><code>Secure Hospital</code></mark> or <mark><code>224929004</code></mark>",
      "<mark><code>Nursing Home</code></mark> or <mark><code>42665001</code></mark>",
      "<mark><code>Retirement Home</code></mark> or <mark><code>30629002</code></mark>",
      "<mark><code>Orphanage</code></mark> or <mark><code>74056004</code></mark>",
      "<mark><code>Prison-based Care Site</code></mark> or <mark><code>722173008</code></mark>",
      "<mark><code>Substance Abuse Treatment Center</code></mark> or <mark><code>20078004</code></mark>",
      "<mark><code>Boarding House</code></mark> or <mark><code>257573002</code></mark>",
      "<mark><code>Military Accommodation</code></mark> or <mark><code>224683003</code></mark>",
      "<mark><code>Hospice</code></mark> or <mark><code>284546000</code></mark>",
      "<mark><code>Hostel</code></mark> or <mark><code>257628001</code></mark>",
      "<mark><code>Sheltered Housing</code></mark> or <mark><code>310207003</code></mark>",
      "<mark><code>Penal Institution</code></mark> or <mark><code>57656006</code></mark>",
      "<mark><code>Religious Institutional Residence</code></mark> or <mark><code>285113009</code></mark>",
      "<mark><code>Work (environment)</code></mark> or <mark><code>285141008</code></mark>",
      "<mark><code>Homeless</code></mark> or <mark><code>32911000</code></mark>",
    ],
    description: [
      "If the resident congregate setting is “Y” or “Yes,” then provide residence type",
    ],
  },
  hospitalized: {
    name: "Hospitalized",
    colHeader: "hospitalized",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format:
      "If the patient tested was admitted to a hospital for treatment.<br/>Use one of the accepted values listed below.",
  },
  icu: {
    name: "Intensive care unit",
    colHeader: "icu",
    requiredStatusTag: RequiredStatusTag.OPTIONAL,
    acceptedValues: [
      "<mark><code>Y</code></mark> or <mark><code>YES</code></mark>",
      "<mark><code>N</code></mark> or <mark><code>NO</code></mark>",
      "<mark><code>U</code></mark> or <mark><code>UNK</code></mark>",
    ],
    format: "Use one of the accepted values listed below",
  },
};

export const specificSchemaBuilder = (facilityId: string | null): CsvSchema => {
  const validUuid = facilityId && validate(facilityId) ? facilityId : "";
  const deviceCodeLookupLink = `<a href="${process.env.PUBLIC_URL}/results/upload/submit/code-lookup?facility=${validUuid}" class="usa-link" target="_blank" rel="noreferrer noopener">device code lookup tool</a>`;
  const livdSpreadsheetLink =
    '<a href="https://www.cdc.gov/csels/dls/livd-codes.html#anchor_88680" class="usa-link" target="_blank" rel="noreferrer noopener">SARS-CoV-2 LIVD Test Codes spreadsheet</a>';

  return {
    fields: [
      {
        sections: [
          {
            title: "Patient",
            slug: "patient",
            items: [
              {
                name: "Patient ID",
                colHeader: "patient_id",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: ["1234", "P2300"],
                description: [
                  "Enter unique patient identifier. This is typically the Medical Record Number. <strong><em>Do not send a Social Security Number</em></strong>.",
                  "<em>Some jurisdictions may require this field, ReportStream will notify you if this is the case.</em>",
                ],
              },
              {
                name: "Patient last name",
                colHeader: "patient_last_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                description: ["Last name, separated from first name"],
              },
              {
                name: "Patient first name",
                colHeader: "patient_first_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                description: ["First name, separated from last name"],
              },
              {
                name: "Patient middle name",
                colHeader: "patient_middle_name",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: ["Middle name, if known"],
              },
              {
                name: "Patient street address",
                colHeader: "patient_street",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                acceptedValues: [
                  "Example: <em>1234 America Ln</em>",
                  "<mark><code>** Unknown / Not Given **</code></mark>",
                  "<mark><code>** Homeless **</code></mark>",
                ],
                description: [
                  "Patient’s street address or one of the accepted values below",
                ],
              },
              {
                name: "Patient street address line 2",
                colHeader: "patient_street2",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: ["<em>Apartment 4C</em>"],
              },
              {
                name: "Patient city",
                colHeader: "patient_city",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["Los Angeles", "Madison"],
                description: [
                  'If a patient’s city is unknown or they’re experiencing homelessness, use <a href="#ordering_facility_city" class="usa-link">ordering facility city</a>',
                ],
              },
              {
                name: "Patient state",
                colHeader: "patient_state",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "Two-character state abbreviation",
                examples: ["TX", "CA"],
              },
              {
                name: "Patient county",
                colHeader: "patient_county",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["Kings County", "Allen Parish"],
                description: ["County or parish name"],
              },
              {
                name: "Patient zip code",
                colHeader: "patient_zip_code",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "5 or 9 digit zip code",
                examples: ["12345", "12345-6789"],
                description: [
                  'If no address is given or a patient is experiencing homelessness, use <a href="#ordering_facility_zip_code" class="usa-link">ordering facility zip code</a>',
                ],
              },
              {
                name: "Patient phone number",
                colHeader: "patient_phone_number",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "000-000-0000",
                examples: ["123-456-7890"],
                description: [
                  'If no address is given or a patient is experiencing homelessness, use <a href="#ordering_facility_phone_number" class="usa-link">ordering facility phone number</a>',
                ],
              },
              {
                name: "Patient date of birth",
                colHeader: "patient_dob",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "M/D/YYYY",
                examples: ["3/30/1972", "12/8/2002"],
              },
              {
                name: "Patient race",
                colHeader: "patient_race",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                acceptedValues: [
                  "<mark><code>American Indian or Alaska Native</code></mark> or <mark><code>1002-5</code></mark>",
                  "<mark><code>Asian</code></mark> or <mark><code>2028-9</code></mark>",
                  "<mark><code>Black or African American</code></mark> or <mark><code>2054-5</code></mark>",
                  "<mark><code>Native Hawaiian or Other Pacific Islander</code></mark> or <mark><code>2076-8</code></mark>",
                  "<mark><code>White</code></mark> or <mark><code>2106-3</code></mark>",
                  "<mark><code>Other</code></mark> or <mark><code>2131-1</code></mark>",
                  "<mark><code>Ask, but unknown</code></mark> or <mark><code>ASKU</code></mark>",
                  "<mark><code>Unknown</code></mark> or <mark><code>UNK</code></mark>",
                ],
                description: [
                  'Use one of the LOINC codes listed below, which come from the <a href="https://phinvads.cdc.gov/vads/SearchVocab.action" class="usa-link" target="_blank" rel="noreferrer noopener">PHIN VADS system</a>',
                ],
              },
              {
                name: "Patient ethnicity",
                colHeader: "patient_ethnicity",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                acceptedValues: [
                  "<mark><code>2135-2</code></mark> or <mark><code>Hispanic or Latino</code></mark>",
                  "<mark><code>2186-5</code></mark> or <mark><code>Not Hispanic or Latino</code></mark>",
                  "<mark><code>UNK</code></mark> or <mark><code>Unknown</code></mark>",
                ],
                description: [
                  'Use one of the LOINC codes list below, which come from the <a href="https://phinvads.cdc.gov/vads/SearchVocab.action" class="usa-link" target="_blank" rel="noreferrer noopener">PHIN VADS system</a',
                ],
              },
              {
                name: "Patient sex",
                colHeader: "patient_sex",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                acceptedValues: [
                  "<mark><code>Female</code></mark> or <mark><code>F</code></mark>",
                  "<mark><code>Male</code></mark> or <mark><code>M</code></mark>",
                ],
                description: ["Biological sex"],
              },
              {
                name: "Patient preferred language ",
                colHeader: "patient_preferred_language",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: [
                  'eng <span class="normal-style">or</span> English',
                  'spa <span class="normal-style">or</span> Spanish',
                ],
                description: [
                  'Look up a Language Concept Code or Name from the  <a href="https://phinvads.cdc.gov/vads/ViewValueSet.action?id=D0858308-9AB3-EA11-818F-005056ABE2F0#" class="usa-link" target="_blank" rel="noreferrer noopener">ISO-639 table in the PHIN VADS system</a>',
                ],
              },
              {
                name: "Patient email",
                colHeader: "patient_email",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "Email address",
                examples: ["janedoe@person.com"],
              },
            ],
          },
          {
            title: "Order and result",
            slug: "order-and-result",
            items: [
              {
                name: "Accession number",
                colHeader: "accession_number ",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["ID12345-6789"],
                description: [
                  "A unique ID that identifies a single result, which allows public health departments to refer back to a test event.",
                ],
              },
              {
                name: "Equipment model name",
                colHeader: "equipment_model_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: [
                  "ID NOW",
                  "BD Veritor System for Rapid Detection of SARS-CoV-2*",
                  "BD Veritor System for Rapid Detection of SARS-CoV-2 & Flu A+B*",
                  "RightSign COVID-19 IgG/IgM Rapid Test Cassette*",
                ],
                description: [
                  "The name of the device or test kit used for testing.",
                  `Find your device on the ${deviceCodeLookupLink}, then copy the value for this field.`,
                ],
              },
              {
                name: "Test kit name ID",
                colHeader: "test_kit_name_id",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,

                examples: [
                  "CareStart COVID-19 IgM/IgG_Access Bio, Inc.",
                  "BD Veritor System for Rapid Detection of SARS-CoV-2 & Flu A+B_Becton, Dickinson and Company (BD)",
                  "00884999049222",
                ],
                description: [
                  "If you want to include this value, you can find it in the CDC’s " +
                    `${livdSpreadsheetLink}, under Testkit ` +
                    "Name ID (column M).",
                ],
              },
              {
                name: "Equipment model ID",
                colHeader: "equipment_model_id",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,

                examples: [
                  "No Equipment",
                  "BD Veritor Plus System_Becton Dickinson",
                  "00884999048034",
                ],
                description: [
                  "If you want to include this value, you can find it in the CDC’s " +
                    `${livdSpreadsheetLink}, under Equipment ` +
                    "UID (column O).",
                ],
              },
              {
                name: "Test performed LOINC code",
                colHeader: "test_performed_code",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "00000-0",
                examples: [
                  "94534-5",
                  "94558-4",
                  "97097-0",
                  "94507-1",
                  "94508-9",
                ],
                description: [
                  `Find your device on the ${deviceCodeLookupLink}, then copy the value for this field.`,
                ],
              },
              {
                name: "Test ordered LOINC code",
                colHeader: "test_ordered_code",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "00000-0",
                examples: [
                  "94534-5",
                  "94558-4",
                  "97097-0",
                  "94507-1",
                  "94508-9",
                ],
                description: [],
              },
              {
                name: "Test result",
                colHeader: "test_result",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                acceptedValues: [
                  "<mark><code>Positive</code></mark>",
                  "<mark><code>Negative</code></mark>",
                  "<mark><code>Not Detected</code></mark>",
                  "<mark><code>Detected</code></mark>",
                  "<mark><code>Invalid Result</code></mark>",
                  "SNOMED code from lookup table, example: <em>260373001<em>",
                ],
                description: [
                  `Use one of the common values below, or find your device on the ${deviceCodeLookupLink}.`,
                ],
              },
              {
                name: "Order test date",
                colHeader: "order_test_date",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  "Include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the ordering provider address (if available), or ET (Eastern Time).",
                ],
              },
              {
                name: "Specimen collection date",
                colHeader: "specimen_collection_date",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are also acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  'Leave this field blank if it’s the same as <a href="#order_test_date" class="usa-link">order_test_date</a>. SimpleReport will default to the <a href="#order_test_date" class="usa-link">order_test_date</a> value.',
                  "For any values you do add for this field, include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the ordering provider address (if available), or ET (Eastern Time).",
                ],
              },
              {
                name: "Testing lab specimen received date",
                colHeader: "testing_lab_specimen_received_date",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are also acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  'Leave this field blank if it’s the same as <a href="#order_test_date" class="usa-link">order_test_date</a>. SimpleReport will default to the <a href="#order_test_date" class="usa-link">order_test_date</a> value.',
                  "For any values you do add for this field, include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the ordering provider address (if available), or ET (Eastern Time).",
                ],
              },
              {
                name: "Test result date",
                colHeader: "test_result_date",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are also acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  "Include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the ordering provider address (if available), or ET (Eastern Time).",
                ],
              },
              {
                name: "Date result released",
                colHeader: "date_result_released",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are also acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  'Leave this field blank if it’s the same as <a href="#test_result_date" class="usa-link">test_result_date</a>. SimpleReport will default to the <a href="#test_result_date" class="usa-link">test_result_date</a> value.',
                  "For any values you do add for this field, include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the ordering provider address (if available), or ET (Eastern Time).",
                ],
              },
            ],
          },
          {
            title: "Specimen",
            slug: "specimen",
            items: [
              {
                name: "Specimen type",
                colHeader: "specimen_type",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: [
                  "<em>258607008</em>",
                  "<em>258500001</em>",
                  "<em>445297001</em>",
                ],
                description: [
                  "The SNOMED code representing the type of biological sample used for testing.",
                  "<br />",
                  `Find the specimen type for your device on the ${deviceCodeLookupLink} and copy the SNOMED code for the given specimen.`,
                ],
              },
            ],
          },
          {
            title: "Ordering provider",
            slug: "ordering-provider",
            items: [
              {
                name: "Ordering provider ID",
                colHeader: "ordering_provider_id",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format:
                  '<a href="https://npiregistry.cms.hhs.gov/" class="usa-link" target="_blank" rel="noreferrer noopener">NPI number</a> or local code',
                examples: [
                  '<span class="normal-style">NPI example:</span> <em>1013012657</em>',
                  '<span class="normal-style">Local code example:</span> <em>muc1290</em>',
                ],
                description: [
                  'Enter the National Provider Identifier (NPI), the unique 10-digit number that identifies a healthcare provider. You can find NPIs at the <a href="https://npiregistry.cms.hhs.gov/" class="usa-link" target="_blank" rel="noreferrer noopener">NPI Registry</a>. If you don’t know the NPI, you can enter local coding. Some jurisdictions may not accept a local code, and ReportStream will work with you if this is the case.',
                ],
              },
              {
                name: "Ordering provider last name",
                colHeader: "ordering_provider_last_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                description: ["Last name, separated from first name"],
              },
              {
                name: "Ordering provider first name",
                colHeader: "ordering_provider_first_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                description: ["First name, separated from last name"],
              },
              {
                name: "Ordering provider middle name",
                colHeader: "ordering_provider_middle_name",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: ["Middle name, if known"],
              },
              {
                name: "Ordering provider street address",
                colHeader: "ordering_provider_street",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["1234 America Ln"],
              },
              {
                name: "Ordering provider street address line 2",
                colHeader: "ordering_provider_street2",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: ["Suite 5C"],
              },
              {
                name: "Ordering provider city",
                colHeader: "ordering_provider_city",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["Los Angeles", "Madison"],
              },
              {
                name: "Ordering provider state",
                colHeader: "ordering_provider_state",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "Two-character state abbreviation",
                examples: ["TX", "CA"],
              },
              {
                name: "Ordering provider zip code",
                colHeader: "ordering_provider_zip_code",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "5 or 9 digit zip code",
                examples: ["12345", "12345-6789"],
              },
              {
                name: "Ordering provider phone number",
                colHeader: "ordering_provider_phone_number",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "000-000-0000",
                examples: ["123-456-7890"],
              },
            ],
          },
          {
            title: "Testing facility",
            slug: "testing-facility",
            items: [
              {
                name: "Testing lab CLIA number",
                colHeader: "testing_lab_clia",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["<em>11D2030855</em>"],
                description: [
                  'CLIA number from the <a href="https://www.cdc.gov/clia/LabSearch.html" class="usa-link" target="_blank" rel="noreferrer noopener">CDC Laboratory Search</a>',
                ],
              },
              {
                name: "Testing lab name",
                colHeader: "testing_lab_name",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                description: ["Name of facility that processed test results"],
              },
              {
                name: "Testing lab street address",
                colHeader: "testing_lab_street",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["1234 America St"],
              },
              {
                name: "Testing lab street address line 2",
                colHeader: "testing_lab_street2",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: ["Unit 4"],
              },
              {
                name: "Testing lab city",
                colHeader: "testing_lab_city",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                examples: ["Dallas", "Madison"],
              },
              {
                name: "Testing lab state",
                colHeader: "testing_lab_state",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "Two-character state abbreviation",
                examples: ["FL", "CA"],
              },
              {
                name: "Testing lab zip code",
                colHeader: "testing_lab_zip_code",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "5 or 9 digit zip code",
                examples: ["54321", "12345-6789"],
              },
              {
                name: "Testing lab phone number",
                colHeader: "testing_lab_phone_number",
                requiredStatusTag: RequiredStatusTag.REQUIRED,
                format: "000-000-0000",
                examples: ["123-654-7890"],
              },
            ],
          },
          {
            title: "Ask on entry (AOE)",
            slug: "ask-on-entry",
            tabs: [
              {
                title: MULTIPLEX_DISEASES.COVID_19,
                slug: MULTIPLEX_DISEASES.COVID_19,
                items: [
                  aoeDocumententationItems.pregnant,
                  aoeDocumententationItems.employed_in_healthcare,
                  aoeDocumententationItems.symptomatic_for_disease,
                  aoeDocumententationItems.illness_onset_date,
                  aoeDocumententationItems.resident_congregate_setting,
                  aoeDocumententationItems.residence_type,
                  aoeDocumententationItems.hospitalized,
                  aoeDocumententationItems.icu,
                ],
              },
              {
                title: MULTIPLEX_DISEASES.HIV,
                slug: MULTIPLEX_DISEASES.HIV,
                items: [
                  {
                    ...aoeDocumententationItems.pregnant,
                    requiredStatusTag: RequiredStatusTag.REQUIRED_FOR_POSITIVES,
                  },
                ],
              },
            ],
            items: [],
          },
          {
            title: "Ordering facility",
            slug: "ordering-facility",
            items: [
              {
                name: "Ordering facility name",
                colHeader: "ordering_facility_name",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_name" class="usa-link">testing_lab_name</a>',
                ],
              },
              {
                name: "Ordering facility street address",
                colHeader: "ordering_facility_street",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_street" class="usa-link">testing_lab_street</a>',
                ],
              },
              {
                name: "Ordering facility street address line 2",
                colHeader: "ordering_facility_street2",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: ["Address, continued"],
              },
              {
                name: "Ordering facility city",
                colHeader: "ordering_facility_city",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_city" class="usa-link">testing_lab_city</a>',
                ],
              },
              {
                name: "Ordering facility state",
                colHeader: "ordering_facility_state",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "Two-character state abbreviation",
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_state" class="usa-link">testing_lab_state</a>',
                ],
                examples: ["TX", "CA"],
              },
              {
                name: "Ordering facility zip code",
                colHeader: "ordering_facility_zip_code",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "5 or 9 digit zip code",
                examples: ["12345", "12345-6789"],
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_zip_code" class="usa-link">testing_lab_zip_code</a>',
                ],
              },
              {
                name: "Ordering facility phone number",
                colHeader: "ordering_facility_phone_number",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                examples: ["123-456-7890"],
                format: "000-000-0000",
                description: [
                  'You can leave this field blank if it’s the same as <a href="#testing_lab_phone_number" class="usa-link">testing_lab_phone_number</a>',
                ],
              },
            ],
          },
          {
            title: "Additional data and notes",
            slug: "additional-data-elements",
            items: [
              {
                name: "Comment",
                colHeader: "comment",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "Do not include commas (,) in any comments",
                description: [
                  "If there are comments from a physician or lab technician you want to relay to your public health department, enter them here. This field isn't meant for characteristics of the condition tested or statements about false positive or negative results.",
                ],
              },
              {
                name: "Test result status",
                colHeader: "test_result_status ",
                requiredStatusTag: RequiredStatusTag.OPTIONAL,
                format: "Use one of the accepted values below",
                acceptedValues: [
                  "<mark><code>F</code></mark> = Final result",
                  "<mark><code>C</code></mark> = Corrected result",
                ],
                description: [
                  "Enter test result status using the accepted format listed below. If left blank, value will default to F for final.",
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

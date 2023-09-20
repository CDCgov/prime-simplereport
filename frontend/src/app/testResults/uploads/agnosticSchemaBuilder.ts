import { validate } from "uuid";

export const agnosticSchemaBuilder = (facilityId: string | null) => {
  const validUuid = facilityId && validate(facilityId) ? facilityId : "";
  const deviceCodeLookupLink = `<a href="${process.env.PUBLIC_URL}/results/upload/submit/code-lookup?facility=${validUuid}" class="usa-link" target="_blank" rel="noreferrer noopener">device code lookup tool</a>`;

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
                required: false,
                requested: true,
                examples: ["1234", "P2300"],
                description: [
                  "Enter unique patient identifier. This is typically the Medical Record Number. <strong><em>Do not send a Social Security Number</em></strong>.",
                  "<em>Some jurisdictions may require this field, ReportStream will notify you if this is the case.</em>",
                ],
              },
              {
                name: "Patient last name",
                colHeader: "patient_last_name",
                required: false,
                requested: true,
                description: ["Last name, separated from first name"],
              },
              {
                name: "Patient first name",
                colHeader: "patient_first_name",
                required: false,
                requested: true,
                description: ["First name, separated from last name"],
              },
              {
                name: "Patient name absent reason",
                colHeader: "patient_name_absent_reason",
                required: false,
                requested: false,
                description: [
                  "Reason is required if first and last name are not provided.",
                ],
              },
              {
                name: "Patient gender",
                colHeader: "patient_admin_gender",
                required: true,
                requested: false,
                acceptedValues: [
                  "<mark><code>M</code></mark> or <mark><code>Male</code></mark>",
                  "<mark><code>F</code></mark> or <mark><code>Female</code></mark>",
                  "<mark><code>O</code></mark> or <mark><code>Other</code></mark>",
                  "<mark><code>U</code></mark> or <mark><code>Unknown</code></mark>",
                  "<mark><code>A</code></mark> or <mark><code>Ambiguous</code></mark>",
                  "<mark><code>N</code></mark> or <mark><code>Not applicable</code></mark>",
                ],
                description: [
                  'Use one of the LOINC codes listed below, which come from the <a href="https://phinvads.cdc.gov/vads/SearchVocab.action" class="usa-link" target="_blank" rel="noreferrer noopener">PHIN VADS system</a>',
                ],
              },
            ],
          },
          {
            title: "Order and result",
            slug: "order-and-result",
            items: [
              {
                name: "Test performed LOINC code",
                colHeader: "test_performed_code",
                required: true,
                requested: false,
                format: "00000-0",
                examples: [
                  "94534-5",
                  "94558-4",
                  "97097-0",
                  "94507-1",
                  "94508-9",
                ],
                description: [
                  `Where can you find this? or find your device on the ${deviceCodeLookupLink}, then copy the value for this field.`,
                ],
              },
              {
                name: "Test result",
                colHeader: "test_result_value",
                required: true,
                requested: false,
                acceptedValues: [
                  "SNOMED code from lookup table, example: <em>260373001<em>",
                ],
                description: [
                  `Where else can you find it? or find your device on the ${deviceCodeLookupLink}.`,
                ],
              },
              {
                name: "Test result status",
                colHeader: "test_result_status",
                required: true,
                requested: false,
                acceptedValues: [
                  "<mark><code>C</code></mark>",
                  "<mark><code>F</code></mark>",
                ],
                description: [`What does this stand for?`],
              },
              {
                name: "Test result date",
                colHeader: "test_result_effective_date",
                required: true,
                requested: false,
                format:
                  "<code>M/D/YYYY HH:mm TZ</code> is preferred, but <code>M/D/YYYY HH:mm</code> and <code>M/D/YYYY</code> are also acceptable",
                examples: ["5/23/2023 4:30 CT", "11/2/2022 14:17", "9/21/2022"],
                description: [
                  "Include the time and time zone if possible. Time zones can be any common US time zone abbreviation, such as AKDT, AKST, CT, ET, HST, MT, or PT.",
                  "If you don’t include a time, SimpleReport will default to 12 PM. If you don’t include a time zone, it will default to the time zone of the testing lab address (if available), or ET (Eastern Time).",
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

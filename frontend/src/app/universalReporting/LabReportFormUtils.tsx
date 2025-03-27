import { ResultScaleType } from "../../generated/graphql";

type Specimen = {
  name: string;
  type_code: string;
};

const DEFAULT_SPECIMENS: Specimen[] = [
  {
    name: "Swab of internal nose",
    type_code: "445297001",
  },
  {
    name: "Nasopharyngeal swab",
    type_code: "258500001",
  },
  {
    name: "Venous blood specimen",
    type_code: "122555007",
  },
  {
    name: "Oral fluid specimen",
    type_code: "441620008",
  },
];

export const useSpecimenTypeOptionList = () => {
  const options = DEFAULT_SPECIMENS.map((specimen) => {
    return {
      value: specimen.type_code,
      label: `${specimen.name} - ${specimen.type_code}`,
    };
  });
  options.sort((a, b) => (a.label > b.label ? 1 : -1));
  return options;
};

export enum UNIVERSAL_CONDITIONS {
  COVID_19 = "COVID-19",
  FLU_A = "Flu A",
  FLU_B = "Flu B",
  RSV = "RSV",
  HIV = "HIV",
  SYPHILIS = "Syphilis",
  FLU_A_AND_B = "Flu A and B",
  HEPATITIS_C = "Hepatitis C",
  GONORRHEA = "Gonorrhea",
  CHLAMYDIA = "Chlamydia",
}

export const ResultScaleTypeOptions: {
  label: string;
  value: ResultScaleType;
}[] = [
  {
    label: ResultScaleType.Ordinal,
    value: ResultScaleType.Ordinal,
  },
  {
    label: ResultScaleType.Quantitative,
    value: ResultScaleType.Quantitative,
  },
  {
    label: ResultScaleType.Nominal,
    value: ResultScaleType.Nominal,
  },
];

export const useConditionOptionList = () => {
  const allConditions = Object.values(UNIVERSAL_CONDITIONS);
  const options = allConditions.map((disease) => {
    return {
      value: disease,
      label: disease,
    };
  });
  options.sort((a, b) => (a.label > b.label ? 1 : -1));
  return options;
};

export type TestOrderLoinc = {
  title: string;
  description: string;
  code: string;
};

const mockTestOrderLoincList = [
  {
    title: "Oth fracture of shaft of l humerus, subs for fx w nonunion",
    description:
      "Other fracture of shaft of left humerus, subsequent encounter for fracture with nonunion",
    code: "S42392K",
  },
  {
    title: "Chronic osteomyelitis with draining sinus, unspecified hand",
    description: "Chronic osteomyelitis with draining sinus, unspecified hand",
    code: "M86449",
  },
  {
    title: "Reiter's disease, elbow",
    description: "Reiter's disease, elbow",
    code: "M0232",
  },
  {
    title: "Encntr for cerv smear to cnfrm norm smr fol init abn smear",
    description:
      "Encounter for cervical smear to confirm findings of recent normal smear following initial abnormal smear",
    code: "Z0142",
  },
  {
    title: "Acculturation difficulty",
    description: "Acculturation difficulty",
    code: "Z603",
  },
  {
    title: "Displ transverse fx shaft of l tibia, 7thN",
    description:
      "Displaced transverse fracture of shaft of left tibia, subsequent encounter for open fracture type IIIA, IIIB, or IIIC with nonunion",
    code: "S82222N",
  },
  {
    title: "Disp fx of shaft of unsp MC bone, subs for fx w malunion",
    description:
      "Displaced fracture of shaft of unspecified metacarpal bone, subsequent encounter for fracture with malunion",
    code: "S62329P",
  },
  {
    title: "Unsp foreign body in trachea causing oth injury, subs encntr",
    description:
      "Unspecified foreign body in trachea causing other injury, subsequent encounter",
    code: "T17408D",
  },
  {
    title: "Poisn by oth antacids and anti-gstrc-sec drugs, asslt, sqla",
    description:
      "Poisoning by other antacids and anti-gastric-secretion drugs, assault, sequela",
    code: "T471X3S",
  },
  {
    title: "Dental alveolar anomalies",
    description: "Dental alveolar anomalies",
    code: "M267",
  },
  {
    title: "Other complications of skin graft (allograft) (autograft)",
    description: "Other complications of skin graft (allograft) (autograft)",
    code: "T86828",
  },
  {
    title: "Unsp intracap fx right femur, init for opn fx type 3A/B/C",
    description:
      "Unspecified intracapsular fracture of right femur, initial encounter for open fracture type IIIA, IIIB, or IIIC",
    code: "S72011C",
  },
  {
    title: "Driver of bus injured in collision w pedl cyc nontraf, init",
    description:
      "Driver of bus injured in collision with pedal cycle in nontraffic accident, initial encounter",
    code: "V710XXA",
  },
  {
    title: "Disp fx of post wall of l acetab, subs for fx w delay heal",
    description:
      "Displaced fracture of posterior wall of left acetabulum, subsequent encounter for fracture with delayed healing",
    code: "S32422G",
  },
  {
    title: "Displacement of unspecified vascular grafts, subs encntr",
    description:
      "Displacement of unspecified vascular grafts, subsequent encounter",
    code: "T82329D",
  },
  {
    title: "Oth traumatic displ spondylolysis of fifth cervcal vertebra",
    description:
      "Other traumatic displaced spondylolisthesis of fifth cervical vertebra",
    code: "S12450",
  },
  {
    title: "Unspecified injury at T1 level of thoracic spinal cord",
    description: "Unspecified injury at T1 level of thoracic spinal cord",
    code: "S24101",
  },
  {
    title: "Other superficial injuries of right thumb",
    description: "Other superficial injuries of right thumb",
    code: "S60391",
  },
  {
    title: "Unspecified injury of left shoulder and upper arm",
    description: "Unspecified injury of left shoulder and upper arm",
    code: "S4992",
  },
  {
    title: "Mech compl of cardiac and vasc devices and implnt, sequela",
    description:
      "Other mechanical complication of other cardiac and vascular devices and implants, sequela",
    code: "T82598S",
  },
];

export const useFilteredTestOrderLoincListQueryStub = (
  selectedConditions: String[],
  selectedSpecimen: String
): TestOrderLoinc[] => {
  console.log(
    `mocking query for test order loincs using specimen ${selectedSpecimen} and ${selectedConditions.length} conditions`
  );
  return mockTestOrderLoincList;
};

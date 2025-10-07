import React, { useEffect, useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { useForm, Controller } from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { DeviceType, UpdateDeviceType } from "../../../generated/graphql";
import Required from "../../commonComponents/Required";

import DeviceTypeReminderMessage from "./DeviceTypeReminderMessage";
import DiseaseInformation from "./DiseaseInformation";

export type SupportedDiseasesFormData = {
  equipmentUid?: string;
  supportedDisease: string;
  testPerformedLoincCode: string;
  testOrderedLoincCode?: string;
  testkitNameId?: string;
};

export type DeviceFormData = {
  internalId?: string;
  name: string;
  model: string;
  manufacturer: string;
  testLength: number;
  swabTypes: string[];
  supportedDiseases: SupportedDiseasesFormData[];
};

interface Props {
  formTitle: string;
  saveDeviceType: (device: UpdateDeviceType) => void;
  swabOptions: Array<MultiSelectDropdownOption>;
  supportedDiseaseOptions: Array<MultiSelectDropdownOption>;
  deviceOptions?: DeviceType[];
}

const DeviceForm = (props: Props) => {
  /**
   * Form state setup
   */
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    reset,
    setFocus,
  } = useForm<DeviceFormData>({
    defaultValues: {
      supportedDiseases: [
        {
          supportedDisease: "",
          testPerformedLoincCode: "",
          equipmentUid: "",
          testkitNameId: "",
          testOrderedLoincCode: "",
        },
      ],
    },
  });

  const formCurrentValues = watch();

  /**
   * Submit device data
   */

  const onSubmit = async (deviceData: DeviceFormData) => {
    const updatedDevice = {
      ...selectedDevice,
      internalId: deviceData.internalId,
      manufacturer: deviceData.manufacturer,
      model: deviceData.model,
      name: deviceData.name,
      supportedDiseaseTestPerformed: deviceData.supportedDiseases.map(
        (supportedDisease: SupportedDiseasesFormData) => {
          const convertedSupportedDisease = {
            supportedDisease: supportedDisease.supportedDisease,
            testPerformedLoincCode: supportedDisease.testPerformedLoincCode,
          };
          if (supportedDisease.equipmentUid) {
            // @ts-ignore
            convertedSupportedDisease["equipmentUid"] =
              supportedDisease.equipmentUid;
          }
          if (supportedDisease.testkitNameId) {
            // @ts-ignore
            convertedSupportedDisease["testkitNameId"] =
              supportedDisease.testkitNameId;
          }
          if (supportedDisease.testOrderedLoincCode) {
            // @ts-ignore
            convertedSupportedDisease["testOrderedLoincCode"] =
              supportedDisease.testOrderedLoincCode;
          }
          return convertedSupportedDisease;
        }
      ),
      swabTypes: deviceData.swabTypes,
      testLength: deviceData.testLength,
    } as UpdateDeviceType;

    props.saveDeviceType(updatedDevice);
  };

  /**
   * Edit mode setup
   */

  const [selectedDevice, updateSelectedDevice] = useState<
    UpdateDeviceType | undefined
  >();

  const loadingDeviceData = !!props.deviceOptions && !selectedDevice;

  useEffect(() => {
    reset({
      internalId: selectedDevice?.internalId,
      name: selectedDevice?.name,
      model: selectedDevice?.model,
      manufacturer: selectedDevice?.manufacturer,
      testLength: selectedDevice?.testLength,
      swabTypes: selectedDevice?.swabTypes,
      supportedDiseases:
        selectedDevice?.supportedDiseaseTestPerformed as SupportedDiseasesFormData[],
    });
  }, [selectedDevice, reset]);

  const getDeviceOptions = () =>
    props.deviceOptions
      ? props.deviceOptions
          .map((deviceType) => ({
            label: deviceType.name,
            value: deviceType.internalId,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];

  const getDeviceFromDeviceType = (
    device?: DeviceType
  ): UpdateDeviceType | undefined => {
    return device
      ? {
          internalId: device.internalId,
          name: device.name,
          manufacturer: device.manufacturer,
          model: device.model,
          swabTypes: device.swabTypes?.map((swab) => swab.internalId),
          testLength: device.testLength ? device.testLength : 15,
          supportedDiseaseTestPerformed:
            device.supportedDiseaseTestPerformed?.map(
              (diseaseTestPerformed) => ({
                supportedDisease:
                  diseaseTestPerformed.supportedDisease.internalId,
                testPerformedLoincCode:
                  diseaseTestPerformed.testPerformedLoincCode,
                testkitNameId: diseaseTestPerformed.testkitNameId,
                equipmentUid: diseaseTestPerformed.equipmentUid,
                testOrderedLoincCode: diseaseTestPerformed.testOrderedLoincCode,
              })
            ),
        }
      : undefined;
  };

  /**
   * HTML
   */
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <form
            className="prime-container card-container"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="usa-card__header">
              <h1 className="font-heading-lg margin-top-0 margin-bottom-0">
                {props.formTitle}
              </h1>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="submit"
                  label="Save changes"
                  disabled={loadingDeviceData || isSubmitting || !isDirty}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <DeviceTypeReminderMessage />
              {props.deviceOptions ? (
                <div className="grid-row grid-gap margin-top-2">
                  <div className="tablet:grid-col">
                    <label htmlFor="selectDevice">
                      <Required label={"Select device"} />
                    </label>
                    <ComboBox
                      className="usa-combo-box__full-width"
                      id="selectDevice"
                      name="selectDevice"
                      options={getDeviceOptions()}
                      onChange={(id) => {
                        const chosenDevice = getDeviceFromDeviceType(
                          props.deviceOptions?.find((d) => id === d.internalId)
                        );

                        updateSelectedDevice(chosenDevice);
                      }}
                      defaultValue={selectedDevice?.internalId || ""}
                    />
                  </div>
                </div>
              ) : null}
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    name="name"
                    label={"Device Name"}
                    value={formCurrentValues.name}
                    validationStatus={
                      errors?.name?.type === "required" ? "error" : undefined
                    }
                    errorMessage="This is a required field"
                    required
                    disabled={loadingDeviceData}
                    registrationProps={register("name", { required: true })}
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Model"
                    name="model"
                    value={formCurrentValues.model}
                    validationStatus={
                      errors?.model?.type === "required" ? "error" : undefined
                    }
                    errorMessage="This is a required field"
                    disabled={loadingDeviceData}
                    required
                    registrationProps={register("model", { required: true })}
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Manufacturer"
                    name="manufacturer"
                    value={formCurrentValues.manufacturer}
                    validationStatus={
                      errors?.manufacturer?.type === "required"
                        ? "error"
                        : undefined
                    }
                    errorMessage="This is a required field"
                    disabled={loadingDeviceData}
                    required
                    registrationProps={register("manufacturer", {
                      required: true,
                    })}
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    type={"number"}
                    label="Test length (minutes)"
                    name="testLength"
                    value={formCurrentValues?.testLength?.toString()}
                    validationStatus={
                      errors?.testLength?.type ? "error" : undefined
                    }
                    errorMessage={
                      errors?.testLength?.type === "required"
                        ? "This is a required field"
                        : "value must be between 0 and 999"
                    }
                    disabled={loadingDeviceData}
                    required
                    registrationProps={register("testLength", {
                      required: true,
                      valueAsNumber: true,
                      min: 0,
                      max: 999,
                    })}
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <Controller
                    render={({
                      field: { onChange, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <MultiSelect
                        key={formCurrentValues?.internalId}
                        label="SNOMED code for swab type(s)"
                        name={name}
                        errorMessage="This is a required field"
                        validationStatus={error?.type ? "error" : undefined}
                        options={props.swabOptions}
                        initialSelectedValues={value}
                        disabled={loadingDeviceData}
                        required
                        onChange={onChange}
                        registrationProps={{
                          inputTextRef: ref,
                          setFocus: () => setFocus(name),
                        }}
                      />
                    )}
                    name="swabTypes"
                    control={control}
                    rules={{ required: true }}
                  />
                  <DiseaseInformation
                    values={formCurrentValues.supportedDiseases}
                    supportedDiseaseOptions={props.supportedDiseaseOptions}
                    disabled={loadingDeviceData}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceForm;

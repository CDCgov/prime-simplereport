import React, { useEffect, useState } from "react";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect";
import { ComboBoxOption } from "../../commonComponents/ComboBox/ComboBox";
import { useGetSpecimenTypesQuery } from "../../../generated/graphql";

import { Device } from "./DeviceTypeFormContainer";

interface Props {
  saveDeviceType: (device: Device) => void;
}

const DeviceTypeForm: React.FC<Props> = ({ saveDeviceType }) => {
  const { data, loading, error } = useGetSpecimenTypesQuery();

  const [swabOptions, setSwabOptions] = useState<Array<ComboBoxOption>>([]);

  useEffect(() => {
    if (data && data.specimenTypes) {
      setSwabOptions(
        Array.from(
          data.specimenTypes.map((type) => {
            return {
              label: `${type?.name} (${type?.typeCode})`,
              value: type?.internalId,
            } as ComboBoxOption;
          })
        )
      );
    }
  }, [data]);

  const [device, updateDevice] = useState<Device>({
    name: "",
    manufacturer: "",
    model: "",
    loincCode: "",
    swabType: "",
  });
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateDevice({ ...device, [e.target.name]: e.target.value });
    updateFormChanged(true);
  };
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Device Type</h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  onClick={() => saveDeviceType(device)}
                  label="Save Changes"
                  disabled={!formChanged}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <div>
                <div className="usa-alert usa-alert--warning">
                  <div className="usa-alert__body">
                    <h4 className="usa-alert__heading">Reminder</h4>
                    <p className="usa-alert__text">
                      Notify ReportStream of devices added in{" "}
                      <a
                        href="https://usds.slack.com/archives/C024MGSJZ38"
                        target="_blank"
                        rel="noreferrer"
                      >
                        #prime-reportstream
                      </a>
                    </p>
                    <p>
                      Device details can be found by downloading the excel file
                      published at{" "}
                      <a
                        href="https://www.cdc.gov/csels/dls/sars-cov-2-livd-codes.html"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://www.cdc.gov/csels/dls/sars-cov-2-livd-codes.html
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Name"
                    name="name"
                    value={device.name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Manufacturer"
                    name="manufacturer"
                    value={device.manufacturer}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Model"
                    name="model"
                    value={device.model}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Loinc Code"
                    name="loincCode"
                    value={device.loincCode}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <MultiSelect
                    label="SNOMED code of Swab Type"
                    name="swabType"
                    onChange={() => {}}
                    options={swabOptions}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DeviceTypeForm;

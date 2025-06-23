import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";

import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Alert from "../commonComponents/Alert";
import Select from "../commonComponents/Select";
import { OrganizationTypeEnum } from "../signUp/Organization/utils";
import { Organization } from "../../generated/graphql";
import FetchClient from "../../app/utils/api";
import { getAppInsightsHeaders } from "../TelemetryService";
import { showError, showSuccess } from "../utils/srToast";

interface ManageOrganizationProps {
  organization: Organization;
  onSave: (organization: Organization) => Promise<void>;
  canEditOrganizationName: boolean;
}

type DownloadState = "idle" | "downloading" | "complete";
const apiClient = new FetchClient();

const ManageOrganization: React.FC<ManageOrganizationProps> = ({
  organization,
  onSave,
  canEditOrganizationName,
}: ManageOrganizationProps) => {
  const [testResultDownloadState, setTestResultDownloadState] =
    useState<DownloadState>("idle");
  const [patientDownloadState, setPatientDownloadState] =
    useState<DownloadState>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<Organization>({
    defaultValues: { type: organization.type, name: organization.name },
  });
  const formCurrentValues = watch();

  const onSubmit = async (orgData: Organization) => {
    const updatedOrganization = {
      ...organization,
      name: canEditOrganizationName ? orgData.name : organization.name,
      type: orgData.type,
    };
    try {
      await onSave(updatedOrganization);
      reset({ ...orgData });
    } catch {}
  };

  const handleDownloadTestResults = async () => {
    setTestResultDownloadState("downloading");
    try {
      const downloadPath = `/results/download?organizationId=${organization.id}`;
      const fullUrl = apiClient.getURL(downloadPath);

      console.log("Organization Download URL:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Request-Headers": "Authorization",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          ...getAppInsightsHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download test results: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "organization-test-results.zip";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }

      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);

      setTestResultDownloadState("complete");
      showSuccess("Success Message", "Test results downloaded successfully");

      setTimeout(() => {
        setTestResultDownloadState("idle");
      }, 3000);
    } catch (e: any) {
      console.error("Download error:", e);
      showError("Error downloading test results", e.message);
      setTestResultDownloadState("idle");
    }
  };

  const handleDownloadPatients = async () => {
    setPatientDownloadState("downloading");
    try {
      const downloadPath = `/patients/download/organization?orgId=${organization.id}`;
      const fullUrl = apiClient.getURL(downloadPath);
      console.log("Full organization object:", organization);

      console.log("Organization Download URL:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Request-Headers": "Authorization",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          ...getAppInsightsHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download patients: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "organization-patients.zip";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }

      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);

      setPatientDownloadState("complete");
      showSuccess("Download Complete", "Patients downloaded successfully");

      setTimeout(() => {
        setPatientDownloadState("idle");
      }, 3000);
    } catch (e: any) {
      console.error("Download error:", e);
      showError("Error downloading patients", e.message);
      setPatientDownloadState("idle");
    }
  };

  const getTestResultDownloadButtonContent = (downloadableItems: string) => {
    switch (testResultDownloadState) {
      case "downloading":
        return {
          icon: faSpinner,
          label: "Downloading...",
          className: "fa-spin",
        };
      case "complete":
        return {
          icon: faDownload,
          label: "Download Complete",
          className: "",
        };
      default:
        return {
          icon: faDownload,
          label: "Download " + downloadableItems,
          className: "",
        };
    }
  };

  const getPatientDownloadButtonContent = (downloadableItems: string) => {
    switch (patientDownloadState) {
      case "downloading":
        return {
          icon: faSpinner,
          label: "Downloading...",
          className: "fa-spin",
        };
      case "complete":
        return {
          icon: faDownload,
          label: "Download Complete",
          className: "",
        };
      default:
        return {
          icon: faDownload,
          label: "Download " + downloadableItems,
          className: "",
        };
    }
  };

  const downloadTestResultsButtonContent =
    getTestResultDownloadButtonContent("test results");
  const downloadPatientsButtonContent =
    getPatientDownloadButtonContent("patients");

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container settings-tab">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="usa-card__header">
            <h1>Manage organization</h1>
            <div className="display-flex flex-gap-1">
              <Button
                type="button"
                label={downloadPatientsButtonContent.label}
                icon={downloadPatientsButtonContent.icon}
                iconClassName={downloadPatientsButtonContent.className}
                onClick={handleDownloadPatients}
                disabled={patientDownloadState === "downloading"}
              />
              <Button
                type="button"
                label={downloadTestResultsButtonContent.label}
                icon={downloadTestResultsButtonContent.icon}
                iconClassName={downloadTestResultsButtonContent.className}
                onClick={handleDownloadTestResults}
                disabled={testResultDownloadState === "downloading"}
              />
              <Button
                type="submit"
                label="Save settings"
                disabled={isSubmitting || !isDirty}
              />
            </div>
          </div>
          <div className="usa-card__body">
            <RequiredMessage />
            {canEditOrganizationName ? (
              <TextInput
                label="Organization name"
                name="name"
                value={formCurrentValues.name}
                validationStatus={
                  errors?.name?.type === "required" ? "error" : undefined
                }
                errorMessage="The organization's name cannot be blank"
                required
                registrationProps={register("name", {
                  required: true,
                })}
              />
            ) : (
              <>
                <Alert type="info">
                  The organization name is used for reporting to public health
                  departments. Please contact{" "}
                  <a href="mailto:support@simplereport.gov">
                    support@simplereport.gov
                  </a>{" "}
                  if you need to change it.
                </Alert>
                <div className="usa-form-group">
                  <span>Organization name</span>
                  <p>{organization.name}</p>
                </div>
              </>
            )}
            <Select
              name="type"
              options={
                Object.entries(OrganizationTypeEnum).map(([key, value]) => ({
                  label: value,
                  value: key,
                })) as {
                  value: OrganizationType;
                  label: string;
                }[]
              }
              label="Organization type"
              value={formCurrentValues.type}
              defaultSelect
              errorMessage="An organization type must be selected"
              validationStatus={
                errors?.type?.type === "required" ? "error" : undefined
              }
              required
              registrationProps={register("type", { required: true })}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageOrganization;

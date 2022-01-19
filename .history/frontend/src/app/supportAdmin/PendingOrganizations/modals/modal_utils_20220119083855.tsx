import {
  EditOrgMutationResponse,
  PendingOrganizationFormValues,
} from "../utils";
import { PendingOrganization } from "../../../../generated/graphql";

export interface ModalProps {
  organization: PendingOrganization;
  handleClose: () => void;
  orgUsingOldSchema: boolean;
}

export interface VerficationModalProps extends ModalProps {
  handleUpdate: (
    organization: PendingOrganizationFormValues
  ) => Promise<EditOrgMutationResponse>;
  handleVerify: (organization: PendingOrganizationFormValues) => Promise<void>;
  isUpdating: boolean;
  isVerifying: boolean;
}

export type PendingOrganizationErrors = Record<
  keyof PendingOrganizationFormValues,
  string
>;

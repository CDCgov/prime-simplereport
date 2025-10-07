import {
  EditOrgMutationResponse,
  PendingOrganizationFormValues,
} from "../utils";
import { PendingOrganization } from "../../../../generated/graphql";

export interface ModalProps {
  organization: PendingOrganization;
  handleClose: () => void;
  isUpdating: boolean;
}

export interface VerficationModalProps extends ModalProps {
  handleUpdate: (
    organization: PendingOrganizationFormValues
  ) => Promise<EditOrgMutationResponse>;
  handleVerify: (organization: PendingOrganizationFormValues) => Promise<void>;
  isVerifying: boolean;
}

export interface DeletionModalProps extends ModalProps {
  handleDelete: (organization: PendingOrganization) => Promise<void>;
}

export type PendingOrganizationErrors = Record<
  keyof PendingOrganizationFormValues,
  string
>;

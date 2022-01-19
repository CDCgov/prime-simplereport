import {
  EditOrgMutationResponse,
  PendingOrganizationFormValues,
} from "../utils";
import { PendingOrganization } from "../../../../../generated/graphql";

export interface ModalProps {
  organization: PendingOrganization;
  handleUpdate: (
    organization: PendingOrganizationFormValues
  ) => Promise<EditOrgMutationResponse>;
  handleVerify: (organization: PendingOrganizationFormValues) => Promise<void>;
  handleClose: () => void;
  isUpdating: boolean;
  isVerifying: boolean;
  orgUsingOldSchema: boolean;
}

export type PendingOrganizationErrors = Record<
  keyof PendingOrganizationFormValues,
  string
>;

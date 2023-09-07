import {
  EditOrgMutationResponse,
  PendingOrganizationFormValues,
} from "../utils";
import { PendingOrganization } from "../../../../generated/graphql";

export interface ModalProps {
  organization: PendingOrganization | null;
  onClose: () => void;
  isLoading: boolean;
  isOpen: boolean;
}

export interface PendingOrganizationDetailsModalProps extends ModalProps {
  onVerifyOrgClick: (needsUpdate: boolean, org: PendingOrganization) => void;
  onUpdate: (
    organization: PendingOrganizationFormValues
  ) => Promise<EditOrgMutationResponse>;
  isUpdating: boolean;
}

export interface VerifyConfirmationModalProps extends ModalProps {
  onVerifyConfirm: () => void;
  onGoBackClick: () => void;
  isVerifying: boolean;
  isUpdating: boolean;
}

export interface ConfirmDeleteOrgModalProps extends ModalProps {
  handleDelete: (organization: PendingOrganization) => Promise<void>;
  isDeleting: boolean;
}

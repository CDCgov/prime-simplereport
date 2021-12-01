import { PendingOrganizationFormValues } from "../utils";
import { PendingOrganization } from "../../../../generated/graphql";

export interface ModalProps {
  organization: PendingOrganization;
  onClose: () => void;
  onSubmit: (organization: PendingOrganizationFormValues) => void;
  isUpdating: boolean;
}

export type PendingOrganizationErrors = Record<
  keyof PendingOrganizationFormValues,
  string
>;

import { Tag } from "@trussworks/react-uswds";
import classnames from "classnames";

const featureIsNewUntil = {
  selfRegistration: "2021-08-20",
} as const;

export const featureList = Object.keys(featureIsNewUntil);

type Feature = keyof typeof featureIsNewUntil;

type Props<T extends Feature | undefined> = T extends Feature
  ? {
      feature: T;
      className?: string;
      customEndDate?: never;
    }
  : {
      feature?: never;
      className?: string;
      customEndDate: string;
    };

export const NewFeatureTag = <T extends Feature | undefined>({
  feature,
  className,
  customEndDate,
}: Props<T>) => {
  if (
    (customEndDate && isNew(customEndDate)) ||
    (feature && isNew(featureIsNewUntil[feature]))
  ) {
    return <Tag className={classnames("bg-black", className)}>New</Tag>;
  }

  return null;
};

function isNew(date: string) {
  return new Date().getTime() < new Date(date).getTime();
}

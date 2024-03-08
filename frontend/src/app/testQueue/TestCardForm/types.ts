import { GetFacilityQueueQuery } from "../../../generated/graphql";

export type QueriedTestOrder = NonNullable<
  NonNullable<GetFacilityQueueQuery["queue"]>[number]
>;
export type QueriedDeviceType = NonNullable<
  GetFacilityQueueQuery["facility"]
>["deviceTypes"][number];
export type QueriedFacility = GetFacilityQueueQuery["facility"];

export type DevicesMap = Map<string, QueriedDeviceType>;

export interface QueueItemProps {
  queueItem: QueriedTestOrder;
  startTestPatientId: string | null;
  setStartTestPatientId: any;
  facility: QueriedFacility;
  refetchQueue: () => void;
  devicesMap: DevicesMap;
}

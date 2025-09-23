import { useState } from "react";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import Button from "../../commonComponents/Button/Button";

import DownloadResultsCsvModal from "./DownloadResultsCsvModal";

interface Props {
  filterParams: FilterParams;
  totalEntries: number;
  activeFacilityId: string;
}

const DownloadResultsCSVButton = ({
  filterParams,
  totalEntries,
  activeFacilityId,
}: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <>
      <Button variant="secondary" label="Sup secondary" />

      <Button
        variant="outline"
        icon={faDownload}
        label="Download results"
        onClick={openModal}
      />
      <DownloadResultsCsvModal
        filterParams={filterParams}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        totalEntries={totalEntries}
        activeFacilityId={activeFacilityId}
      />
    </>
  );
};

export default DownloadResultsCSVButton;

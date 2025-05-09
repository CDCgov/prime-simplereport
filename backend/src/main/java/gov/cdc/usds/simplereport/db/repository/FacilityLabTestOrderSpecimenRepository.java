package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityLabTestOrderSpecimen;
import gov.cdc.usds.simplereport.db.model.Specimen;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface FacilityLabTestOrderSpecimenRepository
    extends CrudRepository<FacilityLabTestOrderSpecimen, UUID> {
  @Query(
      "SELECT s "
          + "FROM FacilityLabTestOrder flto "
          + "JOIN FacilityLabTestOrderSpecimen fltos ON flto.internalId = fltos.facilityLabTestOrderId "
          + "JOIN Specimen s ON fltos.specimenId = s.internalId "
          + "WHERE flto.facilityId = :facilityId AND flto.labId = :labId")
  List<Specimen> findByFacilityIdAndLabId(
      @Param("facilityId") UUID facilityId, @Param("labId") UUID labId);
}

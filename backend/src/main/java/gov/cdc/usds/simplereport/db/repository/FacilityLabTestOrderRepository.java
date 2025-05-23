package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityLabTestOrder;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface FacilityLabTestOrderRepository extends CrudRepository<FacilityLabTestOrder, UUID> {
  @Query(
      value = "SELECT * FROM simple_report.facility_lab_test_order WHERE facility_id = :facilityId",
      nativeQuery = true)
  List<FacilityLabTestOrder> findByFacility(@Param("facilityId") UUID facilityId);

  @Modifying
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Query(
      value =
          "UPDATE simple_report.facility_lab_test_order SET name = :name, description = :description where facility_id = :facilityId and lab_id = :labId",
      nativeQuery = true)
  int updateByFacilityIdAndLabId(
      @Param("facilityId") UUID facilityId,
      @Param("labId") UUID labId,
      @Param("name") String name,
      @Param("description") String description);
}

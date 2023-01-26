package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface DeviceTestPerformedLoincCodeRepository
    extends CrudRepository<DeviceTestPerformedLoincCode, UUID> {}

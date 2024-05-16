package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ApiUserRole;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface ApiUserRoleRepository extends CrudRepository<ApiUserRole, UUID> {}

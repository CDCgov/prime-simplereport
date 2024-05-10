package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.UserOrgRole;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface UserOrgRoleRepository extends CrudRepository<UserOrgRole, UUID> {}

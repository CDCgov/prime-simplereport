package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = false)
public class TenantDataAccessService {

  public void setTenantDataAccess(ApiUser apiUser, Organization org) {
    // ensure user has no current valid tenant access
  }
}

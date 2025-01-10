package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;

/**
 * When the page content contains zero entries, this could be due to either: - zero search results
 * for the query string - OR due to zero users in the entire organization. The value for total users
 * in the org helps differentiate this.
 */
@Getter
@Setter
@AllArgsConstructor
public class ManageUsersPageWrapper {

  Page<ApiUserWithStatus> pageContent;

  int totalUsersInOrg;
}

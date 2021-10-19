package gov.cdc.usds.simplereport.api.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiOrganizationAdmin {
  private String name;
  private String email;
  private String phone;
}

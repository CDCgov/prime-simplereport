package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

public class PatientEmailsHolder {
  private String primary;
  private List<String> all;

  public PatientEmailsHolder(String primaryEmail, List<String> emails) {
    super();
    this.primary = primaryEmail;
    this.all = emails;
  }

  public String getDefault() {
    if (primary == null) {
      // If a default email is not specified, use the first element of the
      // patient email list
      if (all != null && !all.isEmpty()) {
        return all.get(0);
      }

      return null;
    }

    return primary;
  }

  public List<String> getFullList() {
    if (all == null) {
      if (primary == null) {
        // No email addresses supplied at all
        return Collections.emptyList();
      }

      return List.of(primary);
    }

    return all;
  }
}

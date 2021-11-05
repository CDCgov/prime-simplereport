package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

public class PatientEmailsHolder {
  private String _default;
  private List<String> _all;

  public PatientEmailsHolder(String defaultEmail, List<String> emails) {
    super();
    this._default = defaultEmail;
    this._all = emails;
  }

  public String getDefault() {
    if (_default == null) {
      // If a default email is not specified, use the first element of the
      // patient email list
      if (_all != null && !_all.isEmpty()) {
        return _all.get(0);
      }

      return null;
    }

    return _default;
  }

  public List<String> getFullList() {
    if (_all == null) {
      if (_default == null) {
        // No email addresses supplied at all
        return Collections.emptyList();
      }

      return List.of(_default);
    }

    return _all;
  }
}

package gov.cdc.usds.simplereport.api.converter;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ConvertToPatientProps {
  private String id;
  private PersonName name;
  private List<PhoneNumber> phoneNumbers;
  private List<String> emails;
  private String gender;
  private String genderIdentity;
  private LocalDate dob;
  private StreetAddress address;
  private String country;
  private String race;
  private String ethnicity;
  private String preferredLanguage;
  private List<String> tribalAffiliations;
}

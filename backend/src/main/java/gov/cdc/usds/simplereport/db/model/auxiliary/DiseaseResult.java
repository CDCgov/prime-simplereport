package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DiseaseResult {

  // this brings up a question - how do we make diseases easily accessible without requiring a
  // database read every
  // time?
  // They do need to be database entities, because other database objects will rely on them
  // but don't want to do a disease lookup every time we're entering a test result
  // could do some kind of initial read on loading the app, and use those objects throughout?
  // three supported disease objects that get held all the time
  // but does holding objects in memory work that way? outside request context?
  private SupportedDisease disease;

  private TestResult result;
}

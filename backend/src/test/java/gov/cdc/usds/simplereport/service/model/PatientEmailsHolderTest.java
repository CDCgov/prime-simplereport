package gov.cdc.usds.simplereport.service.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;

public class PatientEmailsHolderTest {
  @Test
  void default_returnsDefault() {
    var defaultEmail = "test@fake.com";

    var sut = new PatientEmailsHolder(defaultEmail, List.of(defaultEmail));

    assertEquals(defaultEmail, sut.getDefault());
  }

  @Test
  void default_isNull_returnsListElementAsDefault() {
    var defaultEmail = "test@fake.com";

    var sut = new PatientEmailsHolder(null, List.of(defaultEmail));

    assertEquals(defaultEmail, sut.getDefault());
  }

  @Test
  void default_allNull_returnsNull() {
    var sut = new PatientEmailsHolder(null, null);

    assertEquals(null, sut.getDefault());
  }

  @Test
  void allEmails_allNull_returnsEmptyList() {
    var sut = new PatientEmailsHolder(null, null);

    assertEquals(Collections.emptyList(), sut.getFullList());
  }

  @Test
  void allEmails_hasDefault_returnsList() {
    var defaultEmail = "test@fake.com";

    var sut = new PatientEmailsHolder(defaultEmail, null);

    assertEquals(1, sut.getFullList().size());
    assertEquals(defaultEmail, sut.getFullList().get(0));
  }

  @Test
  void allEmails_hasAll_returnsList() {
    var defaultEmail = "test@fake.com";
    var additionalEmail = "foo@bar.com";

    var sut = new PatientEmailsHolder(defaultEmail, List.of(defaultEmail, additionalEmail));

    assertEquals(List.of(defaultEmail, additionalEmail), sut.getFullList());
  }
}

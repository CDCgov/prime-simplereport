package gov.cdc.usds.simplereport.db.model.auxiliary;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.time.LocalDate;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class PatientSelfRegistrationTest {
  @Test
  void equality() {
    PatientSelfRegistration a =
        new PatientSelfRegistration(
            "123",
            null,
            "Boba",
            null,
            "Fett",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "boba@fett.net",
            "Human (Clone)",
            null,
            null,
            "Male",
            null,
            null,
            null);
    PatientSelfRegistration a2 =
        new PatientSelfRegistration(
            "123",
            null,
            "Boba",
            null,
            "Fett",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "boba@fett.net",
            "Human (Clone)",
            null,
            null,
            "Male",
            null,
            null,
            null);
    PatientSelfRegistration b =
        new PatientSelfRegistration(
            "123",
            null,
            "Jabba",
            null,
            "the Hutt",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "jabba@thehutt.org",
            "Hutt",
            null,
            null,
            "Male",
            null,
            null,
            null);
    assertEquals(a, a2);
    assertNotEquals(a, b);
  }

  @Test
  void hashing() {
    PatientSelfRegistration a =
        new PatientSelfRegistration(
            "123",
            null,
            "Boba",
            null,
            "Fett",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "boba@fett.net",
            "Human (Clone)",
            null,
            null,
            "Male",
            null,
            null,
            null);
    PatientSelfRegistration a2 =
        new PatientSelfRegistration(
            "123",
            null,
            "Boba",
            null,
            "Fett",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "boba@fett.net",
            "Human (Clone)",
            null,
            null,
            "Male",
            null,
            null,
            null);
    PatientSelfRegistration b =
        new PatientSelfRegistration(
            "123",
            null,
            "Jabba",
            null,
            "the Hutt",
            null,
            LocalDate.of(1987, 01, 01),
            null,
            null,
            null,
            null,
            "jabba@thehutt.org",
            "Hutt",
            null,
            null,
            "Male",
            null,
            null,
            null);

    HashSet<PatientSelfRegistration> hs = new HashSet<>();
    System.out.println(a.hashCode());
    System.out.println(a2.hashCode());
    System.out.println(b.hashCode());
    hs.add(a);
    hs.add(a2);
    hs.add(b);
    assertEquals(2, hs.size());
  }
}

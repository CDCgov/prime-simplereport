package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientBulkUploadServiceAsync {

  private final PersonService _personService;

  @Async
  public void savePatients(List<Person> people, List<PhoneNumber> numbers) {
    System.out.println("BOOYAH");
    System.out.println("security context: " + SecurityContextHolder.getContext());
    _personService.addPatientsAndPhoneNumbers(people, numbers);
    System.out.println("people saved");
  }
}

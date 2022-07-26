package gov.cdc.usds.simplereport.service.dataloader;

import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.is;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PatientPrimaryPhoneDataLoaderTest {
  int limit = 5000;
  @Mock PhoneNumberRepository mockPhoneNumberRepository;

  @Test
  void dataloaderMakesOneCallToRepository_whenLessThanLimitItemsAreRequested() {
    AtomicBoolean success = new AtomicBoolean();
    var dataloader = (new PatientPrimaryPhoneDataLoader(mockPhoneNumberRepository)).get();
    var res = dataloader.loadMany(generatePersonList(limit - 1));

    res.thenAccept(
        val -> {
          Mockito.verify(mockPhoneNumberRepository).findAllByInternalIdIn(Mockito.anyCollection());
          success.set(true);
        });

    dataloader.dispatch();
    await().untilAtomic(success, is(true));
  }

  @Test
  void dataloaderMakesMultipleCallsToRepository_whenGreaterThanLimitItemsAreRequested() {
    AtomicBoolean success = new AtomicBoolean();
    var dataloader = (new PatientPrimaryPhoneDataLoader(mockPhoneNumberRepository)).get();
    var times = 2;
    var res = dataloader.loadMany(generatePersonList(limit * times));

    res.thenAccept(
        val -> {
          Mockito.verify(mockPhoneNumberRepository, Mockito.times(times))
              .findAllByInternalIdIn(Mockito.anyCollection());
          success.set(true);
        });

    dataloader.dispatch();
    await().untilAtomic(success, is(true));
  }

  List<Person> generatePersonList(int count) {
    List<Person> personList = new ArrayList<>();
    var org = new Organization("SomeOrg", "SomeType", "SomeId", true);

    for (var i = 0; i < count; i++) {
      var p = new Person("FirstName", "Middle", "Last", "", org);
      p.setPrimaryPhone(new PhoneNumber(PhoneType.MOBILE, "+12485551234"));

      personList.add(p);
    }
    return personList;
  }
}

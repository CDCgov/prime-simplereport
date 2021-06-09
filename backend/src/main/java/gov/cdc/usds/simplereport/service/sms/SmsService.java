package gov.cdc.usds.simplereport.service.sms;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.twilio.type.PhoneNumber;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import java.util.UUID;
import javax.annotation.PostConstruct;
import javax.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
  private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

  @Value("${twilio.from-number}")
  private String rawFromNumber;

  @Autowired PatientLinkService pls;

  @Autowired SmsProviderWrapper sms;

  private PhoneNumber fromNumber;

  private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

  @PostConstruct
  void init() throws NumberParseException {
    this.fromNumber = new PhoneNumber(formatNumber(rawFromNumber));
    LOG.debug("SmsService will send from {}", rawFromNumber);
  }

  @AuthorizationConfiguration.RequirePermissionStartTestWithPatientLink
  @Transactional
  public String sendToPatientLink(UUID patientLinkId, String text) throws NumberParseException {
    PatientLink pl = pls.getRefreshedPatientLink(patientLinkId);
    return sendToPerson(pl.getTestOrder().getPatient(), text);
  }

  private String sendToPerson(Person p, String text) throws NumberParseException {
    String msgId = sms.send(new PhoneNumber(formatNumber(p.getTelephone())), fromNumber, text);
    LOG.debug("SMS send initiated {}", msgId);
    return msgId;
  }

  String formatNumber(String number) throws NumberParseException {
    return phoneUtil.format(phoneUtil.parse(number, "US"), PhoneNumberFormat.E164);
  }
}

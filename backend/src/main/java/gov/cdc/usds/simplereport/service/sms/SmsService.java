package gov.cdc.usds.simplereport.service.sms;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.twilio.exception.ApiException;
import com.twilio.exception.TwilioException;
import com.twilio.type.PhoneNumber;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.model.SmsDeliveryResult;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SmsService {
  private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

  @Value("${twilio.from-number}")
  private String rawFromNumber;

  @Autowired PatientLinkService pls;

  @Autowired SmsProviderWrapper sms;

  @Autowired TextMessageSentRepository tmsRepo;

  private PhoneNumber fromNumber;

  private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

  @PostConstruct
  void init() throws NumberParseException {
    this.fromNumber = new PhoneNumber(formatNumber(rawFromNumber));
    LOG.debug("SmsService will send from {}", rawFromNumber);
  }

  @AuthorizationConfiguration.RequirePermissionStartTestWithPatientLink
  @Transactional(noRollbackFor = {TwilioException.class, ApiException.class})
  public List<SmsDeliveryResult> sendToPatientLink(UUID patientLinkId, String text) {
    PatientLink pl = pls.getRefreshedPatientLink(patientLinkId);

    List<SmsDeliveryResult> smsSendResults = sendToPerson(pl.getTestOrder().getPatient(), text);

    smsSendResults.forEach(
        (smsDeliveryResult) -> {
          if (smsDeliveryResult.getDeliverySuccess() == false) {
            return;
          }

          tmsRepo.save(new TextMessageSent(pl, smsDeliveryResult.getMessageId()));
        });

    return smsSendResults;
  }

  private List<SmsDeliveryResult> sendToPerson(Person p, String text) {
    List<SmsDeliveryResult> smsSendResults = new ArrayList<>();

    p.getPhoneNumbers().stream()
        .forEach(
            phoneNumber -> {
              try {
                String msgId =
                    sms.send(
                        new PhoneNumber(formatNumber(phoneNumber.getNumber())), fromNumber, text);
                LOG.debug("SMS send initiated {}", msgId);

                smsSendResults.add(new SmsDeliveryResult(phoneNumber.getNumber(), msgId, true));
              } catch (NumberParseException npe) {
                LOG.warn("Failed to parse phone number for patient={}", p.getInternalId());
                smsSendResults.add(new SmsDeliveryResult(phoneNumber.getNumber(), null, false));
              } catch (ApiException apiException) {
                LOG.warn("Failed to send text message to patient={}", p.getInternalId());
                smsSendResults.add(new SmsDeliveryResult(phoneNumber.getNumber(), null, false));
              }
            });

    return smsSendResults;
  }

  String formatNumber(String number) throws NumberParseException {
    return phoneUtil.format(phoneUtil.parse(number, "US"), PhoneNumberFormat.E164);
  }
}

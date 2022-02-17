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
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.model.SmsAPICallResult;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class SmsService {
  @Autowired PatientLinkService pls;

  @Autowired SmsProviderWrapper sms;

  @Autowired TextMessageSentRepository tmsRepo;

  private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

  @PostConstruct
  void init() throws NumberParseException {
    log.debug("SmsService initialized");
  }

  @AuthorizationConfiguration.RequirePermissionStartTestWithPatientLink
  @Transactional(noRollbackFor = {TwilioException.class, ApiException.class})
  public List<SmsAPICallResult> sendToPatientLink(UUID patientLinkId, String text) {
    PatientLink pl = pls.getRefreshedPatientLink(patientLinkId);
    return sendToPatientLink(pl, text);
  }

  @AuthorizationConfiguration.RequirePermissionStartTestWithPatientLink
  @Transactional(noRollbackFor = {TwilioException.class, ApiException.class})
  public List<SmsAPICallResult> sendToPatientLink(PatientLink patientLink, String text) {
    List<SmsAPICallResult> smsSendResults =
        sendToPerson(patientLink.getTestOrder().getPatient(), text);

    smsSendResults.forEach(
        smsDeliveryResult -> {
          if (!smsDeliveryResult.isSuccessful()) {
            return;
          }

          tmsRepo.save(new TextMessageSent(patientLink, smsDeliveryResult.getMessageId()));
        });

    return smsSendResults;
  }

  private List<SmsAPICallResult> sendToPerson(Person p, String text) {
    return p.getPhoneNumbers().stream()
        .filter(phoneNumber -> !PhoneType.LANDLINE.equals(phoneNumber.getType()))
        .map(
            phoneNumber -> {
              try {
                String msgId =
                    sms.send(new PhoneNumber(formatNumber(phoneNumber.getNumber())), text);
                log.debug("SMS send initiated {}", msgId);

                return new SmsAPICallResult(phoneNumber.getNumber(), msgId, true);
              } catch (NumberParseException npe) {
                log.warn("Failed to parse phone number for patient={}", p.getInternalId());
                return new SmsAPICallResult(phoneNumber.getNumber(), null, false);
              } catch (ApiException apiException) {
                log.warn("Failed to send text message to patient={}", p.getInternalId());
                return new SmsAPICallResult(phoneNumber.getNumber(), null, false);
              }
            })
        .collect(Collectors.toList());
  }

  String formatNumber(String number) throws NumberParseException {
    return phoneUtil.format(phoneUtil.parse(number, "US"), PhoneNumberFormat.E164);
  }
}

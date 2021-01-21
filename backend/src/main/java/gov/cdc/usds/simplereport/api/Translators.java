package gov.cdc.usds.simplereport.api;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Date;


/**
 * Static package for utilities to translate things to or from wireline format in non copy-paste ways.
 */
public class Translators {

    private static DateTimeFormatter US_SLASHDATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
	private static DateTimeFormatter ISO_INSTANT_FORMATTER = DateTimeFormatter.ISO_INSTANT;

	public static final LocalDate parseUserDate(String userSuppliedDateString) {
		if (userSuppliedDateString == null) {
			return null;
		}
		if (userSuppliedDateString.contains("/")) {
			return LocalDate.parse(userSuppliedDateString, US_SLASHDATE_FORMATTER);
		} else {
			return LocalDate.parse(userSuppliedDateString); // ISO_LOCAL_DATE is the default
		}
	}

	public static final Date parseUserDateTime(String userSuppliedIsoDateString) {
		if (userSuppliedIsoDateString == null) {
			return null;
		}
		Instant isoDateInstant;
		try {
      		isoDateInstant = Instant.parse(userSuppliedIsoDateString);
		}
		catch (DateTimeParseException parseException) {
			throw new IllegalGraphqlArgumentException("[" + userSuppliedIsoDateString + "] is not a valid date.");
		}
      	return Date.from(isoDateInstant);
	}

	public static String parsePhoneNumber(String userSuppliedPhoneNumber) {
		if (userSuppliedPhoneNumber == null) {
			return null;
		}

		try {
			var phoneUtil = PhoneNumberUtil.getInstance();
			return phoneUtil.format(phoneUtil.parse(userSuppliedPhoneNumber, "US"),
					PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
		} catch (NumberParseException parseException) {
			throw new IllegalGraphqlArgumentException("[" + userSuppliedPhoneNumber + "] is not a valid phone number.");
		}
	}
}

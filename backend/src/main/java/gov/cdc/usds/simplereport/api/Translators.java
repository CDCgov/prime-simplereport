package gov.cdc.usds.simplereport.api;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Static package for utilities to translate things to or from wireline format in non copy-paste ways.
 */
public class Translators {

    private static DateTimeFormatter US_SLASHDATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");

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
}

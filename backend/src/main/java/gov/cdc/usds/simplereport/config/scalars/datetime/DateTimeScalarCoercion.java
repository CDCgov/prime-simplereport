package gov.cdc.usds.simplereport.config.scalars.datetime;

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import liquibase.repackaged.org.apache.commons.lang3.StringUtils;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;

class DateTimeScalarCoercion implements Coercing<Object, Object> {

    private final List<DateTimeFormatter> formatterList = List.of(
            DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME.withZone(ZoneOffset.UTC)
    );

    private Date convertImpl(Object input) {
        if (input == null) return null;
        else if (input instanceof String) {
            if(StringUtils.isBlank((String) input)){
                return null;
            }
            LocalDateTime localDateTime = getLocalDateTime((String) input);
            return Date.from(localDateTime.atZone(ZoneOffset.UTC).toInstant());
        } else if (input instanceof Date) {
            return (Date) input;
        }
        return null;
    }

    private LocalDateTime getLocalDateTime(String input) {
        for (DateTimeFormatter formatter: formatterList){
            try {
                return LocalDateTime.parse(input, formatter);
            } catch (DateTimeParseException e){}
        }
        return null;
    }

    @Override
    public Object serialize(Object dataFetcherResult) throws CoercingSerializeException {
        if (dataFetcherResult == null) {
            throw new CoercingSerializeException("Unable to serialize null value");
        }
        else if (dataFetcherResult instanceof String) {
            LocalDateTime localDateTime = getLocalDateTime((String) dataFetcherResult);
            return getDateString(localDateTime);
        } else if (dataFetcherResult instanceof Timestamp){
            LocalDateTime localDateTime = ((Timestamp) dataFetcherResult).toLocalDateTime();
            return getDateString(localDateTime);
        }

        return null;
    }

    private static String getDateString(LocalDateTime localDateTime) {
        return DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC).format(localDateTime);
    }

    @Override
    public Date parseValue(Object input) throws CoercingParseValueException {
        if (((String) input).length() == 0) {
            return null;
        }
        Date result = convertImpl(input);
        if (result == null) {
            throw new CoercingParseValueException("Invalid value '" + input + "' for Date");
        }
        return result;
    }

    @Override
    public Date parseLiteral(Object input) throws CoercingParseLiteralException {
        String value = ((StringValue) input).getValue();
        Date result = convertImpl(value);
        if (result == null) {
            throw new CoercingParseLiteralException("Invalid value '" + input + "' for Date");
        }

        return result;
    }
}


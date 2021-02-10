package gov.cdc.usds.simplereport.api.model;

import java.util.Map;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;

public class TestDescription {

    private static final TestDescription DEFAULT_TEST = new TestDescription("Unknown", "Unknown", "Unknown", "Unknown",
            "Unknown");

    private static final Map<String, TestDescription> KNOWN_TESTS = Map.of(
            "94534-5", new TestDescription(
                    "94534-5",
                    "SARS-CoV-2 (COVID-19) RdRp gene [Presence] in Respiratory specimen by NAA with probe detection",
                    "SARS-CoV-2 RdRp Resp Ql NAA+probe",
                    "SARS-CoV-2 (COVID-19) RdRp gene NAA+probe Ql (Resp)",
                    "SARS-CoV-2 (COVID-19) RdRp gene, Respiratory"),
            "95209-3", new TestDescription(
                    "95209-3",
                    "SARS-CoV+SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay",
                    "SARS-CoV+SARS-CoV-2 Ag Resp Ql IA.rapid",
                    "SARS-CoV+SARS-CoV-2 (COVID-19) Ag IA.rapid Ql (Resp)",
                    "SARS-CoV+SARS-CoV-2 (COVID-19) antigen, Respiratory"),
            "94558-4", new TestDescription(
                    "94558-4",
                    "SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay",
                    "SARS-CoV-2 Ag Resp Ql IA.rapid",
                    "SARS-CoV-2 (COVID-19) Ag IA.rapid Ql (Resp)",
                    "SARS-CoV-2 (COVID-19) antigen, Respiratory"));

    private String loincCode;
    private String longName;
    private String shortName;
    private String displayName;
    private String consumerName;

    protected TestDescription(String loincCode, String longName, String shortName, String displayName,
            String consumerName) {
        super();
        this.loincCode = loincCode;
        this.longName = longName;
        this.shortName = shortName;
        this.displayName = displayName;
        this.consumerName = consumerName;
    }

    public String getLoincCode() {
        return loincCode;
    }

    public String getName(String nameType) {
        switch(nameType) {
            case "short":
                return shortName;
            case "long":
                return longName;
            case "display":
                return displayName;
            case "consumer":
                return consumerName;
            default:
                throw new IllegalGraphqlArgumentException("Name type not recognized");
        }
    }

    public String getLongName() {
        return longName;
    }

    public String getShortName() {
        return shortName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getConsumerName() {
        return consumerName;
    }

    public static TestDescription findTestDescription(String loincCode) {
        return KNOWN_TESTS.getOrDefault(loincCode, DEFAULT_TEST);
    }
}

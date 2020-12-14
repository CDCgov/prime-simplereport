package gov.cdc.usds.simplereport.service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;

/**
 * Created by nickrobison on 11/21/20
 */
@Service
@Transactional
public class ExportService {

    private final TestEventRepository _ts;

    public ExportService(TestEventRepository ts) {
        this._ts = ts;
    }

    public String CreateTestEventCSV() throws IOException {
        List<TestEvent> events = _ts.findAllByCreatedAtInstant(Instant.parse("2020-12-11T16:13:15.448000Z"));
        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader();
        return mapper.writer(schema).writeValueAsString(eventsToExport);
    }
}

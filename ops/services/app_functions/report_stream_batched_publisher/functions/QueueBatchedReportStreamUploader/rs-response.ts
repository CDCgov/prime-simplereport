interface ReportingDestination {
  organization: string;
  organization_id: string;
  service: string;
  sending_at: string;
  itemCount: number;
}

interface ReportStreamError {
  id: string;
  scope: "ITEM" | "REPORT";
  details: string;
}

export interface ReportStreamResponse {
  id: string;
  timestamp: string;
  topic: string;
  reportItemCount: number;
  destinations: ReportingDestination[];
  destinationCount: number;
  routing: [
    {
      reportIndex: number;
      trackingId: string;
      destinations: string[];
    }
  ];
  warningCount: number;
  errorCount: number;
  errors: ReportStreamError[];
  warnings: ReportStreamError[];
}

export interface SimpleReportReportStreamResponse {
  testEventInternalId: string;
  isError: boolean;
  details: string;
}

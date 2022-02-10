interface ReportingDestination {
  organization: string;
  organization_id: string;
  service: string;
  filteredReportRows: string[];
  sending_at: string;
  itemCount: number;
}

export interface ReportStreamError {
  scope: "ITEM" | "REPORT";
  message: string;
}

export interface ReportStreamResponse {
  id: string;
  timestamp: string;
  topic: string;
  reportItemCount: number;
  sender: string;
  routing: [
    {
      reportIndex: number;
      trackingId: string;
      destinations: string[];
    }
  ];
  destinations: ReportingDestination[];
  destinationCount: number;
  warningCount: number;
  errorCount: number;
  errors: ReportStreamError[];
  warnings: ReportStreamError[];
}

export interface SimpleReportReportStreamResponse {
  isError: boolean;
  details: string;
}

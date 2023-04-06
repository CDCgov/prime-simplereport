import { TelemetryClient } from "applicationinsights";
import { Context } from "@azure/functions";

interface ReportingDestination {
  organization: string;
  organization_id: string;
  service: string;
  sending_at: string;
  itemCount: number;
}

export interface ReportStreamError {
  scope: "item" | "report";
  trackingIds?: string[];
  message: string;
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

export interface ReportStreamCallbackRequest
  extends SimpleReportReportStreamResponse {
  queueName: string;
}

export interface ReportStreamTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at_seconds: number;
  scope: string;
  sub: string;
}

export interface publisherLogging {
  telemetry: TelemetryClient;
  context: Context;
}

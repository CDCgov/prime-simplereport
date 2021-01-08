export type Severity = 'Sev0' | 'Sev1' | 'Sev2' | 'Sev3';
export type Condition = 'Resolved' | 'Fired';

export interface Essentials {
    alertId: string;
    alertRule: string;
    severity: Severity;
    signalType: string;
    monitorCondition: Condition;
    monitoringService: string;
    alertTargetIDs: string[];
    originAlertId: string;
    firedDateTime: string;
    resolvedDateTime: string;
    description: "",
    essentialsVersion: string;
    alertContextVersion: string;
}

export interface AlertContext {
    properties: any;
    conditionType: string;
    condition: any;
}


export interface AlertSchema {
    schemaId: 'azureMonitorCommonAlertSchema';
    data : {
        essentials: Essentials;
        alertContext: AlertContext;
    }
}

export function isAlertSchema(schema: any): schema is AlertSchema {
    return typeof schema.schemaId === 'string';
}

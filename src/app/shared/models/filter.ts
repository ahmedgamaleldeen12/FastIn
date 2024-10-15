export interface LogFilter {
    startDate?: string;
    endDate?: string;
    logTypeId?: string[];
    logWayId? :number | null;
    employeeId?:string | null
}

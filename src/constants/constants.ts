import { pageEvent } from "@model/app.model"

// PAGINATOR
export const DEFAULT_PAGESIZE_OPTION = [5, 10, 25, 100]
export const DEFAULT_PAGESIZE = 10
export const DEFAULT_PAGEINDEX = 0


// Headers
export const HEADERS_WORKLOG = [
    {label: 'WorkLog Id',value:'id'},
    {label: 'Issue Key',value:'issueKey'},
    {label: 'Summary',value:'summary'},
    {label: 'Client', value:'client'},
    {label: 'Time Spend',value:'timeSpend'},
    {label: 'Started',value:'started'},
    {label: 'Ended',value:'created'},
]

export const DEFAULT_PAGE_EVENT:pageEvent = { pageIndex: 0, pageSize: 10, previousPageIndex : 0}

export const CLIENT_FIELD_NAME = 'customfield_10265'

export const ORGANISATION_FIELD_NAME = 'customfield_10002'

export const UNKNOWN_CLIENT = 'Not Available'
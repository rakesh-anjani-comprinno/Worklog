export interface User {
    self?: string,
    accountId?: string,
    accountType?: string,
    avatarUrls?: object,
    displayName?: string,
    active?: boolean,
    locale?: string
}

export interface Issue {
    expand: "schema,names",
    startAt: number,
    maxResults: number,
    total: number,
    issues: Array<any>
}

export interface pageEvent { 
    pageSize: number;
    pageIndex: number
}


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
    maxResults: number,
    isLast:boolean,
    nextPageToken?:string,
    issues: Array<any>
}

export interface pageEvent { 
    pageSize: number;
    pageIndex: number
    previousPageIndex?: number;
    length?: number;
}


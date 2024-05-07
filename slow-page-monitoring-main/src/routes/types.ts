export interface Record {
    route: string;
    routeUrl: string;
    title: string,
    type: string;
    createTime: number;
    url?: string;
    params?: string;
    detail?: string;
    useTime?: string;
    taskName: string;
}

export interface Tasks {
    id: number;
    taskName: string;
    createTime: number;
}
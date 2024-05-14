export interface IAndesiteApiConfigDTO {
    ProjectType: string;
    Config: {
        Logger: boolean;
        EntryPoint: string;
        OutputPath: string;
        PathAlias: string;
    };
    Infrastructure: Record<string, unknown>;
    Server: {
        Host: string;
        Port: number;
        BaseUrl: string;
        Security: {
            AllowedIPs: string[] | string;
            BlockedIPs: string[] | string;
            AllowedOrigins: string[] | string;
        };
    };
}
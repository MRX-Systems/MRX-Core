export interface IAndesiteApiConfigDTO {
    ProjectType: string;
    Config: {
        Logger: boolean;
        BaseSourceDir: string,
        EntryPoint: string;
        OutputDir: string;
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
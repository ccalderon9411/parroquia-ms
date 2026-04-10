export interface AppConfiguration {
    project: {
        apiPrefix: string;
        name: string;
        version: string;
        description: string;
        author: {
            name: string;
            url: string;
            email: string;  
        };
        repository: any;
        bugs: any;
        homepage: any;
    };
    server: {
        port: number;
        context: string;
        cors: {
            enabled: boolean;
            credentials: boolean;
            origins: string | string[];
            allowedHeaders: string;
            allowedMethods: string;
        };
    };
    swagger: {
        path: string;
        enabled: boolean;
    };
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    [key: string]: any;
}
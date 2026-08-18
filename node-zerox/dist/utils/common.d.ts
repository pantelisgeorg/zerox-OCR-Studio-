export declare const camelToSnakeCase: (str: string) => string;
export declare const convertKeysToCamelCase: (obj: Record<string, any> | null) => Record<string, any>;
export declare const convertKeysToSnakeCase: (obj: Record<string, any> | null) => Record<string, any>;
export declare const isString: (value: string | null) => value is string;
export declare const isValidUrl: (string: string) => boolean;
export declare const formatMarkdown: (text: string) => string;
export declare const runRetries: <T>(operation: () => Promise<T>, maxRetries: number, pageNumber: number) => Promise<T>;
export declare const snakeToCamelCase: (str: string) => string;
export declare const splitSchema: (schema: Record<string, unknown>, extractPerPage?: string[]) => {
    fullDocSchema: Record<string, unknown> | null;
    perPageSchema: Record<string, unknown> | null;
};

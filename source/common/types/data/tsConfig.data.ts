/**
 * Interface for the tsconfig.json file.
 */
export interface TsConfig {
    compilerOptions: {
        [key: string]: unknown;
        rootDir: string;
        baseUrl: string;
        paths: Record<string, string[]>;
      };
      include: string[];
      exclude: string[];
      [key: string]: unknown;
}

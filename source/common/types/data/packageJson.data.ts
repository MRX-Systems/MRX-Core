/**
 * Interface for the package.json
 */
export interface PackageJson {
    name: string,
    version: string,
    description: string,
    author: string,
    license: string,
    type: string,
    scripts: Record<string, string>,
    keywords: string[],
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
    peerDependencies: Record<string, string>,
    [key: string]: unknown
}

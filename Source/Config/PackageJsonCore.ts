import pkg from '../../package.json' with { type: 'json' };

/**
 * PackageJsonCore is an object that contains information from the package.json file
 */
export const PackageJsonCore = {
    version: pkg.version,
};

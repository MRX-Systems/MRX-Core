import { existsSync, mkdirSync, rmdirSync } from 'fs';

import { __test__ } from '../../../Source/Domain/Service/PackageJsonGenerator';

describe('PackageJsonGenerator', (): void => {
     describe('buildPackageJsonObject', (): void => {
        it('should build package.json object for API', (): void => {
            const packageJson = __test__.buildPackageJsonObject({
                name: 'Test',
                description: 'Test',
                type: 'API'
            });
            expect(packageJson).toHaveProperty('name');
            expect(packageJson).toHaveProperty('version');
            expect(packageJson).toHaveProperty('description');
            expect(packageJson).toHaveProperty('scripts');
            expect(packageJson).toHaveProperty('keywords');
            expect(packageJson).toHaveProperty('dependencies');
            expect(packageJson).toHaveProperty('devDependencies');
        });

        it('should build package.json object for Worker Manager', (): void => {
            const packageJson = __test__.buildPackageJsonObject({
                name: 'Test',
                description: 'Test',
                type: 'Worker Manager'
            });
            expect(packageJson).toHaveProperty('name');
            expect(packageJson).toHaveProperty('version');
            expect(packageJson).toHaveProperty('description');
            expect(packageJson).toHaveProperty('scripts');
            expect(packageJson).toHaveProperty('keywords');
            expect(packageJson).not.toHaveProperty('dependencies');
            expect(packageJson).not.toHaveProperty('devDependencies');
        });

        it('should build package.json object for Library', (): void => {
            const packageJson = __test__.buildPackageJsonObject({
                name: 'Test',
                description: 'Test',
                type: 'Library'
            });
            expect(packageJson).toHaveProperty('name');
            expect(packageJson).toHaveProperty('version');
            expect(packageJson).toHaveProperty('description');
            expect(packageJson).toHaveProperty('scripts');
            expect(packageJson).toHaveProperty('keywords');
            expect(packageJson).not.toHaveProperty('dependencies');
            expect(packageJson).not.toHaveProperty('devDependencies');
        });

        it('should build package.json object for Sample Script', (): void => {
            const packageJson = __test__.buildPackageJsonObject({
                name: 'Test',
                description: 'Test',
                type: 'Sample Script'
            });
            expect(packageJson).toHaveProperty('name');
            expect(packageJson).toHaveProperty('version');
            expect(packageJson).toHaveProperty('description');
            expect(packageJson).toHaveProperty('scripts');
            expect(packageJson).toHaveProperty('keywords');
            expect(packageJson).not.toHaveProperty('dependencies');
            expect(packageJson).not.toHaveProperty('devDependencies');
        });

        it('should build package.json object for default', (): void => {
            const packageJson = __test__.buildPackageJsonObject({
                name: 'Test',
                description: 'Test',
                type: 'Test'
            });
            expect(packageJson).toHaveProperty('name');
            expect(packageJson).toHaveProperty('version');
            expect(packageJson).toHaveProperty('description');
            expect(packageJson).toHaveProperty('scripts');
            expect(packageJson).toHaveProperty('keywords');
            expect(packageJson).not.toHaveProperty('dependencies');
            expect(packageJson).not.toHaveProperty('devDependencies');
        });
    });

    describe('createPackageJson', (): void => {
        it('should throw AndesiteError when package.json file already exists', (): void => {
            expect(() => __test__.createPackageJson({
                name: 'Test',
                description: 'Test',
                type: 'API'
            }, '.'))
            .toThrow('ERROR_PACKAGE_JSON_EXISTS');
        });

        it('should create package.json file', (): void => {
            mkdirSync('./packageTest');
            __test__.createPackageJson({
                name: 'Test',
                description: 'Test',
                type: 'API'
            }, './packageTest');
            expect(existsSync('./packageTest/package.json')).toBe(true);
            rmdirSync('./packageTest', { recursive: true });
        });

        it('should create package.json file with default path', (): void => {
            mkdirSync('./example');
            __test__.createPackageJson({
                name: 'Test',
                description: 'Test',
                type: 'API'
            });
            expect(existsSync('./example/package.json')).toBe(true);
            if (existsSync('./example'))
                rmdirSync('./example', { recursive: true });
        });
    });
});
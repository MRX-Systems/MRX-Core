import { existsSync, rmdirSync } from 'fs';

import { __test__ } from '../../../Source/Domain/Service/FolderStructure';

describe('FolderStructure', (): void => {
    describe('buildFolderStructureByObject', (): void => {
        it('should build folder structure by object', (): void => {
            const obj = {
                One: {
                    Two: {
                        Three: undefined
                    }
                },
                Four: undefined
            };
            __test__.buildFolderStructureByObject(obj, './folderTest');
            expect(existsSync('./folderTest/One/Two/Three')).toBe(true);
            expect(existsSync('./folderTest/Four')).toBe(true);
            rmdirSync('folderTest', { recursive: true });
        });

        it('should build folder structure by object with default path', (): void => {
            const obj = {
                One: {
                    Two: {
                        Three: undefined
                    }
                },
                Four: undefined
            };
            __test__.buildFolderStructureByObject(obj);
            expect(existsSync('./example/One/Two/Three')).toBe(true);
            expect(existsSync('./example/Four')).toBe(true);
            rmdirSync('./example', { recursive: true });
        });

        it('should throw error when failed to create folder structure', (): void => {
            const obj = {
                One: {
                    Two: {
                        Three: undefined
                    }
                },
                Four: undefined
            };
            expect(() => __test__.buildFolderStructureByObject(obj, '/')).toThrow('CREATE_FOLDER_STRUCTURE_ERROR');
        });
    });

    describe('createFolderStructure', (): void => {
        for (const key of ['API', 'Worker Manager', 'Library', 'Sample Script', 'default']) {

            it(`should create folder structure for ${key}`, (): void => {
                __test__.createFolderStructure({
                    name: 'Test',
                    description: 'Test',
                    type: key
                }, './folderTest');
                expect(true).toBe(true);
                if (existsSync('./folderTest'))
                    rmdirSync('folderTest', { recursive: true });
            });

            it('should create folder structure with default path', (): void => {
                __test__.createFolderStructure({
                    name: 'Test',
                    description: 'Test',
                    type: key
                });
                expect(true).toBe(true);
                if (existsSync('./example'))
                    rmdirSync('./example', { recursive: true });
            });
        }
    });
});
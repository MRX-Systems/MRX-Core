const args = process.argv.slice(2);

const [packageNameToSearch] = args;
console.log('Search:', packageNameToSearch);

import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';

const nodeModulesDir = join(process.cwd(), 'node_modules');

async function findDependents(packageName: string): Promise<string[]> {
    const dependents: string[] = [];

    for (const dir of await readdir(nodeModulesDir)) {
        const packageJsonPath = join(nodeModulesDir, dir, 'package.json');
        if (!existsSync(packageJsonPath))
            continue;
        const depPackageJson = await import(packageJsonPath);
        
        if (depPackageJson.dependencies && (depPackageJson.dependencies[packageName] || depPackageJson.devDependencies[packageName])) {
            dependents.push(dir);
            const subDependents = await findDependents(dir);
            dependents.push(...subDependents);
        }
    }
    return dependents;
}

try {
    const dependents = await findDependents(packageNameToSearch);
    console.log(`Packages that depend on ${packageNameToSearch}:`, dependents);
} catch (err) {
    console.error(err);
}


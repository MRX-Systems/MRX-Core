import { bench, group, run, barplot, summary } from 'mitata';

/**
 * Configuration of object sizes to test
 */
const OBJECT_SIZES: number[] = [10, 100, 1000, 10000];

/**
 * Creates an object with the specified number of properties
 * @param size - The number of properties to create
 * @returns An object with properties key0, key1, etc.
 */
function _createObject(size: number): Record<string, number> {
    const obj: Record<string, number> = {};
    for (let i = 0; i < size; ++i)
        obj[`key${i}`] = i;
    return obj;
}

/**
 * Benchmark using for...in to iterate over properties
 * @param obj - The object to iterate over
 * @returns The sum of all values
 */
function _benchmarkForIn(obj: Record<string, number>): number {
    let sum = 0;
    for (const key in obj)
        sum += obj[key] ?? 0;
    return sum;
}

/**
 * Benchmark using Object.keys() to iterate over properties
 * @param obj - The object to iterate over
 * @returns The sum of all values
 */
function _benchmarkObjectKeysWithFor(obj: Record<string, number>): number {
    let sum = 0;
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; ++i)
        sum += obj[keys[i] as string] ?? 0;

    return sum;
}

function _benchmarkObjectKeysWithWhile(obj: Record<string, number>): number {
    let sum = 0;
    const keys = Object.keys(obj);
    let i = 0;
    while (i < keys.length) {
        sum += obj[keys[i] as string] ?? 0;
        ++i;
    }
    return sum;
}

/**
 * Benchmark using Object.keys() with forEach
 * @param obj - The object to iterate over
 * @returns The sum of all values
 */
function _benchmarkObjectKeysForEach(obj: Record<string, number>): number {
    let sum = 0;
    Object.keys(obj).forEach((key: string) => {
        sum += obj[key] ?? 0;
    });
    return sum;
}

/**
 * Benchmark using Object.entries()
 * @param obj - The object to iterate over
 * @returns The sum of all values
 */
function _benchmarkObjectEntries(obj: Record<string, number>): number {
    let sum = 0;
    for (const [, value] of Object.entries(obj))
        sum += value;
    return sum;
}

// Creation of test objects
const testObjects = new Map<number, Record<string, number>>();
for (const size of OBJECT_SIZES)
    testObjects.set(size, _createObject(size));

// Bar charts for each object size
console.log('\n📊 Comparative charts by object size:\n');

for (const size of OBJECT_SIZES) {
    const testObj = testObjects.get(size);
    if (!testObj) continue;

    barplot(() => {
        summary(() => {
            group(`Method comparison for ${size} properties`, () => {
                bench('for...in', () => {
                    _benchmarkForIn(testObj);
                });

                bench('Object.keys() + classic for', () => {
                    _benchmarkObjectKeysWithFor(testObj);
                });

                bench('Object.keys() + while', () => {
                    _benchmarkObjectKeysWithWhile(testObj);
                });

                bench('Object.keys() + forEach', () => {
                    _benchmarkObjectKeysForEach(testObj);
                });

                bench('Object.entries()', () => {
                    _benchmarkObjectEntries(testObj);
                });
            });
        });
    });
}


// Running the benchmarks
console.log('🚀 Starting for...in vs Object.keys() benchmarks');
console.log('📊 Performance comparison of iteration methods on different object sizes\n');

await run({
    colors: true
});

console.log('\n✅ Benchmarks completed!');
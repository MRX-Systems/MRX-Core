import { bench, group, run, barplot, summary } from 'mitata';

/**
 * Configuration of array sizes to test
 */
const ARRAY_SIZES: number[] = [10, 100, 1000, 10000, 100000];

/**
 * Creates an array with the specified number of elements
 * @param size - The number of elements to create
 * @returns An array with numeric values [0, 1, 2, ...]
 */
function _createArray(size: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < size; ++i)
        arr.push(i);
    return arr;
}

/**
 * Benchmark using classic for loop with index
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkClassicFor(arr: number[]): number {
    let sum = 0;
    for (let i = 0; i < arr.length; ++i)
        sum += arr[i] ?? 0;
    return sum;
}

/**
 * Benchmark using reverse classic for loop with index
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkReverseFor(arr: number[]): number {
    let sum = 0;
    for (let i = arr.length - 1; i >= 0; --i)
        sum += arr[i] ?? 0;
    return sum;
}

/**
 * Benchmark using while loop
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkWhile(arr: number[]): number {
    let sum = 0;
    let i = 0;
    while (i < arr.length) {
        sum += arr[i] ?? 0;
        ++i;
    }
    return sum;
}

/**
 * Benchmark using do...while loop
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkDoWhile(arr: number[]): number {
    let sum = 0;
    let i = 0;
    do {
        sum += arr[i] ?? 0;
        ++i;
    } while (i < arr.length);
    return sum;
}

/**
 * Benchmark using for...of loop
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkForOf(arr: number[]): number {
    let sum = 0;
    for (const value of arr)
        sum += value;
    return sum;
}

/**
 * Benchmark using forEach method
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkForEach(arr: number[]): number {
    let sum = 0;
    arr.forEach((value: number) => {
        sum += value;
    });
    return sum;
}

/**
 * Benchmark using reduce method
 * @param arr - The array to iterate over
 * @returns The sum of all values
 */
function _benchmarkReduce(arr: number[]): number {
    return arr.reduce((sum: number, value: number) => sum + value, 0);
}

/**
 * Benchmark using map method (for transformation scenarios)
 * @param arr - The array to iterate over
 * @returns The sum of all values after mapping
 */
function _benchmarkMap(arr: number[]): number {
    const doubled = arr.map((value: number) => value * 2);
    return doubled.reduce((sum: number, value: number) => sum + value, 0);
}

// Creation of test arrays
const testArrays = new Map<number, number[]>();
for (const size of ARRAY_SIZES)
    testArrays.set(size, _createArray(size));

// Bar charts for each array size
console.log('\n📊 Array iteration methods comparison:\n');

for (const size of ARRAY_SIZES) {
    const testArr = testArrays.get(size);
    if (!testArr) continue;

    barplot(() => {
        summary(() => {
            group(`Array iteration for ${size} elements`, () => {
                bench('Classic for loop', () => {
                    _benchmarkClassicFor(testArr);
                });

                bench('Reverse for loop', () => {
                    _benchmarkReverseFor(testArr);
                });

                bench('While loop', () => {
                    _benchmarkWhile(testArr);
                });

                bench('Do...while loop', () => {
                    _benchmarkDoWhile(testArr);
                });

                bench('for...of', () => {
                    _benchmarkForOf(testArr);
                });

                bench('forEach', () => {
                    _benchmarkForEach(testArr);
                });

                bench('reduce', () => {
                    _benchmarkReduce(testArr);
                });

                bench('map + reduce', () => {
                    _benchmarkMap(testArr);
                });
            });
        });
    });
}


// Running the benchmarks
console.log('🚀 Starting array iteration methods benchmarks');
console.log('📊 Performance comparison of iteration methods on different array sizes\n');

await run({
    colors: true
});

console.log('\n✅ Array iteration benchmarks completed!');
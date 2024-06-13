/**
 * Sleep for the specified time.
 *
 * @param ms - The time to sleep in milliseconds
 *
 * @returns A promise that resolves after the specified time.
 */
function sleep(ms: number = 0): Promise<void> {
    return new Promise(resolve => {setTimeout(resolve, ms);});
}

export {
    sleep
};

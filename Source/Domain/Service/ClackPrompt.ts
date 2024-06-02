import {
    intro as _intro,
    outro as _outro,
    select as _select,
    cancel as _cancel,
    text as _text,
    spinner as _spinner,
    isCancel
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
} from '@clack/prompts';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Interface for the options of the select prompt.
 */
interface IOptions {
    value: string | boolean | number;
    label: string;
    hint?: string;
}

/**
 * Interface for the options of the select prompt.
 */
interface ISelectOptions {
    message: string;
    options: IOptions[];
    initialValue?: string | boolean | number;
}

/**
 * Interface for the options of the text prompt.
 */
interface ITextOptions {
    message: string;
    placeholder?: string;
    defaultValue?: string;
    initialValue?: string;
    validate?: (value: string) => string | void;
}

/**
 * Interface for the options of the spinner prompt.
 */
interface ISpinnerOptions {
    start: (msg?: string) => void;
    stop: (msg?: string, code?: number) => void;
    message: (msg?: string) => void;
}

/**
 * Display the intro message.
 * 
 * @param message - The message to display in the intro.
 */
function intro(message: string): void {
    _intro(message);
}

/**
 * Display the outro message.
 * 
 * @param message - The message to display in the outro.
 */
function outro(message: string): void {
    _outro(message);
}

/**
 * Throw an error when the user cancels the prompt.
 * 
 * @throws {@link AndesiteError} - If the user cancels the prompt. {@link ServiceErrorKeys.ERROR_CANCEL_PROMPT}
 */
function _throwWhenCancel(): void {
    throw new AndesiteError({
        messageKey: ServiceErrorKeys.ERROR_CANCEL_PROMPT,
    });
}

/**
 * Display the outro message based on the time of the day.
 * 
 * @param dayMessage - The message to display if it is day time.
 * @param nightMessage - The message to display if it is night time.
 */
function outroBasedOnTime(
    dayMessage: string = 'Have a great day! 🌞',
    nightMessage: string = 'Have a great night! 🌚'
): void {
    const date = new Date();
    if (date.getHours() >= 8 && date.getHours() <= 18)
        _outro(dayMessage);
    else
        _outro(nightMessage);
}

/**
 * Cancel the prompt.
 * 
 * @param message - The message to display when the prompt is canceled.
 */
function cancel(message: string = 'Canceled'): void {
    _cancel(message);
}

/**
 * Display a select prompt to the user.
 * 
 * @param opt - The options for the select prompt.
 * 
 * @throws {@link AndesiteError} - If the user cancels the prompt. {@link ServiceErrorKeys.ERROR_CANCEL_PROMPT}
 * 
 * @returns The value selected by the user.
 */
async function select(opt: ISelectOptions): Promise<string | number | boolean | symbol>  {
    const result = await _select({
        message: opt.message,
        initialValue: opt.initialValue ?? '',
        options: opt.options.map((option) => ({
            value: option.value,
            label: option.label,
            hint: option.hint ?? ''
        })),
    });
    if (isCancel(result))
        _throwWhenCancel();
    return result;
}

/**
 * Display a text prompt to the user.
 * 
 * @param opt - The options for the text prompt.
 * 
 * @throws {@link AndesiteError} - If the user cancels the prompt. {@link ServiceErrorKeys.ERROR_CANCEL_PROMPT}
 *
 * @returns The value entered by the user.
 */
function text(opt: ITextOptions): Promise<string | symbol> {
    const result = _text({
        message: opt.message,
        placeholder: opt.placeholder ?? '',
        defaultValue: opt.defaultValue ?? '',
        initialValue: opt.initialValue ?? '',
        validate: opt.validate ?? (():undefined => undefined)
    });
    if (isCancel(result))
        _throwWhenCancel();
    return result;
}

/**
 * Display a spinner prompt to the user.
 * 
 * @returns The spinner options.
 */
function spinner(): ISpinnerOptions {
    return _spinner();
}

export {
    intro,
    outro,
    outroBasedOnTime,
    cancel,
    select,
    text,
    spinner
};

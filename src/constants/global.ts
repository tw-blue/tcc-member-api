export const STRING_ERROR_MARKER = '!STRING_ERROR_MARKER!';
export const STRING_MISSING_MARKER = "!STRING_MISSING_MARKER!";

export function wrap_string_error(callback: () => string): string {
    try {
        return callback();
    } catch {
        return STRING_ERROR_MARKER;
    }
}

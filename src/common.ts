import { ClipboardEvent } from "react";

export type Brand<T, Brand extends string> = T & {
    readonly [B in Brand as `__${B}_brand`]: never;
};

export const withoutPrefix = (s: string) => {
    const regex: RegExp = /^(?:\d+\.\s+|-\s+)/;
    return s.replace(regex, "");
};

export const withoutTrailingDot = (s: string) => {
    if (s.endsWith(".")) {
        return s.slice(0, -1);
    } else {
        return s;
    }
};

export type InputOrTextArea = HTMLInputElement | HTMLTextAreaElement;

// This is quite ugly, but I wasn't able to override paste with default behaviour :-(
export const pasteToInput = (event: ClipboardEvent, value: string, set: (value: string) => void) => {
    event.stopPropagation();
    const pasted = event.clipboardData.getData("text");
    const inputField = event.target as InputOrTextArea;
    const start = inputField.selectionStart;
    const end = inputField.selectionEnd;
    if (start !== null && end !== null) {
        set(value.slice(0, start) + pasted + value.slice(end));
    }
};

export const validKey = (s: string) => s.length > 40 && s.substring(0, 3) === "sk-";

export const equalArrays = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

export function withReplacedElement<T>(elements: T[], index: number, replacer: T) {
    return [...elements.slice(0, index), replacer, ...elements.slice(index)];
}

export function withoutElement<T>(elements: T[], index: number) {
    return [...elements.slice(0, index), ...elements.slice(index)];
}

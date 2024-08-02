
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
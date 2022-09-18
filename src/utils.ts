export function liftToNonNullList<T>(t: T | null): T[] {
    return t !== null ? [t] : [];
}

export function maxOn<T, U>(mapper: (t: T) => U): (a: T, b: T) => T {
    return (a, b) => mapper(a) > mapper(b) ? a : b;
}

export function minOn<T, U>(mapper: (t: T) => U): (a: T, b: T) => T {
    return (a, b) => mapper(a) < mapper(b) ? a : b;
}

export function run<T>(f: () => T): T {
    return f();
}

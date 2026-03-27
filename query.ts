export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export function createWhere<T>(): Where<T> {
    return <K extends keyof T>(key: K, value: T[K]): Transform<T> => {
        return (data: T[]): T[] => {
            return data.filter(item => item[key] === value);
        };
    };
}
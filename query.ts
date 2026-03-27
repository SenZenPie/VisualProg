export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export function createWhere<T>(): Where<T> {
    return <K extends keyof T>(key: K, value: T[K]): Transform<T> => {
        return (data: T[]): T[] => {
            return data.filter(item => item[key] === value);
        };
    };
}

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

export function createSort<T>(): Sort<T> {
    return <K extends keyof T>(key: K): Transform<T> => {
        return (data: T[]): T[] => {
            return [...data].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];
                
                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
                return 0;
            });
        };
    };
}

export type Group<T, K extends keyof T> = {
    key: T[K];
    items: T[];
};

export type GroupBy<T> = <K extends keyof T>(key: K) => (data: T[]) => Group<T, K>[];

export function createGroupBy<T>(): GroupBy<T> {
    return <K extends keyof T>(key: K) => {
        return (data: T[]): Group<T, K>[] => {
            const groupsMap = new Map<T[K], Group<T, K>>();
            
            for (const item of data) {
                const groupKey = item[key];
                
                if (!groupsMap.has(groupKey)) {
                    groupsMap.set(groupKey, {
                        key: groupKey,
                        items: []
                    });
                }
                
                groupsMap.get(groupKey)!.items.push(item);
            }
            
            return Array.from(groupsMap.values());
        };
    };
}
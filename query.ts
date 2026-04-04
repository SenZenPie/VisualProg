export type Transform<T> = (data: T[]) => T[];

export type Group<T, K extends keyof T> = {
    key: T[K];
    items: T[];
};

export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];

// Типы для операций
export type WhereOp<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export type GroupByOp<T> = <K extends keyof T>(key: K) => (data: T[]) => Group<T, K>[];

export type HavingOp<T> = <K extends keyof T>(
    predicate: (group: Group<T, K>) => boolean
) => GroupTransform<T, K>;

export type SortOp<T> = <K extends keyof T>(key: K) => Transform<T>;

export function createWhere<T>(): WhereOp<T> {
    return (key, value) => (data: T[]) => data.filter(item => item[key] === value);
}

export function createSort<T>(): SortOp<T> {
    return (key) => (data: T[]) => {
        return [...data].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        });
    };
}

export function createGroupBy<T>(): GroupByOp<T> {
    return (key) => (data: T[]) => {
        const groupsMap = new Map<any, Group<T, any>>();
        for (const item of data) {
            const groupKey = item[key];
            if (!groupsMap.has(groupKey)) {
                groupsMap.set(groupKey, { key: groupKey, items: [] });
            }
            groupsMap.get(groupKey)!.items.push(item);
        }
        return Array.from(groupsMap.values());
    };
}

export function createHaving<T>(): HavingOp<T> {
    return (predicate) => (groups) => groups.filter(predicate);
}

// Query builder с контролем порядка
export class QueryBuilder<T> {
    private steps: any[] = [];
    private hasWhere: boolean = false;
    private hasGroupBy: boolean = false;
    private hasHaving: boolean = false;
    private hasSort: boolean = false;

    where<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T> {
        if (this.hasGroupBy || this.hasHaving || this.hasSort) {
            throw new Error('where must come before groupBy, having, and sort');
        }
        const whereFn = createWhere<T>()(key, value);
        this.steps.push(whereFn);
        this.hasWhere = true;
        return this;
    }

    groupBy<K extends keyof T>(key: K): QueryBuilder<T> {
        if (this.hasHaving || this.hasSort) {
            throw new Error('groupBy must come before having and sort');
        }
        const groupByFn = createGroupBy<T>()(key);
        this.steps.push(groupByFn);
        this.hasGroupBy = true;
        return this;
    }

    having(predicate: (group: Group<T, any>) => boolean): QueryBuilder<T> {
        if (!this.hasGroupBy) {
            throw new Error('having must come after groupBy');
        }
        if (this.hasSort) {
            throw new Error('having must come before sort');
        }
        const havingFn = createHaving<T>()(predicate);
        this.steps.push(havingFn);
        this.hasHaving = true;
        return this;
    }

    sort(key: string): QueryBuilder<T> {
        if (this.hasGroupBy || this.hasHaving) {
            // Сортируем группы по ключу
            const sortFn = (data: any[]): any[] => {
                return [...data].sort((a, b) => {
                    if (a[key] < b[key]) return -1;
                    if (a[key] > b[key]) return 1;
                    return 0;
                });
            };
            this.steps.push(sortFn);
            this.hasSort = true;
            return this;
        }
        // Сортируем обычные объекты
        const sortFn = createSort<T>()(key as keyof T);
        this.steps.push(sortFn);
        this.hasSort = true;
        return this;
    }

    build(): (data: T[]) => any {
        return (data: T[]): any => {
            let result: any = data;
            for (const step of this.steps) {
                result = step(result);
            }
            return result;
        };
    }

    execute(data: T[]): any {
        return this.build()(data);
    }
}

export function query<T>(): QueryBuilder<T> {
    return new QueryBuilder<T>();
}
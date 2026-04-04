import { describe, test, expect, expectTypeOf } from 'vitest';
import { DeepReadonly, PickedByType, EventHandlers } from './utilityTypes.js';

describe('Utility Types', () => {
    
    describe('DeepReadonly<T>', () => {
        type NestedObject = {
            a: number;
            b: string;
            c: {
                d: boolean;
                e: {
                    f: number[];
                };
            };
        };

        type ReadonlyNested = DeepReadonly<NestedObject>;

        test('should make all properties readonly recursively', () => {
            const obj: ReadonlyNested = {
                a: 1,
                b: 'test',
                c: {
                    d: true,
                    e: {
                        f: [1, 2, 3]
                    }
                }
            };

            expect(obj.a).toBe(1);
            expect(obj.b).toBe('test');
            expect(obj.c.d).toBe(true);
            expect(obj.c.e.f).toEqual([1, 2, 3]);
        });

        test('should preserve array types', () => {
            type WithArray = {
                arr: { id: number }[];
            };
            
            type ReadonlyArray = DeepReadonly<WithArray>;
            
            const obj: ReadonlyArray = {
                arr: [{ id: 1 }, { id: 2 }]
            };
            
            expect(obj.arr).toHaveLength(2);
            expect(obj.arr[0].id).toBe(1);
            expect(obj.arr[1].id).toBe(2);
        });

        test('should work with primitive types', () => {
            type Primitive = DeepReadonly<string>;
            type PrimitiveNumber = DeepReadonly<number>;
            type PrimitiveBoolean = DeepReadonly<boolean>;
            
            const str: Primitive = 'hello';
            const num: PrimitiveNumber = 42;
            const bool: PrimitiveBoolean = true;
            
            expect(str).toBe('hello');
            expect(num).toBe(42);
            expect(bool).toBe(true);
        });
    });

    describe('PickedByType<T, U>', () => {
        type MixedObject = {
            id: number;
            name: string;
            age: number;
            email: string;
            active: boolean;
            tags: string[];
            count: number;
        };

        type StringProperties = PickedByType<MixedObject, string>;
        type NumberProperties = PickedByType<MixedObject, number>;
        type BooleanProperties = PickedByType<MixedObject, boolean>;
        type ArrayProperties = PickedByType<MixedObject, string[]>;

        test('should pick only string properties', () => {
            const obj: StringProperties = {
                name: 'John',
                email: 'john@example.com'
            };
            
            expectTypeOf(obj).toHaveProperty('name');
            expectTypeOf(obj).toHaveProperty('email');
            expectTypeOf(obj).not.toHaveProperty('id');
            expectTypeOf(obj).not.toHaveProperty('age');
            expectTypeOf(obj).not.toHaveProperty('active');
            expectTypeOf(obj).not.toHaveProperty('tags');
            
            expect(obj.name).toBe('John');
            expect(obj.email).toBe('john@example.com');
        });

        test('should pick only number properties', () => {
            const obj: NumberProperties = {
                id: 1,
                age: 30,
                count: 5
            };
            
            expectTypeOf(obj).toHaveProperty('id');
            expectTypeOf(obj).toHaveProperty('age');
            expectTypeOf(obj).toHaveProperty('count');
            expectTypeOf(obj).not.toHaveProperty('name');
            expectTypeOf(obj).not.toHaveProperty('email');
            expectTypeOf(obj).not.toHaveProperty('active');
            
            expect(obj.id).toBe(1);
            expect(obj.age).toBe(30);
            expect(obj.count).toBe(5);
        });

        test('should pick only boolean properties', () => {
            const obj: BooleanProperties = {
                active: true
            };
            
            expectTypeOf(obj).toHaveProperty('active');
            expectTypeOf(obj).not.toHaveProperty('id');
            expectTypeOf(obj).not.toHaveProperty('name');
            
            expect(obj.active).toBe(true);
        });

        test('should pick only array properties', () => {
            const obj: ArrayProperties = {
                tags: ['a', 'b', 'c']
            };
            
            expectTypeOf(obj).toHaveProperty('tags');
            expectTypeOf(obj).not.toHaveProperty('id');
            expectTypeOf(obj).not.toHaveProperty('name');
            
            expect(obj.tags).toEqual(['a', 'b', 'c']);
        });

        test('should work with empty object when no matching properties', () => {
            type NoString = PickedByType<{ id: number; age: number }, string>;
            
            const obj: NoString = {};
            expect(obj).toEqual({});
        });
    });

    describe('EventHandlers<T>', () => {
        type Events = {
            click: { x: number; y: number };
            change: { value: string };
            submit: { formData: FormData };
            keyPress: { key: string; ctrlKey: boolean };
        };

        type Handlers = EventHandlers<Events>;

        test('should generate correct handler names', () => {
            const handlers: Handlers = {
                onClick: (event: { x: number; y: number }) => {},
                onChange: (event: { value: string }) => {},
                onSubmit: (event: { formData: FormData }) => {},
                onKeyPress: (event: { key: string; ctrlKey: boolean }) => {}
            };
            
            expectTypeOf(handlers).toHaveProperty('onClick');
            expectTypeOf(handlers).toHaveProperty('onChange');
            expectTypeOf(handlers).toHaveProperty('onSubmit');
            expectTypeOf(handlers).toHaveProperty('onKeyPress');
            
            expect(typeof handlers.onClick).toBe('function');
            expect(typeof handlers.onChange).toBe('function');
            expect(typeof handlers.onSubmit).toBe('function');
            expect(typeof handlers.onKeyPress).toBe('function');
        });

        test('should accept handlers with correct event types', () => {
            const clickHandler = (event: { x: number; y: number }) => {
                expect(event.x).toBe(10);
                expect(event.y).toBe(20);
            };
            
            const changeHandler = (event: { value: string }) => {
                expect(event.value).toBe('test');
            };
            
            const handlers: Handlers = {
                onClick: clickHandler,
                onChange: changeHandler,
                onSubmit: (event) => {},
                onKeyPress: (event) => {}
            };
            
            handlers.onClick({ x: 10, y: 20 });
            handlers.onChange({ value: 'test' });
        });

        test('should work with single event', () => {
            type SingleEvent = {
                load: { url: string };
            };
            
            type SingleHandlers = EventHandlers<SingleEvent>;
            
            const handlers: SingleHandlers = {
                onLoad: (event: { url: string }) => {
                    expect(event.url).toBe('https://example.com');
                }
            };
            
            expectTypeOf(handlers).toHaveProperty('onLoad');
            expectTypeOf(handlers).not.toHaveProperty('onClick');
            
            handlers.onLoad({ url: 'https://example.com' });
        });

        test('should work with empty events', () => {
            type NoEvents = {};
            type NoHandlers = EventHandlers<NoEvents>;
            
            const handlers: NoHandlers = {};
            expect(handlers).toEqual({});
        });

        test('should handle events with primitive types', () => {
            type PrimitiveEvents = {
                count: number;
                message: string;
                flag: boolean;
            };
            
            type PrimitiveHandlers = EventHandlers<PrimitiveEvents>;
            
            const handlers: PrimitiveHandlers = {
                onCount: (event: number) => {
                    expect(event).toBe(42);
                },
                onMessage: (event: string) => {
                    expect(event).toBe('hello');
                },
                onFlag: (event: boolean) => {
                    expect(event).toBe(true);
                }
            };
            
            handlers.onCount(42);
            handlers.onMessage('hello');
            handlers.onFlag(true);
        });
    });
});
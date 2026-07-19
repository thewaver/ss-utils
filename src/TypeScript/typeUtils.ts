export type Nullable<T> = T | null;

export type Prepend<T, S extends string, NoCap extends boolean = false> = {
    [K in Extract<keyof T, string> as `${S}${NoCap extends true ? K : Capitalize<K>}`]: T[K];
};

export type Append<T, S extends string, NoCap extends boolean = false> = {
    [K in Extract<keyof T, string> as `${K}${NoCap extends true ? S : Capitalize<S>}`]: T[K];
};

export type Redefine<T1, T2 extends { [K in keyof T1]?: any }> = {
    [K in keyof T1]: K extends keyof T2 ? T2[K] : T1[K];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type KeysOfType<T extends object, KT> = {
    [K in keyof T]: T[K] extends KT ? K : never;
}[keyof T];

export type PickContaining<T extends object, S extends string> = {
    [K in keyof T as K extends `${infer A}${S}${infer B}` ? K : never]: T[K];
};

export type ArrayElementType<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;

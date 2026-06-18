type CamelCase<S extends string> = S extends `${infer P}_${infer Q}` ? `${P}${Capitalize<CamelCase<Q>>}` : S;

export type CamelizeKeys<T> = T extends readonly (infer U)[]
  ? CamelizeKeys<U>[]
  : T extends object
    ? { [K in keyof T as K extends string ? CamelCase<K> : K]: CamelizeKeys<T[K]> }
    : T;

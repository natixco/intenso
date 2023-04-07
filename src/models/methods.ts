export const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

export type Method = typeof methods[number];

import { blueBright, greenBright, magentaBright, redBright } from 'colorette';

export const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

export type Method = typeof methods[number];

export const methodColors: Record<Method, (text: string | number) => string> = {
  get: blueBright,
  post: greenBright,
  put: greenBright,
  patch: greenBright,
  delete: redBright,
  head: magentaBright,
  options: magentaBright,
}

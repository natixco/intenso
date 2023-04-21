import { ParsedUrl, RouteMetadata } from '../models';
import { IncomingMessage } from 'http';
import { redBright, yellowBright } from 'colorette';
import { methodColors } from '../models/methods';

export * from './file-helpers';

export function parseUrl(url: string = ''): ParsedUrl {
  const splitUrl = url.split('?');

  let pathname = splitUrl[0] ?? '';
  const query = splitUrl[1] ?? '';

  pathname = pathname.length > 1 && pathname.charAt(pathname.length - 1) === '/' ? pathname.slice(0, -1) : pathname;

  const queryParams: Record<string, any> = {};
  for (const param of query.split('&')) {
    const [key, value] = param.split('=');
    if (!key || !value) {
      continue;
    }
    queryParams[key] = decodeURIComponent(value);
  }

  return {
    pathname,
    queryParams,
  };
}

export async function parseBody(incomingMessage: IncomingMessage): Promise<string> {
  const buffers = [];
  for await (const chunk of incomingMessage) {
    buffers.push(chunk);
  }

  let body = Buffer.concat(buffers).toString();
  try {
    body = JSON.parse(body);
  } catch (_) {
  }

  return body;
}

export function log(text: string): void {
  console.log(yellowBright('[intenso] ') + text);
}

export function logRoutes(routes: RouteMetadata[]): void {
  for (const route of routes) {
    const method = route.method;

    let text = '';
    if (!route.routeHandler) {
      text += redBright('Missing handler') + ' - ';
    }
    text += methodColors[method](method.toUpperCase()) + ' ';
    text += route.pathname;

    log(text);
  }
}

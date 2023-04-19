import { ParsedUrl } from '../models';
import { IncomingMessage } from 'http';

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

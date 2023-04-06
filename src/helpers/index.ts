import { ParsedUrl } from '../models';
import { IncomingMessage } from 'http';

export function parseUrl(url: string = ''): ParsedUrl {
  url = url.length > 1 && url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  const splitUrl = url.split('?');

  const pathname = splitUrl[0] ?? '';
  const query = splitUrl[1] ?? '';

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

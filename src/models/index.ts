export * from './status-codes';

import { IncomingMessage } from 'http';

export interface IntensoOptions {
  port: number;
}

export interface Response {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export type RouteHandler = (req: IncomingMessage) => Promise<Response>;

export type Route = () => {
  handler: RouteHandler;
}

export interface RouteMetadata {
  pathname: string;
  method: string;
  handler: {
    default?: () => {
      handler: RouteHandler;
    };
  };
}

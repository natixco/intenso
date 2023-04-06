export * from './status-codes';

import { IncomingMessage } from 'http';

export interface IntensoOptions {
  port: number;
}

export interface ParsedUrl {
  pathname: string;
  queryParams: Record<string, any>;
}

export interface Request {
  incomingMessage: IncomingMessage;
  queryParams: Record<string, any>;
  body: any;
}

export interface Response {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export type RouteHandler = (request: Request) => Promise<Response>;

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

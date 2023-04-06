export * from './status-codes';

import { IncomingMessage } from 'http';

export interface IntensoOptions {
  port: number;
}

export interface ParsedUrl {
  pathname: string;
  queryParams: Record<string, any>;
}

export interface Request<TQuery, TBody> {
  incomingMessage: IncomingMessage;
  query: TQuery;
  body: TBody;
}

export interface Response {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export type RouteHandler<TQuery, TBody> = (request: Request<TQuery, TBody>) => Promise<Response>;

export type Route<TQuery = Record<string, any>, TBody = unknown> = () => {
  queryParser?: (params: Record<string, any>) => TQuery;
  bodyParser?: (body: any) => TBody;
  handler: RouteHandler<TQuery, TBody>;
}

export interface RouteMetadata {
  pathname: string;
  method: string;
  handler: {
    default?: () => ReturnType<Route>;
  };
}

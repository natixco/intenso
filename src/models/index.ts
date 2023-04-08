import { Method } from './methods';

export * from './status-codes';
export { Method } from './methods';

import { IncomingMessage } from 'http';
import { Status } from './status-codes';

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
  destination?: never;
  permanent?: never;
}

export interface RedirectWithPermanent {
  destination: string;
  permanent: boolean;
  status?: never;
}

export interface RedirectWithStatus {
  destination: string;
  permanent?: never;
  status: Status;
}

export type Redirect = RedirectWithPermanent | RedirectWithStatus;

export type RouteHandlerResult = Response | Redirect;

export type RouteHandler<TQuery, TBody> = (request: Request<TQuery, TBody>) => RouteHandlerResult | Promise<RouteHandlerResult>;

export type QueryParser<T> = (params: Record<string, any>) => T;

export type BodyParser<T> = (body: any) => T;

export type Route<TQuery = Record<string, any>, TBody = unknown> = () => {
  queryParser?: QueryParser<TQuery>;
  bodyParser?: BodyParser<TBody>;
  handler: RouteHandler<TQuery, TBody>;
}

export interface RouteMetadata {
  pathname: string;
  method: Method;
  queryParser?: QueryParser<any>;
  bodyParser?: BodyParser<any>;
  handler?: RouteHandler<any, any>;
}

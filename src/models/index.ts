import { Method } from './methods';
import { IncomingMessage, ServerResponse } from 'http';
import { Status } from './status-codes';
import { z, ZodTypeAny } from 'zod';

export * from './status-codes';
export { Method } from './methods';

export interface IntensoOptions {
  port: number;
}

export interface ParsedUrl {
  pathname: string;
  queryParams: Record<string, string>;
}

export interface Request<TQuery extends ZodTypeAny, TBody extends ZodTypeAny, TParams extends ZodTypeAny> {
  incomingMessage: IncomingMessage;
  query: z.infer<TQuery>;
  body: z.infer<TBody>;
  params: z.infer<TParams>;
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

export type RouteHandler = (request: IncomingMessage, res: ServerResponse & { req: IncomingMessage }, queryParams: Record<string, string>, urlParams: Record<string, string>) => void | Promise<void>;

export type Parser<T extends ZodTypeAny> = (validator: typeof z) => T;

export interface RouteMetadata {
  pathname: string;
  method: Method;
  queryParser?: Parser<ZodTypeAny>;
  bodyParser?: Parser<ZodTypeAny>;
  routeHandler?: RouteHandler;
}

export interface RouteHandlerOptions<TQuery extends ZodTypeAny, TBody extends ZodTypeAny, TParams extends ZodTypeAny> {
  handler: (request: Request<TQuery, TBody, TParams>) => RouteHandlerResult | Promise<RouteHandlerResult>;
  queryParser?: Parser<TQuery>;
  bodyParser?: Parser<TBody>;
  paramsParser?: Parser<TParams>;
}

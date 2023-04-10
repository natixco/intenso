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
  queryParams: Record<string, any>;
}

export interface Request<TQUery extends ZodTypeAny, TBody extends ZodTypeAny> {
  incomingMessage: IncomingMessage;
  query: z.infer<TQUery>;
  body: z.infer<TBody>;
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

export type RouteHandler = (request: IncomingMessage, res: ServerResponse & { req: IncomingMessage }, queryParams: any) => void | Promise<void>;

export type QueryParser<T extends ZodTypeAny> = (validator: typeof z) => z.infer<T>;

export type BodyParser<T extends ZodTypeAny> = (validator: typeof z) => z.infer<T>;

export interface RouteMetadata {
  pathname: string;
  method: Method;
  queryParser?: QueryParser<any>;
  bodyParser?: BodyParser<any>;
  routeHandler?: RouteHandler;
}

export interface RouteHandlerOptions<TQuery extends ZodTypeAny, TBody extends ZodTypeAny> {
  handler: (request: Request<TQuery, TBody>) => RouteHandlerResult | Promise<RouteHandlerResult>;
  queryParser?: (validator: typeof z) => TQuery;
  bodyParser?: (validator: typeof z) => TBody;
}

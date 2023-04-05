import { IncomingMessage } from 'http';

export interface YetOptions {
  port: number;
}

export interface Response {
  status: number;
  body: any;
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
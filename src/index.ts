import { findRoutes, getCurrentPath, parseBody, parseUrl } from './helpers';
import { createServer as httpCreateServer, IncomingMessage, ServerResponse } from 'http';
import { existsSync } from 'fs';
import { join } from 'path';
import { yellowBright } from 'colorette'
import { log } from './logger';
import { IntensoOptions, RouteHandler, RouteHandlerOptions, RouteMetadata, Status } from './models';
import { z, ZodObject, ZodTypeAny } from 'zod';
import { config as dotenvConfig } from 'dotenv';

export * from './models';

interface RouteMetadataWithUrlParams {
  metadata: RouteMetadata<ZodTypeAny> | undefined;
  urlParams: Record<string, string>;
}

export function createServer<TEnv extends ZodObject<any>>(
  options: IntensoOptions<TEnv> = {
    port: 3000,
  }
) {

  let routes: RouteMetadata[] = [];

  dotenvConfig({ path: options?.env?.path });
  const envValidator = options?.env?.parser ? options.env.parser(z) : undefined;
  const env = envValidator ? envValidator.parse(process.env) : process.env;

  const server = httpCreateServer(listener);
  server.on('close', () => {
    log('Closing...');
  });
  server.listen(options.port, () => {
    log(`Listening on :${yellowBright(options.port)}`);
  });

  function close(): void {
    server?.close();
  }

  async function listener(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { pathname, queryParams } = parseUrl(req.url);
    const { metadata, urlParams } = getRouteMetadata(pathname, req.method ?? '');
    if (!metadata) {
      res.writeHead(Status.NOT_FOUND);
      res.write('The requested resource does not exist');
      res.end();
      return;
    }

    const { routeHandler } = metadata;
    if (!routeHandler) {
      res.writeHead(Status.INTERNAL_SERVER_ERROR);
      res.write('Unexpected error');
      res.end();
      return;
    }

    routeHandler(req, res, queryParams, urlParams);
  }

  function getRouteMetadata(pathname: string, reqMethod: string): RouteMetadataWithUrlParams {
    const urlParams: Record<string, string> = {};
    let metadata: RouteMetadata | undefined = undefined;

    for (const route of routes) {
      if (route.pathname === pathname && route.method.toLowerCase() === reqMethod.toLowerCase()) {
        metadata = route;
        break;
      }

      const metadataPathnameSplit = route.pathname.split('/');
      const reqPathnameSplit = pathname.split('/');
      if (metadataPathnameSplit.length !== reqPathnameSplit.length) {
        continue;
      }

      let pathnameMatches = true;
      metadataPathnameSplit.forEach((item, i) => {
        if (item.charAt(0) === '[' && item.charAt(item.length - 1) === ']') {
          const paramKey = item.slice(0, item.length - 1).slice(1, item.length);
          urlParams[paramKey] = reqPathnameSplit[i]!;
          return;
        }

        if (item !== reqPathnameSplit[i]) {
          pathnameMatches = false;
          return;
        }
      });

      if (pathnameMatches && Object.values(urlParams).length > 0) {
        metadata = route;
        break;
      }
    }

    return {
      metadata,
      urlParams,
    };
  }

  async function setup(): Promise<void> {
    let path = getCurrentPath();
    if (!path) {
      throw new Error('Can not register routes due to missing path');
    }

    const filenameSplit = path.split('\\');
    filenameSplit.pop();
    path = filenameSplit.join('\\');

    const routesPath = join(path, 'routes');
    if (!existsSync(routesPath)) {
      throw new Error('`routes` directory does not exist');
    }

    log('Registering routes:');

    routes = await findRoutes(routesPath);
    routes = routes.sort((a) => a.pathname.charAt(a.pathname.length - 1) === ']' ? 1 : -1);
  }

  function createRoute<TQuery extends ZodTypeAny, TBody extends ZodTypeAny, TParams extends ZodTypeAny>(routeHandlerOptions: RouteHandlerOptions<TQuery, TBody, TParams, TEnv>): RouteHandler<TEnv> {
    return async (req, res, queryParams, urlParams) => {
      try {
        const { handler, bodyParser, paramsParser, queryParser } = routeHandlerOptions;
        const parsedStringBody = await parseBody(req);

        const response = await handler({
          incomingMessage: req,
          query: queryParser ? queryParser(z).parse(queryParams) : queryParams,
          body: bodyParser ? bodyParser(z).parse(parsedStringBody) : parsedStringBody,
          params: paramsParser ? paramsParser(z).parse(urlParams) : urlParams,
          env,
        });

        if ('destination' in response) {
          let status: Status;
          if (response.status) {
            status = response.status;
          } else {
            status = response.permanent ? Status.MOVED_PERMANENTLY : Status.MOVED_TEMPORARILY;
          }

          res.writeHead(status, { Location: response.destination });
          res.write('');
          res.end();
          return;
        }

        const headers: Record<string, string> = response.headers ?? {};
        let body = response.body;

        if (typeof response.body === 'object') {
          body = JSON.stringify(response.body);
          headers['Content-Type'] = 'application/json';
        }

        res.writeHead(response.status, headers);
        res.write(body);
        res.end();
      } catch (error: any) {
        res.writeHead(Status.INTERNAL_SERVER_ERROR);
        res.write(error instanceof Error ? error.message : error);
        res.end();
      }
    };
  }

  return {
    setup,
    close,
    createRoute,
    // @ts-ignore
    env: env as z.infer<NonNullable<typeof envValidator>>,
  }
}

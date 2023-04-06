export * from './models';

import { parseBody, parseUrl } from './helpers';
import { createServer as httpCreateServer, RequestListener, Server } from 'http';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { blueBright, redBright, yellowBright } from 'colorette'
import { log } from './logger';
import { IntensoOptions, RouteMetadata, Status } from './models';

const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

class Intenso {

  private server?: Server;
  private options?: IntensoOptions;
  private routes: RouteMetadata[] = [];

  constructor(options: IntensoOptions) {
    this.setupRoutes().then(() => {
      this.options = options;
      this.server = httpCreateServer(this.listener);

      this.server.listen(options.port, () => {
        log(`Listening on :${yellowBright(options.port)}`);
      });
    });
  }

  private listener: RequestListener = async (req, res) => {
    const { pathname, queryParams } = parseUrl(req.url);

    const routeMetadata = this.routes.find(x => x.pathname === pathname && x.method.toLowerCase() === req.method?.toLowerCase());
    if (!routeMetadata) {
      res.writeHead(Status.INTERNAL_SERVER_ERROR);
      res.write('The requested resource does not exist');
      res.end();
      return;
    }

    const handlerDefault = routeMetadata.handler.default;
    if (!handlerDefault) {
      res.writeHead(Status.INTERNAL_SERVER_ERROR);
      res.write('Unexpected error');
      res.end();
      return;
    }

    try {
      const _default = handlerDefault();
      const parsedStringBody = await parseBody(req);
      const response = await _default.handler({
        incomingMessage: req,
        query: _default.queryParser ? _default.queryParser(queryParams) : queryParams,
        body: _default.bodyParser ? _default.bodyParser(parsedStringBody) : parsedStringBody,
      });

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
      res.writeHead(500);
      res.write(error instanceof Error ? error.message : error);
      res.end();
    }
  };

  private async setupRoutes(): Promise<void> {
    const filename = require.main?.filename;
    if (!filename) {
      throw new Error('Can not register routes due to missing filename');
    }

    const filenameSplit = filename.split('\\');
    filenameSplit.pop();

    const path = filenameSplit.join('\\');
    const routesPath = join(path, 'routes');

    if (!existsSync(routesPath)) {
      throw new Error('`routes` directory does not exist');
    }

    log('Registering routes:');
    await this.findRoutes(routesPath);

    const max = Math.max(...this.routes.map(x => x.method.length));
    for (const route of this.routes) {
      let method = route.method;
      // for (let i = 0; i < max - method.length; i++) {
      //   method += ' ';
      // }
      log(`${route.handler.default ? '' : `${redBright('Missing handler')} - `}${blueBright(method.toUpperCase())} ${route.pathname}`);
    }
  }

  private async registerRoute(path: string): Promise<void> {
    const split = path.split('\\');
    let splitPathname = [];

    let current = path;
    let method = '';
    while (current !== 'routes') {
      let pop = split.pop();
      if (!pop) {
        break;
      }

      if (pop.includes('.ts') || pop.includes('.js')) {
        method = pop.split('.')[0] as string;
      } else {
        splitPathname.push(pop);
      }

      current = pop;
    }

    splitPathname.pop();
    splitPathname = splitPathname.reverse();
    const pathname = `/${splitPathname.join('/')}`;

    let handler;
    if (typeof require !== 'undefined' && typeof __dirname !== 'undefined') {
      handler = require(path);
    } else {
      handler = (await import('file://' + path)).default;
    }

    this.routes.push({
      pathname,
      method,
      handler,
    });
  }

  private async findRoutes(path: string): Promise<void> {
    const files = readdirSync(path);
    for (const file of files) {
      const p = join(path, file);
      const stat = statSync(p);
      if (stat.isDirectory()) {
        await this.findRoutes(p);
      } else {
        const split = file.split('.');
        if (split[0] && !methods.includes(split[0])) {
          throw new Error(`Can not register routes due to invalid HTTP method name \`${split[0]}\`. Path: ${p}`);
        }
        await this.registerRoute(p);
      }
    }
  }

}

export function createServer(options: IntensoOptions): Intenso {
  return new Intenso(options);
}

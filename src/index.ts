import { parseBody, parseUrl } from './helpers';

export * from './models';

import { FileService } from './services/file-service';
import { createServer as httpCreateServer, RequestListener, Server } from 'http';
import { existsSync } from 'fs';
import { join } from 'path';
import { blueBright, redBright, yellowBright } from 'colorette'
import { log } from './logger';
import { IntensoOptions, RouteMetadata, Status } from './models';

export class Intenso {

  private readonly fileService = new FileService();

  private server?: Server;
  private options: IntensoOptions;
  private routes: RouteMetadata[] = [];

  constructor(options?: IntensoOptions) {
    this.options = options ?? {
      port: Number(process.env.PORT) || 3000,
    };
  }

  get port(): number {
    return this.options.port;
  }

  init(): Promise<Intenso> {
    if (this.server) {
      return Promise.resolve(this);
    }

    return new Promise(async (resolve, reject) => {
      try {
        await this.setupRoutes();
      } catch (error) {
        reject(error);
      }

      this.server = httpCreateServer(this.listener);

      this.server.on('close', function () {
        log('Closing...');
      });

      this.server.listen(this.options.port, () => {
        log(`Listening on :${yellowBright(this.options.port)}`);
      });

      resolve(this);
    });
  }

  close() {
    this.server?.close();
  }

  private listener: RequestListener = async (req, res) => {
    const { pathname, queryParams } = parseUrl(req.url);

    const routeMetadata = this.routes.find(x => x.pathname === pathname && x.method.toLowerCase() === req.method?.toLowerCase());
    if (!routeMetadata) {
      res.writeHead(Status.NOT_FOUND);
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
      res.writeHead(Status.INTERNAL_SERVER_ERROR);
      res.write(error instanceof Error ? error.message : error);
      res.end();
    }
  };

  private async setupRoutes(): Promise<void> {
    let path = this.fileService.getCurrentPath();
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

    this.routes = await this.fileService.findRoutes(routesPath);

    for (const route of this.routes) {
      let method = route.method;
      log(`${route.handler.default ? '' : `${redBright('Missing handler')} - `}${blueBright(method.toUpperCase())} ${route.pathname}`);
    }
  }

}

export function createServer(options?: IntensoOptions): Promise<Intenso> {
  return new Intenso(options).init();
}

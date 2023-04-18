import { parseUrl } from './helpers';
import { FileService } from './services/file-service';
import { createServer as httpCreateServer, RequestListener, Server } from 'http';
import { existsSync } from 'fs';
import { join } from 'path';
import { blueBright, redBright, yellowBright } from 'colorette'
import { log } from './logger';
import { IntensoOptions, RouteMetadata, Status } from './models';

export * from './models';
export * from './create-route';

interface RouteMetadataWithUrlParams {
  metadata: RouteMetadata | undefined;
  urlParams: Record<string, string>;
}

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
    const { metadata, urlParams } = this.getRouteMetadata(pathname, req.method ?? '');
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
  };

  private getRouteMetadata(pathname: string, reqMethod: string): RouteMetadataWithUrlParams {
    const urlParams: Record<string, string> = {};
    let metadata: RouteMetadata | undefined = undefined;

    for (const route of this.routes) {
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

    const routes = await this.fileService.findRoutes(routesPath);

    for (const route of routes) {
      let method = route.method;
      log(`${route.routeHandler ? '' : `${redBright('Missing handler')} - `}${blueBright(method.toUpperCase())} ${route.pathname}`);
    }
    this.routes = routes.sort((a) => a.pathname.charAt(a.pathname.length - 1) === ']' ? 1 : -1);
  }

}

export function createServer(options?: IntensoOptions): Promise<Intenso> {
  return new Intenso(options).init();
}


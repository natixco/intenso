import { Method, Route, RouteMetadata } from '../models';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { methods } from '../models/methods';

export class FileService {

  getCurrentPath(): string | undefined {
    return require.main?.filename;
  }

  async findRoutes(path: string, routes: RouteMetadata[] = []): Promise<RouteMetadata[]> {
    const files = readdirSync(path);

    for (const file of files) {
      const fullPathToRoute = join(path, file);
      const stat = statSync(fullPathToRoute);
      if (stat.isDirectory()) {
        await this.findRoutes(fullPathToRoute, routes);
      } else {
        routes.push(await this.registerRoute(fullPathToRoute));
      }
    }

    return routes;
  }

  private async registerRoute(path: string): Promise<RouteMetadata> {
    const split = path.split('\\');
    let splitPathname = [];

    let current = path;
    let method: Method | undefined;
    while (current !== 'routes') {
      let pop = split.pop();
      if (!pop) {
        break;
      }

      if (pop.includes('.ts') || pop.includes('.js')) {
        method = pop.split('.')[0] as Method;
      } else {
        splitPathname.push(pop);
      }

      current = pop;
    }

    if (!method || !methods.includes(method)) {
      throw new Error(`Can not register routes due to invalid HTTP method name \`${method}\`. Path: ${path}`);
    }

    splitPathname.pop();
    splitPathname = splitPathname.reverse();
    const pathname = `/${splitPathname.join('/')}`;

    let handler = await this.loadHandler(path);
    const _default = (handler.default ? handler.default() : undefined) as ReturnType<Route> | undefined;

    return {
      pathname,
      method,
      handler: _default?.handler,
      queryParser: _default?.queryParser,
      bodyParser: _default?.bodyParser,
    };
  }

  private async loadHandler(path: string) {
    let handler;
    if (typeof require !== 'undefined' && typeof __dirname !== 'undefined') {
      handler = require(path);
    } else {
      handler = (await import('file://' + path)).default;
    }
    return handler;
  }

}

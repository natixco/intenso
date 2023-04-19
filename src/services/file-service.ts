import { Method, RouteMetadata } from '../models';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { methods } from '../models/methods';
import { log } from '../logger';
import { blueBright, redBright } from 'colorette';

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
        const route = await this.registerRoute(fullPathToRoute);
        let method = route.method;
        log(`${route.routeHandler ? '' : `${redBright('Missing handler')} - `}${blueBright(method.toUpperCase())} ${route.pathname}`);
        routes.push(route);
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

    const routeHandler = await this.loadHandler(path);

    return {
      pathname,
      method,
      routeHandler: routeHandler.default,
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

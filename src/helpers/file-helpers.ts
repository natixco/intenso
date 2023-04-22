import { Method, RouteMetadata } from '../models';
import { readdirSync, statSync } from 'fs';
import { join, sep } from 'path';
import { methods } from '../models/methods';

export function getCurrentPath(): string | undefined {
  let filename = require.main?.filename;
  if (!filename) {
    return undefined;
  }

  const filenameSplit = filename.split(sep);
  filenameSplit.pop();

  return filenameSplit.join(sep);
}

export async function findRoutes(path: string): Promise<RouteMetadata[]> {
  let routes = await internalFindRoutes(path);

  routes = routes.sort((a,b) => {
    return b.pathname.includes('[') && b.pathname.includes(']') ? -1 : 1;
  });

  return routes;
}

async function internalFindRoutes(path: string, routes: RouteMetadata[] = []): Promise<RouteMetadata[]> {
  let files = readdirSync(path);

  for (const file of files) {
    const fullPathToRoute = join(path, file);
    const stat = statSync(fullPathToRoute);
    if (stat.isDirectory()) {
      await internalFindRoutes(fullPathToRoute, routes);
    } else {
      const route = await registerRoute(fullPathToRoute);
      routes.push(route);
    }
  }

  return routes;
}

async function registerRoute(path: string): Promise<RouteMetadata> {
  const split = path.split(sep);
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

  const routeHandler = await loadHandler(path);

  return {
    pathname,
    method,
    routeHandler: routeHandler.default,
  };
}

async function loadHandler(path: string) {
  let handler;
  if (typeof require !== 'undefined' && typeof __dirname !== 'undefined') {
    handler = require(path);
  } else {
    handler = (await import('file://' + path)).default;
  }
  return handler;
}

import { findRoutes } from '../src/helpers';
import { RouteMetadata } from '../src';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs', async () => {
  const mock = require('mock-require')
  const files = [
    { name: '[id]/get.ts', isDirectory: false },
    { name: 'directory/get.ts', isDirectory: false },
    { name: 'directory/[name]/get.ts', isDirectory: false },
    { name: 'get.ts', isDirectory: false },
    { name: 'post.ts', isDirectory: false },
  ];
  mock('\\routes\\[id]\\get.ts', { default: undefined });
  mock('\\routes\\directory\\get.ts', { default: undefined });
  mock('\\routes\\directory\\[name]\\get.ts', { default: undefined });
  mock('\\routes\\get.ts', { default: undefined });
  mock('\\routes\\post.ts', { default: undefined });

  return {
    ...(await vi.importActual<typeof import('fs')>('fs')),
    readdirSync: vi.fn().mockImplementation((path: string) => {
      return files.map(x => x.name);
    }),
    statSync: vi.fn().mockImplementation((path: string) => {
      return {
        isDirectory: () => {
          const file = files.find(x => x.name === path.slice(8, path.length));
          return file?.isDirectory;
        }
      }
    })
  }
});


describe('findRoutes(path)', async () => {
  let routes: RouteMetadata[];

  beforeEach(async () => {
    routes = await findRoutes('\\routes\\');
  });

  it('should return the correctly sorted routes', () => {
    expect(routes.map(x => x.pathname)).toEqual(['/directory', '/', '/', '/directory/[name]', '/[id]']);
  });

});

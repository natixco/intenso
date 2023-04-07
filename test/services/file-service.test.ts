import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileService } from '../../src/services/file-service';
import { RouteMetadata } from '../../src';
import { setupTest } from '../../test-helpers';

describe.todo('FileService', () => {
  let service: FileService;

  beforeAll(() => {
    setupTest({
      toMock: {
        fileServiceFindRoutes: false
      }
    });
    service = new FileService();
  });

  describe('findRoutes()', () => {
    let routes: RouteMetadata[];
    beforeEach(async () => {
      routes = await service.findRoutes('routes');
    });

    it('should return with the correct routes', function () {
      expect(routes).toEqual([
        {
          pathname: '/',
          method: 'get',
          handler: null
        },
      ]);
    });
  });

});

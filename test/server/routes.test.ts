import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, Intenso, Status } from '../../src';
import { setupTest, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';

describe('routes', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest({
      routes: [
        {
          pathname: '/',
          method: 'get',
          handler: async () => {
            return {
              status: 200,
              body: 'ok from GET /'
            };
          }
        },
        {
          pathname: '/sub',
          method: 'get',
          handler: async () => {
            return {
              status: 200,
              body: 'ok from GET /sub'
            };
          }
        },
        {
          pathname: '/sub',
          method: 'post',
          handler: async () => {
            return {
              status: 201,
              body: 'ok from POST /sub'
            };
          }
        },
        {
          pathname: '/should-redirect-with-permanent',
          method: 'get',
          handler: () => {
            return {
              destination: '/should-redirect-to',
              permanent: false,
            };
          }
        },
        {
          pathname: '/should-redirect-with-status',
          method: 'get',
          handler: () => {
            return {
              destination: '/should-redirect-to',
              status: Status.MOVED_TEMPORARILY
            };
          }
        },
        {
          pathname: '/should-redirect-to',
          method: 'get',
          handler: () => {
            return {
              status: 200,
              body: 'ok',
            };
          }
        }
      ]
    });

    server = await createServer({ port });
  });

  afterAll(() => {
    server.close();
  });

  describe('route: GET /', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from GET /');
    });
  });

  describe('route: GET /sub', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/sub', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from GET /sub');
    });
  });

  describe('route: POST /sub', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/sub', 'post');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(201);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from POST /sub');
    });
  });

  describe('route: GET /should-redirect-with-permanent', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/should-redirect-with-permanent', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok');
    });

    it('response should have the correct url', () => {
      expect(res.url).toEqual(`http://localhost:${port}/should-redirect-to`);
    });
  });

  describe('route: GET /should-redirect-with-status', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/should-redirect-with-status', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok');
    });

    it('response should have the correct url', () => {
      expect(res.url).toEqual(`http://localhost:${port}/should-redirect-to`);
    });
  });

});

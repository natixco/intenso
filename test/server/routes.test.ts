import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, Intenso } from '../../src';
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

});

import { afterAll, beforeAll, describe, expect, it, beforeEach, vi } from 'vitest'
import { createServer, Intenso } from '../src';
import { setupTest, testRequest } from '../test-helpers';
import { Response } from 'node-fetch';

describe('when the server is successfully created', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest();
    server = await createServer({ port });
  });

  afterAll(() => {
    server.close();
  });

  it('should create the server', () => {
    expect(server).toBeTruthy();
  });

  describe('when server.init() is called', () => {
    let _server: Intenso;
    beforeEach(async () => {
      _server = await server.init();
    });

    it('should return the same server instance', () => {
      expect(_server).toEqual(server);
    });
  });
});

describe('when createServer() is called without a port', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest();
    server = await createServer();
  });

  afterAll(() => {
    server.close();
  });

  it('should start with the default port 3000', async () => {
    expect(server.port).toEqual(3000);
  });
});

describe('index tests with the same server', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest({
      routes: [
        {
          pathname: '/route-without-handler',
          method: 'get',
          handler: undefined
        },
        {
          pathname: '/json-response',
          method: 'get',
          handler: async () => {
            return {
              status: 200,
              body: {
                x: 123,
              }
            };
          }
        },
        {
          pathname: '/error',
          method: 'get',
          handler: async () => {
            throw new Error('error :(')
            return {
              status: 200,
              body: ''
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

  describe('when the requested route does not exist', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/not-existing-route', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(404);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('The requested resource does not exist');
    });
  });

  describe('when the requested route doest not have a handler', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/route-without-handler', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(500);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('Unexpected error');
    });
  });

  describe('when the response is a json object', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/json-response', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.json()).toEqual({ x: 123 });
    });
  });

  describe('when the handler throws an error', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/error', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(500);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('error :(');
    });
  });

});



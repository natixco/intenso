import { Route } from '../../src';

const route: Route = () => ({
  async handler(req) {
    return {
      status: 201,
      body: {
        ok: 'OK'
      }
    };
  }
});

export default route;
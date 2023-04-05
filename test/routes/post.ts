import { Route } from '../../src';

const route: Route = () => ({
  async handler(req) {
    return {
      status: 200,
      body: {
        ok: 'asd'
      }
    };
  }
});

export default route;
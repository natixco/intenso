import { Route } from '../../../../src';

const route: Route = () => ({
  async handler(req) {
    return {
      status: 201,
      body: {
        ok: 'OK from sub/sub2/get'
      }
    };
  }
});

export default route;
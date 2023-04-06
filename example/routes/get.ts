import { Route } from '../../src';
import { Status } from '../../src';

const route: Route = () => ({
  async handler(req) {
    return {
      status: Status.OK,
      body: 'hey!'
    };
  }
});

export default route;

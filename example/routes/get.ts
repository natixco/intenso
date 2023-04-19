import { createRoute } from '../index';
import { Status } from '../../src';

export default createRoute({
  handler: ({ env }) => {
    return {
      status: Status.OK,
      body: `hey! SOME_SECRET equals to ${env.SOME_SECRET}`
    };
  }
});

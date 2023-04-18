import { createRoute, Status } from '../../../src';

export default createRoute({
  handler: () => {
    return {
      status: Status.OK,
      body: [
        'user 1',
        'user 2',
      ]
    };
  }
});


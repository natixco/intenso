import { createRoute } from '../../index';
import { Status } from '../../../src';

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


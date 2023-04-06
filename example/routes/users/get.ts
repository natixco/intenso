import { Route } from '../../../src';
import { Status } from '../../../src';

const route: Route = () => ({
  async handler() {
    return {
      status: Status.OK,
      body: [
        {
          id: 1,
          name: 'Gunnar Gunnarsson',
          email: 'gunnar@gunnarsson.com'
        },
        {
          id: 2,
          name: 'Gunnar Gunnarssonsson',
          email: 'gunnar@gunnarssonsson.com'
        },
      ]
    };
  }
});

export default route;

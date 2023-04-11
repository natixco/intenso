import { createRoute } from '../../../src';

export default createRoute({
  handler: () => {
    return {
      destination: '/',
      permanent: false,
    };
  }
});

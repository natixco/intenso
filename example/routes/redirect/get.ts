import { createRoute } from '../../index';

export default createRoute({
  handler: () => {
    return {
      destination: '/',
      permanent: false,
    };
  }
});

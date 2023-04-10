import { createRoute, Status } from '../../../src';

export default createRoute({
  queryParser: z => z.object({
    id: z.string()
  }),
  handler: ({ query }) => {
    return {
      status: Status.OK,
      body: `user id: ${query.id}`
    };
  }
});


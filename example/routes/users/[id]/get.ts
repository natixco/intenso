import { createRoute, Status } from '../../../../src';

export default createRoute({
  paramsParser: z => z.object({
    id: z.coerce.number(),
  }),
  handler: ({ params }) => {
    return {
      status: Status.OK,
      body: `user id from url params: ${params.id}`
    };
  }
});


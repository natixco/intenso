import { createRoute, Status } from '../../../src';

export default createRoute({
  bodyParser: z => z.object({
    name: z.string(),
  }),
  handler: ({ body }) => {
    return {
      status: Status.CREATED,
      body: `user created with name: ${body.name}`
    };
  }
});


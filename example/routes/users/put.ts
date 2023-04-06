import { Route, Status } from '../../../src';
import { z } from 'zod';

const bodySchema = z.object({
  id: z.number(),
});

type BodySchema = z.infer<typeof bodySchema>;

const route: Route<{}, BodySchema> = () => ({
  bodyParser(body) {
    return bodySchema.parse(body);
  },
  async handler({ body }) {
    return {
      status: Status.OK,
      body: `id from body: ${body.id}`,
    };
  }
});

export default route;

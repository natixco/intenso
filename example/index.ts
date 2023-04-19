import { createServer } from '../src';
import { join } from 'path';

const { setup, createRoute } = createServer({
  port: 8080,
  env: {
    path: join(__dirname, '.env'),
    parser: z => z.object({
      SOME_SECRET: z.coerce.number(),
    })
  }
});

setup();

export { createRoute };

import { Route, Status } from '../../../src';

interface QuerySchema {
  id: number;
}

const route: Route<QuerySchema> = () => ({
  queryParser(query) {
    return {
      id: query.id ? Number(query.id) : -1
    };
  },
  async handler({ query }) {
    return {
      status: Status.OK,
      body: `id from query params: ${query.id}`,
    };
  }
});

export default route;

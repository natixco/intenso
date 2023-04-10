import { z, ZodTypeAny } from 'zod';
import { RouteHandler, RouteHandlerOptions, Status } from './models';
import { parseBody } from './helpers';

export function createRoute<TQuery extends ZodTypeAny, TBody extends ZodTypeAny>(options: RouteHandlerOptions<TQuery, TBody>): RouteHandler {
  return async (req, res, queryParams) => {
    try {
      const parsedStringBody = await parseBody(req);
      const response = await options.handler({
        incomingMessage: req,
        query: options.queryParser ? options.queryParser(z).parse(queryParams) : queryParams,
        body: options.bodyParser ? options.bodyParser(z).parse(parsedStringBody) : parsedStringBody,
      });

      if ('destination' in response) {
        let status: Status;
        if (response.status) {
          status = response.status;
        } else {
          status = response.permanent ? Status.MOVED_PERMANENTLY : Status.MOVED_TEMPORARILY;
        }

        res.writeHead(status, { Location: response.destination });
        res.write('');
        res.end();
        return;
      }

      const headers: Record<string, string> = response.headers ?? {};
      let body = response.body;

      if (typeof response.body === 'object') {
        body = JSON.stringify(response.body);
        headers['Content-Type'] = 'application/json';
      }

      res.writeHead(response.status, headers);
      res.write(body);
      res.end();
    } catch (error: any) {
      res.writeHead(Status.INTERNAL_SERVER_ERROR);
      res.write(error instanceof Error ? error.message : error);
      res.end();
    }
  };
}

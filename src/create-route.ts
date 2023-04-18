import { z, ZodTypeAny } from 'zod';
import { RouteHandler, RouteHandlerOptions, Status } from './models';
import { parseBody } from './helpers';

export function createRoute<TQuery extends ZodTypeAny, TBody extends ZodTypeAny, TParams extends ZodTypeAny>(options: RouteHandlerOptions<TQuery, TBody, TParams>): RouteHandler {
  return async (req, res, queryParams, urlParams) => {
    try {
      const { handler, bodyParser, paramsParser, queryParser } = options;
      const parsedStringBody = await parseBody(req);
      const response = await handler({
        incomingMessage: req,
        query: queryParser ? queryParser(z).parse(queryParams) : queryParams,
        body: bodyParser ? bodyParser(z).parse(parsedStringBody) : parsedStringBody,
        params: paramsParser ? paramsParser(z).parse(urlParams) : urlParams,
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

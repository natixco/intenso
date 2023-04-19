import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { getPort, setupTest } from '../../../test-helpers';
import * as fileHelpers from '../../../src/helpers';

describe('when createServer() throws an error', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    setupTest();
    server = createServer({ port });
    vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('');
  });

  it('should throw error due to missing path', async () => {
    expect(server.setup()).rejects.toThrowError('Can not register routes due to missing path');
  });
});

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { getPort } from '../../../test-helpers';
import * as fileHelpers from '../../../src/helpers';

vi.mock('fs', async () => {
  return {
    existsSync: vi.fn().mockReturnValue(false),
  };
});
vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('');

describe('when createServer() throws an error', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    server = createServer({ port });
  });

  it('should throw error due to missing path', async () => {
    expect(server.setup()).rejects.toThrowError('Can not register routes due to missing path');
  });
});

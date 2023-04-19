import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { getPort, setupTest } from '../../../test-helpers';

describe('when createServer() throws an error', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    setupTest();
    server = createServer({ port });
    vi.mock('fs', async () => {
      return {
        existsSync: vi.fn().mockReturnValue(false),
      };
    });
  });

  it('should throw error due to missing routes directory', async () => {
    expect(server.setup()).rejects.toThrowError('`routes` directory does not exist');
  });
});

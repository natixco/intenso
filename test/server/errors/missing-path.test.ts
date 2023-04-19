import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { getPort, setupTest } from '../../../test-helpers';
import { FileService } from '../../../src/services/file-service';

describe('when createServer() throws an error', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    setupTest();
    server = createServer({ port });
    vi.spyOn(FileService.prototype, 'getCurrentPath').mockImplementation(() => '');
  });

  it('should throw error due to missing path', async () => {
    expect(server.setup()).rejects.toThrowError('Can not register routes due to missing path');
  });
});

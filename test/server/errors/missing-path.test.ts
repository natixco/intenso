import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { setupTest } from '../../../test-helpers';
import { FileService } from '../../../src/services/file-service';

describe('when createServer() throws an error', () => {
  let port: number;

  beforeAll(async () => {
    port = setupTest();
    vi.spyOn(FileService.prototype, 'getCurrentPath').mockImplementation(() => '');
  });

  it('should throw error due to missing path', async () => {
    await expect(createServer({ port })).rejects.toThrowError('Can not register routes due to missing path');
  });
});

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from '../../../src';
import { setupTest } from '../../../test-helpers';

describe('when createServer() throws an error', () => {
  let port: number;

  beforeAll(async () => {
    port = setupTest();
    vi.mock('fs', async () => {
      return {
        existsSync: vi.fn().mockReturnValue(false),
      };
    });
  });

  it('should throw error due to missing routes directory', async () => {
    await expect(createServer({ port })).rejects.toThrowError('`routes` directory does not exist');
  });
});

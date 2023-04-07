import { beforeAll, describe, expect, it, SpyInstance, vi } from 'vitest';
import { log } from '../src/logger';
import { yellowBright } from 'colorette';
import { mockConsole } from '../test-helpers';

describe('log()', () => {
  let spy: SpyInstance;

  beforeAll(() => {
    mockConsole();
    spy = vi.spyOn(console, 'log');
  });

  it('should log out the correct text', () => {
    log('blazing fast logging');
    expect(spy).toHaveBeenCalledWith(yellowBright('[intenso] ') + 'blazing fast logging');
  });
});

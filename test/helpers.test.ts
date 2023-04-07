import { beforeEach, describe, expect, it } from 'vitest';
import { ParsedUrl } from '../src';
import { parseBody, parseUrl } from '../src/helpers';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';

describe('parseUrl(url)', () => {

  describe('when url = ""', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({});
    });
  });

  describe('when url = "/"', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('/');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('/');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({});
    });
  });

  describe('when url = "path/"', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('path/');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('path');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({});
    });
  });

  describe('when url = "/path/"', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('/path/');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('/path');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({});
    });
  });

  describe('when url = "/path?id=1"', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('/path?id=1');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('/path');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({ id: '1' });
    });
  });

  describe('when url = "/path/?id=1"', () => {
    let url: ParsedUrl;
    beforeEach(() => {
      url = parseUrl('/path/?id=1');
    });

    it('should return with the correct pathname', () => {
      expect(url.pathname).toEqual('/path');
    });

    it('should return with the correct queryParams', () => {
      expect(url.queryParams).toEqual({ id: '1' });
    });
  });

});

describe('parseBody(incomingMessage)', () => {

  describe('when body is a string', async () => {
    let body: string;
    beforeEach(async () => {
      body = await parseBody(Readable.from([Buffer.from('lorem ipsum', 'utf-8')]) as IncomingMessage);
    });

    it('should return with the correct body', () => {
      expect(body).toEqual('lorem ipsum');
    });
  });

  describe('when body is a json string', async () => {
    let body: string;
    beforeEach(async () => {
      body = await parseBody(Readable.from([Buffer.from(JSON.stringify({ x: 123 }), 'utf-8')]) as IncomingMessage);
    });

    it('should return with the correct body', () => {
      expect(body).toEqual({ x: 123 });
    });
  });

});

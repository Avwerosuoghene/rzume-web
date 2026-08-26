import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should return an empty string for undefined input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return an empty string for an empty string input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return the value unchanged when shorter than the limit', () => {
    expect(pipe.transform('short', 20)).toBe('short');
  });

  it('should return the value unchanged when exactly at the limit', () => {
    expect(pipe.transform('exactlyten', 10)).toBe('exactlyten');
  });

  it('should truncate and append the default ellipsis when longer than the limit', () => {
    expect(pipe.transform('this is a long string', 10)).toBe('this is a ...');
  });

  it('should truncate using a custom limit', () => {
    expect(pipe.transform('hello world', 5)).toBe('hello...');
  });

  it('should truncate using a custom ellipsis', () => {
    expect(pipe.transform('hello world', 5, '!')).toBe('hello!');
  });

  it('should use the default limit of 20 when none is provided', () => {
    const value = 'a'.repeat(25);
    expect(pipe.transform(value)).toBe('a'.repeat(20) + '...');
  });
});

import { jwtSign, jwtVerify } from '../jwt-tools';

describe('jwt tools', () => {
  it('test jwtSign', () => {
    const input = jwtSign({ name: 'kenny' });
    const output = jwtVerify(input);
    console.log('input====', input);
    console.log('output====', output);
    expect(output).toBeTruthy();
    const arrResult: string[] = input.split('.');
    expect(arrResult).toHaveLength(3);
    expect(output).toHaveProperty('name', 'kenny');
  });
});

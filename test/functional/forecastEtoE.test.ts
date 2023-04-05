describe('Testando config do Jest', () => {
  it('return a forecast', async () => {
    const { body, status } = await global.testRequest.get('/forecast');
    expect(status).toBe(200);
    expect(body).toEqual({ message: 'lalau' });
  });
});

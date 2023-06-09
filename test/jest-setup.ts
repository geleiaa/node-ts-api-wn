import { SetupServer } from '@src/server';
import supertest from 'supertest';

//let server: SetupServer;

beforeAll(async () => {
  const server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async () => {
  const server = new SetupServer();
  await server.close();
});

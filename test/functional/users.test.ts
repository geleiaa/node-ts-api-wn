import { User } from '@src/models/usersModel';
import AuthService from '@src/services/userAuth';

describe('User Funct tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('Create Users', () => {
    it('return user created', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '12345',
      };

      const resp = await global.testRequest.post('/users').send(newUser);
      expect(resp.status).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, resp.body.password)
      ).resolves.toBeTruthy();
      expect(resp.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });

    it('return 422 validation error', async () => {
      const newUser = {
        email: 'john@mail.com',
        password: '1234',
      };
      const resp = await global.testRequest.post('/users').send(newUser);

      expect(resp.status).toBe(422);
      expect(resp.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message: 'Users validation failed: name: Path `name` is required.',
      });
    });

    it('return 409 se email ja existir no banco', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await global.testRequest.post('/users').send(newUser);
      const resp = await global.testRequest.post('/users').send(newUser);

      expect(resp.status).toBe(409);
      expect(resp.body).toEqual({
        code: 409,
        error: 'Conflict',
        message: 'Users validation failed: email: email ja cadastrado!!.',
      });
    });
  });
});

describe('authenticating a user', () => {
  it('deve gerar um token para validar o user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john34@mail.com',
      password: '1234',
    };
    const user = await new User(newUser).save();
    const response = await global.testRequest
      .post('/users/auth')
      .send({ email: newUser.email, password: newUser.password });

    const JwtClaims = AuthService.decodeToken(response.body.token);
    expect(JwtClaims).toMatchObject({ sub: user.id });
  });

  it('return UNAUTHORIZED se o email not found', async () => {
    const response = await global.testRequest
      .post('/users/auth')
      .send({ email: 'some-email@mail.com', password: '1234' });

    expect(response.status).toBe(404);
  });

  it('return UNAUTHORIZED se a senha not match', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john32@mail.com',
      password: '1234',
    };
    await new User(newUser).save();
    const response = await global.testRequest
      .post('/users/auth')
      .send({ email: newUser.email, password: 'different password' });

    expect(response.status).toBe(404);
  });

  describe('Quando get o user profile info', () => {
    it(`return profile information do token`, async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john22@mail.com',
        password: '1234',
      };
      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user._id);
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it(`return Not Found, quando o user is not found`, async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      //create a new user but don't save it
      const user = new User(newUser);
      const token = AuthService.generateToken(user._id);
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(404);
      expect(body.message).toBe('User não found!!');
    });
  });
});

import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/usersModel';
import { ErrosController } from './erros';
import AuthService from '@src/services/userAuth';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { UserRepository } from '@src/repositories/Irepositories';

@Controller('users')
export class UsersController extends ErrosController {
  constructor(private userRepo: UserRepository) {
    super();
  }

  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await this.userRepo.create(req.body);

      res.status(201).send(newUser);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err as Error);
    }
  }

  @Post('auth')
  public async auth(req: Request, res: Response): Promise<Response> {
    const user = await this.userRepo.findOneByEmail(req.body.email);
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User nao found!',
      });
    }

    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'Senha nao match!',
      });
    }

    const token = AuthService.generateToken(user.id);

    return res.status(200).send({ ...user, ...{ token }});
  }

  @Get('me')
  @Middleware(AuthMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const userId = req.decoded ? req.decoded.userId : undefined;
    
    if (!userId) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'user id not provided',
      });
    }
    const user = await this.userRepo.findOneById(userId);

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User não found!!',
      });
    }

    return res.send({ user });
  }
}

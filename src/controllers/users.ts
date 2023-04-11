import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/usersModel';
import { ErrosController } from './erros';
import AuthService from '@src/services/userAuth';
import { AuthMiddleware } from '@src/middlewares/authMid';

@Controller('users')
export class UsersController extends ErrosController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err as Error);
    }
  }

  @Post('auth')
  public async auth(req: Request, res: Response): Promise<Response> {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return this.sendErrorResponse(res, { code: 401, message: 'User nao found!' })
    }

    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return this.sendErrorResponse(res, { code: 401, message: 'Senha nao match!' })
    }

    const token = AuthService.generateToken({ id: user._id });

    return res.status(200).send({ token: token });
  }

  @Get('me')
  @Middleware(AuthMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const userId = req.decoded ? req.decoded.id : undefined;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return this.sendErrorResponse(res, { code: 404, message: 'User não found!!' });
    }

    return res.send({ user });
  }
}

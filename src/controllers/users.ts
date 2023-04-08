import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/usersModel';
import { ErrosController } from './erros';
import AuthService from '@src/services/userAuth';

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
      return res.status(401).send({ code: 401, error: 'User nao found!' });
    }

    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return res.status(401).send({ code: 401, error: 'Senha nao found!' });
    }

    const token = AuthService.generateToken(user.toJSON());

    return res.status(200).send({ token: token });
  }
}
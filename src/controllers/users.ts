import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/usersModel';
import { ErrosController } from './erros';

@Controller('users')
export class UsersController extends ErrosController {
    @Post('')
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const user = new User(req.body);
            const newUser = await user.save();
            res.status(201).send(newUser);
        } catch (err) {
            this.sendCreateUpdateErrorResponse(res, (err as Error))
        }
    }
}
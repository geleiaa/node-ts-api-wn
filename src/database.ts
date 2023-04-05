import config, { IConfig } from 'config';
import { connect as mongooseConnect, connection } from 'mongoose';

const dbConnect: IConfig = config.get('App.database');

export const connect = async (): Promise<void> => {
  await mongooseConnect(dbConnect.get('mongoUrl'));
};

export const close = (): Promise<void> => connection.close();

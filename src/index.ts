import 'module-alias';
import { SetupServer } from './server'; /*<---*/
import config from 'config';
import logger from './logger';

enum ExitStats {
  Failure = 1,
  Succes = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting devido a unhandled promise: ${promise} por causa de: ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting devido a uncaught exception: ${error}`);
  process.exit(ExitStats.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    for (const exitSignal of exitSignals) {
      process.on(exitSignal, async () => {
        try {
          await server.close();
          logger.info(`App exited com sucesso`);
          process.exit(ExitStats.Succes);
        } catch (error) {
          logger.error(`App exited com erro: ${error}`);
          process.exit(ExitStats.Failure);
        }
      });
    }
  } catch (error) {
    logger.error(`App crashou pelo error: ${error}`);
    process.exit(ExitStats.Failure);
  }
})();

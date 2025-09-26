import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import app from './server';
import apiRouter from './routes/index';


/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = (
  'Express server started on port: ' + ENV.Port.toString()
);


/******************************************************************************
                                  Run
******************************************************************************/

// Monter les routes avant de démarrer le serveur
app.use('/api', apiRouter);

// Start the server
app.listen(ENV.Port, err => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});

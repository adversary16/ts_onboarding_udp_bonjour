import { default as express } from 'express';
import { baseRouter } from '../../controllers';

const app = express();


export const restServer = app.use(baseRouter);
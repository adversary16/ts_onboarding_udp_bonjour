import { default as express } from 'express';
import { baseRouter } from '../../routes';

const app = express();


export const restServer = app.use(baseRouter);
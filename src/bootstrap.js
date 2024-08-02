
import express from 'express'

import cors from 'cors'
import morgan from 'morgan'
import v1Router from './routers/v1.routes.js'
import { AppError } from './utilies/error.js'
import { cron } from './utilies/cron.js'
import { cloudinaryCofigration } from './utilies/cloudinary.js'


export const bootstrap = (app) => {

    cloudinaryCofigration();

    app.use(express.json())
    app.use(cors());
    app.use(morgan('dev'))

    cron();
    
    app.use('/api/v1', v1Router)


    app.all('*', (req, res, next) => {
        throw new AppError('Route not found', 404)
    })


    app.use((err, req, res, next) => {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        err.stack = err.stack;

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(process.env.MODE === 'devlopment' && { stack: err.stack })
        });
    });

}
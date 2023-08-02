import express from 'express';
import winston from 'winston';
import pedidosRouter from './routes/pedidos.js';
import { promises as fs, write } from 'fs';
import cors from 'cors';

const { readFile, writeFile } = fs;

global.fileName = "pedidos.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({level, message, label, timestamp}) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename : "delivery.log"})
  ],
  format: combine(
    label({ label: "delivery-api"}),
    timestamp(),
    myFormat
  )
});

const app = express();
app.use(express.json());
app.use(cors()); 
app.use('/pedido', pedidosRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    logger.info("API started read");
  } catch (err) {
    const initialJson = {
      nextId: 1,
      pedidos: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson)).then(()=> {
        logger.info("APQ started and file created");
    }).catch(err => {
        logger.error(err)
    })
  }
});

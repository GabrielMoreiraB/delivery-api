import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let pedido = req.body;

    if(!pedido.cliente || !pedido.produto || !pedido.valor == null) {
      throw new Error("Formato invalido, cliente valor e produto são obrigatorios")
    }

    const data = JSON.parse(await readFile(global.fileName));

    pedido = { 
            id: data.nextId++, 
            cliente: pedido.cliente,
            produto: pedido.produto,
            valor: pedido.valor,
            entregue: false,
            timestamp: new Date().toISOString()
          };
    data.pedidos.push(pedido);

    await writeFile(global.fileName, JSON.stringify((data, null, 2)));

    res.send(pedido);
    logger.info(`POST /pedido - ${JSON.stringify(pedido)}`);
  } catch (err) {
    next(err)
  }
});

router.put('/', async (req, res, next) => {
  try{
      let pedido = req.body

      if(!pedido.cliente || !pedido.produto || !pedido.valor == null || !pedido.entregue) {
        throw new Error("Formato invalido, cliente valor e produto são obrigatorios")
      }
      const data = JSON.parse(await readFile(global.fileName));
      const index = data.pedidos.findIndex(item => item.id === pedido.id);

      if(index === -1) throw new Error("Registro não encontrado");


      data.pedidos[index].cliente = pedido.cliente;
      data.pedidos[index].produto = pedido.produto;
      data.pedidos[index].valor = pedido.valor;
      data.pedidos[index].entregue = pedido.entregue;

      await writeFile(global.fileName, JSON.stringify(data));
      logger.info(`PUT /pedido - ${JSON.stringify(pedido)}`);
      res.send(pedido);
  } catch (err) {
    next(err)
  }
});

router.patch("/updatePedido", async (req, res, next) => {
  try{
    let pedido = req.body

    if(!pedido.id || typeof(pedido.entregue) !== 'boolean' ) {
      throw new Error("Formato invalido, id e statys de entregue são necessarios")
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.pedidos.findIndex(item => item.id === pedido.id);

    if(index === -1) throw new Error("Registro não encontrado");

    data.pedidos[index].entregue = pedido.entregue;

    await writeFile(global.fileName, JSON.stringify(data));
    logger.info(`PATCH /pedido/updateBalance - ${JSON.stringify(pedido)}`);
    res.send(data.pedidos[index]);
} catch (err) {
  next(err)
}
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.pedidos = data.pedidos.filter(
      pedido => pedido.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data));
    logger.info(`DELETE /pedido/:id - ${req.params.id}`);
    res.send(`Pedido excluido com sucesso`);
    res.end();
  } catch (err) {
    next(err)
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const pedido = data.pedidos.find(
      pedido => pedido.id === parseInt(req.params.id)
    );
    logger.info(`GET /pedido/:id `);
    res.send(pedido);
  } catch (err) {
    next(err)
  }
});

router.post('/totalCliente', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const cliente = req.body;
    if(!cliente.cliente  || cliente.cliente === null) {
      throw new Error("Formato invalido, cliente é obrigatorio")
    }
    const totalPedido = data.pedidos.reduce((total, pedido) => {
      if(pedido.cliente === cliente && pedido.entregue){
        return total + pedido.valor;
      };
      return total;
    }, 0);
    logger.info(`GET /totalCliente `);
    res.send(totalPedido);
  } catch (err) {
    next(err)
  }
});

/* 
router.get('/', async (req, res, next) => {
  try {
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
    logger.info(`GET /account `);
  } catch (err) {
    next(err)
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      account => account.id === parseInt(req.params.id)
    );
    logger.info(`GET /account/:id `);
    res.send(account);
  } catch (err) {
    next(err)
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      account => account.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify((data, null, 2)));
    logger.info(`DELETE /account/:id - ${req.params.id}`);
    res.end();
  } catch (err) {
    next(err)
  }
});


 */
router.use((err, req, res, next)=> {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;

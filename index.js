const Koa = require('koa');
const compress = require('koa-compress');
const sse = require('koa-sse-stream'); 
const events = require('events');

var em = new events.EventEmitter();

const app = new Koa();

app.use(compress())
 
app.use(sse({
    maxClients: 5000,
    pingInterval: 30000
}));
 
app.use(async (ctx) => {
    ctx.sse.send('a notice');
    const handler = (data) => ctx.sse.send('fire');
    em.on('fire', handler);
    em.on('disconnect', ()=>{
        ctx.sse.send('disconnect')
        console.log('other user disconnects')
    })
    ctx.req.on('close', () => {
        console.log('diconnect');
        em.emit('disconnect', '');    
        em.removeListener('fire', handler)
    });
    em.emit('fire', '');
    //ctx.sse.sendEnd();
});

app.listen(3000);
//index.ts
import Router from 'koa-router';
// import {Record} from "./types";
import {addRecord, getRecords, getTasks} from "./db";

const router = new Router();

router.prefix('/api/slow-page');
router.post('/add', async (ctx: any) => {
    const record = ctx.request.body;
    await addRecord(record);
    console.log('添加一条记录:', JSON.stringify(record));
    ctx.body = {
        code: '00000',
        msg: 'success',
        data: ''
    };
});

router.get('/tasks', async (ctx) => {
    const tasks = await getTasks();
    ctx.body = {
        code: '00000',
        msg: 'success',
        data: tasks
    };
});

router.post('/records', async (ctx) => {
    // const pageIndex = Number(ctx.request.query.pageIndex || '');
    // const pageSize = Number(ctx.request.query.pageSize || '20');
    const target = ctx.request.body;
    const taskId = target.taskId;
    const orderBy = target.orderBy || 'useTime';
    const desc = target.desc || 'desc';
    const records = await getRecords(taskId, orderBy, desc);
    ctx.body = {
        code: '00000',
        msg: 'success',
        data: records
    };
});

module.exports = router;
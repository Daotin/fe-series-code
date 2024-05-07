import {Database} from "sqlite3";
import {Record, Tasks} from "./types";

const db = new Database('./db/slowPage.db');

function query(sql: string): Promise<any[]>{
    return new Promise((resolve, reject) => {
        db.all(sql, function(err, rows){
            if(null != err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function insert(sql: string, objects: any[]): Promise<void>{
    return new Promise((resolve, reject) => {
        db.serialize(function(){
            const stmt = db.prepare(sql);
            for(let i = 0; i < objects.length; ++i){
                stmt.run(objects[i]);
            }
            stmt.finalize();
            resolve();
        });
    });
}

function execute(sql:string):Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, function (err) {
            if (null != err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Tasks
// id|taskName|createTime
//
// Statistics
// id|taskId|route|query|createTime|type|url|params|detail|useTime


async function getTaskId(taskName: string): Promise<number> {
    const result = await query(`select id from Tasks where taskName='${taskName}'`);
    let taskId = -1;
    if(result && result.length && result[0].id) {
        taskId = Number(result[0].id);
    }
    return taskId;
}

export async function addRecord(record: Record) {
    let taskId =  await getTaskId(record.taskName);
    record.createTime = record.createTime || +(new Date());
    record.url = record.url || '';
    record.params = record.params || '';
    record.detail = record.detail || '';
    record.title = record.title || '';
    record.routeUrl = record.routeUrl || '';
    if(taskId<0) {
       await insert('insert into Tasks(taskName, createTime) values(?, ?)', [[record.taskName, record.createTime]])
    }
    taskId =  await getTaskId(record.taskName);
    if(taskId<0) {
        throw new Error('插入task失败:' + record.taskName);
    }
    await insert('insert into Statistics(taskId, route, routeUrl, title, createTime, type, url, params, detail, useTime) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [[taskId, record.route, record.routeUrl, record.title, record.createTime, record.type, record.url, record.params, record.detail, record.useTime]]);
}

export async function getTasks(): Promise<Tasks[]> {
    const result = await query(`select id,taskName,createTime from Tasks order by createTime desc`);
    return result;
}

export async function getRecords(taskId: number, orderBy: string, desc: string = ''): Promise<Record[]> {
    const result = await query(`select id, route, routeUrl, title, createTime, type, url, params, detail, useTime from Statistics where taskId=${taskId} order by ${orderBy} ${desc}`);
    return result;
}
// Pluggable key/value store: Postgres when DATABASE_URL is set, else a JSON file (BT_DATA or ./data/store.json).
import fs from 'fs';import path from 'path';
export async function openStore(){
 if(process.env.DATABASE_URL){const {default:pg}=await import('pg');const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)?false:{rejectUnauthorized:false},max:4});
  await pool.query('create table if not exists bt_kv(k text primary key, v jsonb not null, t timestamptz default now())');
  return {kind:'postgres',
   get:async k=>(await pool.query('select v from bt_kv where k=$1',[k])).rows[0]?.v??null,
   set:async(k,v)=>{await pool.query('insert into bt_kv(k,v,t) values($1,$2,now()) on conflict(k) do update set v=$2,t=now()',[k,JSON.stringify(v)])},
   del:async k=>{await pool.query('delete from bt_kv where k=$1',[k])},
   list:async p=>(await pool.query("select k,v from bt_kv where k like $1",[p.replace(/[%_]/g,'\\$&')+'%'])).rows}}
 const file=process.env.BT_DATA||path.join(process.cwd(),'data','store.json');fs.mkdirSync(path.dirname(file),{recursive:true});
 let db={};try{db=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}
 let t=null;const flush=()=>{const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db));fs.renameSync(tmp,file)};
 const save=()=>{flush()};
 return {kind:'file',file,
  get:async k=>db[k]??null,set:async(k,v)=>{db[k]=JSON.parse(JSON.stringify(v));save()},del:async k=>{delete db[k];save()},
  list:async p=>Object.keys(db).filter(k=>k.startsWith(p)).map(k=>({k,v:db[k]}))}}

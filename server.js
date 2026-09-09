import express from 'express'
import cors from 'cors'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const app=express(); app.use(cors()); app.use(express.json())
const dataFile=resolve('workshop-records.json')
const records=existsSync(dataFile) ? JSON.parse(readFileSync(dataFile,'utf8')) : []
function persist(){ writeFileSync(dataFile, JSON.stringify(records,null,2)) }
app.get('/api/records',(req,res)=>res.json(records))
app.post('/api/records',(req,res)=>{if(!req.body || typeof req.body!=='object') return res.status(400).json({error:'记录内容无效'}); const record={id:records.length+1,createdAt:new Date().toISOString(),...req.body}; records.push(record); persist(); res.status(201).json(record)})
app.get('/api/orders',(req,res)=>res.json([{id:'024',title:'月影 · 苏制座钟',status:'维修中',customer:'林女士'}]))
app.get('/api/catalogue',(req,res)=>res.json({unlocked:3,total:24}))
app.listen(3001,()=>console.log('Workshop API listening on http://localhost:3001'))

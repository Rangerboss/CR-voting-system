const express = require('express')
const AES =require('crypto-js/aes.js')
const path = require('path')
const app = express()
const port = 3000
const session = require('express-session');
const crypto = require('crypto');

// 32-byte key (for AES-256)
const key = crypto.createHash('sha256').update('my-secret-key').digest();

// 16-byte fixed IV (not secure, but makes output deterministic)
const iv = Buffer.alloc(16, 0); // All zero IV

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}
const {Client} = require('pg');
const _db = new Client({
    host:"localhost",
    user: "postgres",
    port: 5432,
    password: "secret",
    database: "voting"
})

_db.connect().then(()=>{console.log("Connected to Database")})





app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret: 'your-super-secret-key',  // change this to a random secret
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 6000 }    // 100 hour session lifetime (optional)
}));

app.get('/',(req,res)=>{
  if (req.session.used) {
    // User already used the site once
    return res.send('Sorry, you can only use this website once.');
  }else {
    // Mark as used
    req.session.used = true;
  res.sendFile(path.join(__dirname,'../Frontend/Homepage.html'))
  }
});




function check_exist(roll){
    let exist = true;
    console.log(roll)
    _db.query(`select * from "votes" where "roll" = ${roll};`,(err,res)=>{
      console.log(res)
        // const d = res.rowCount;
        

        
        if(res==undefined){
            exist=false;
            console.log("not exist");
            return false;
        
        }else{
            exist=true;
            console.log("exists");
            return true;
        }}
    )
    
}




app.post('/castvote',async(req,res)=>{
    const roll = encrypt(req.body.roll);
    const code = req.body.code;
    if (req.body.roll>0 && req.body.roll<28 && req.body.roll%1==0){

    if (check_exist(encrypt(roll))==true){
      
        res.sendFile(path.join(__dirname,'../Frontend/voted.html'))

    }else{
    
    _db.query(`INSERT INTO "votes" VALUES ('${roll}','${code}')`,(err,res)=>{
        if(err){
            console.log(err.message);
        }
    }
  )
    res.sendFile(path.join(__dirname,'../Frontend/thank you.html'))
}}else{
    res.sendFile(path.join(__dirname,'../Frontend/Homepage.html'))
    console.log("Not valid roll number")
}
})






app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})


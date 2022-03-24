const mysql=require("mysql");
const express=require("express");
var bodyParser=require("body-parser");
var { response } = require('express');
const redis = require("redis");
const client = redis.createClient();
 var encoder= bodyParser.urlencoded();
const path = require("path");
const moment = require('moment');
const { request } = require("http");

var a;
var liste = [];
var messageInfo = [];
var tarihm;
var datagotur=[]
var car1;
var car2;
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app=express();


const connection=mysql.createConnection({
     host:"127.0.0.1",
     port:"3306",
     user:"root",
     password:"password",
     database:"nodejs"
     
});

 app.use(express.static('public'));


connection.connect(function(error){
     if(error) throw error
     else console.log("Connected succesfully")
});
app.get("/",function(req,res){

     res.sendFile(__dirname +"/public/index5.html");
     
     
     
     })
app.post("/",encoder,function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    console.log("dsadasdasda");
    console.log(username);
    console.log(password);
     connection.query("select * from loginuser where user_name = ? and user_pass= ?",[username,password],function(error,results,fields){
                  if(results.length>0){
                    res.redirect("/index3");
                

                  }else{
                    res.redirect("/")
                  }
                  res.end();
     })
     connection.query("select car2,car1 from loginuser where user_name = ? and user_pass= ?",[username,password],function(error,results,fields
      ){
             if(results.length>0){
                console.log(results);
                car1=results[0].car1;
                car2=results[0].car2;
               console.log(results[0].car2);
               console.log(results[0].car1);
             }
      })
       let m=moment().format('YYYY-MM-DD hh:mm:ss a');
          console.log(`GİRİŞ TARİHİ=>${m.toString()}`);
          let sql=' INSERT INTO dates_login(tarih,user_name) VALUES(?,?)  ';
          connection.query(sql,[m,username],(err,results)=>{
                if(err) throw err;


          });

})
app.get("/index3",function(req,res){

     res.sendFile(__dirname +"/public/index3.html");
     
     
     })
 
     
     

     app.post('/process_post',urlencodedParser, function (req, res) {
      
          // JSON formatinda hazirla
          response = {
            bdaytime: req.body.bdaytime,
            carİd: req.body.carİd
          };
          // console.log(response);
        
          a = response;
         console.log(a.carİd);
         console.log(a.bdaytime);
          tarihm = abas(a)
         // console.log(tarihm)
          //  console.log(tarihm)
          liste = diziOluştur(tarihm)
         // console.log(liste)
          // console.log(liste)
          var gelenid=a.carİd;
          console.log(gelenid);
          
         if(gelenid==="Car1"){
            redisGet(liste,setRedis,car1)
          }else if(gelenid==="Car2"){
            redisGet(liste,setRedis,car2)             
          }
         
          setTimeout(() => {res.send(datagotur)},1000)               
          // res.send(redisGet(liste));       
        })

        function abas(a) {
          var donusturulenJsonObject = a.bdaytime;
          var tarih = donusturulenJsonObject.toString().replace('T', ' ');
          // console.log(tarih);
          return tarih;
        
          //client.connect();   
        }
        function diziOluştur(tarihm) {

          liste[0] = tarihm;
          var a = tarihm.indexOf(':');
          var dk = tarihm.slice(a + 1, a + 3);
          var a = parseInt(dk);
          if (a > 30) {
            for (i = 1; i < 31; i++) {
              liste[i] = tarihm.replace(":"+dk,":"+ a - i); 
              if ((a - i) < 10) 
              {
                liste[i] = tarihm.replace(":"+dk,":"+ '0' + (a - i));
              }
            }
          }
          a = tarihm.indexOf(':');
          var saat = tarihm.slice(a -2, a);
          var b = parseInt(saat);
          dk = tarihm.slice(a + 1, a + 3);
          a = parseInt(dk);
          var w=0;
          if (a < 30 && b>0) {
            for (i = 1; i < 31; i++) {
              if(a-i>=0)
              {
              liste[i] = tarihm.replace(":"+dk,":"+(a-i));
                if ((a - i) < 10) {
                  liste[i] = tarihm.replace(":"+dk, ":"+'0'+ (a - i));
                }
          }else if(a-i<0)
        {
            if(b<10 && w==0)
            {
                tarihm=tarihm.replace(saat+":",'0'+(b-1)+":");
                w=1;
            }else if(b>=10 && w==0)
            {
                tarihm=tarihm.replace(saat+":",(b-1)+":");
                w=1;
            }
            liste[i] = tarihm.replace(":"+dk,":"+(60+(a - i)));
        }
    }
   
}
return liste;     
        }


        function setRedis(){
          datagotur=messageInfo
        }
        
        function redisGet(tarih,callback,Carid) {

          datagotur=[];
          liste = [];
          messageInfo = [];
          console.log("denemeeee")
          console.log(Carid);
          //console.log(tarih)
          client.on("error", error => {
            console.error(error);
          });
        
          for (i = 0; i < 30; i++) {
        
            var tarihx = tarih[i];
          //  console.log(`user_${Carid}_${tarihx}`);
            client.get(`user_${Carid}_${ tarihx}`, (error, message) => {
              
              if (error) {
                console.error(error);
              }
             // console.log(typeof message);
             // console.log(message);
              // console.log("Message", message);
        
              //  console.log(message)
              //console.log(messageInfo[i])
        
              if (message != null) {
                //let varData=JSON.parse(message)
                messageInfo.push(JSON.parse(message))
        
                /*console.log(messageInfo[i].date);
                console.log(messageInfo[i].lokx);
                console.log(messageInfo[i].loky);
                console.log(messageInfo[i].id);*/
              }
                
        
            });
          }
          callback();
        
        }



app.listen(3700);

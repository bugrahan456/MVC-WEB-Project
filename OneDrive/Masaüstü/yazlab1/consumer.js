const amqp = require("amqplib");
const queueName = process.argv[2] || "jobsQueue";
const data = require("./data.json")
const redis = require("redis");
//const client = redis.createClient(6379,"furkan-redis");
const client = redis.createClient();
var deneme;

//client.connect();


connect_rabbitmq();


async function connect_rabbitmq() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const assertion = await channel.assertQueue(queueName);

    // Mesajın Alınması...
    console.log("Mesaj bekleniyor...");
    channel.consume(queueName, message => {
        
       const  messageInfo = JSON.parse(message.content.toString())
      /* messageInfo.id=JSON.parse(message.content.toString());
       messageInfo.date=JSON.parse(message.content.toString());
       


        console.log("date",messageInfo);*/
    
       
        const userInfo = data.find(u => u.id == messageInfo.description && u.date==messageInfo.date)
       // console.log("userinfoo",userInfo);
        if(userInfo){
            client.on('connection', () => { 
              console.log('Redis connected!');
            })
            console.log("İşlenen Kayıt", userInfo);
           
            client.set(`user_${userInfo.id}_${userInfo.date}`,JSON.stringify(userInfo),(err,status) => {
              if(!err){
                console.log(status)
                channel.ack(message);
              }
            })
            

                  
        }
    });
  } catch (error) {
    console.log("Error", error);
  }
   
}
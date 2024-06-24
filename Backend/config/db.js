const { config } = require("dotenv");
const mongoose = require("mongoose");

const dbConnection=()=>{
    mongoose.connect(process.env.DB_LOCAL_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true 

    }).then(con =>{
        
        console.log(`Database Connected Successfully in ${con.connection.host}`)
    }).catch(err=>{
        console.log("DB connection failed",err)
    })
    
}
module.exports = dbConnection;
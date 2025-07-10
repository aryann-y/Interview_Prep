const mongoose=require("mongoose");
require("dotenv").config();
console.log("Mongo URI:", process.env.MONGO_URI);

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{});
        console.log("MongoDB Connected");
    }catch(err){
        console.log("Error connecting to db",err);
        process.exit(1);
    };
}
module.exports=connectDB;
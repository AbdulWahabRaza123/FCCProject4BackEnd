const mongoose=require('mongoose');
const logs=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true
    },
    logs:[{
        description:{
            type:String
        },
        duration:{
            type:Number
        },
        date:{
            type:String
        }
    }]
})
const newLog=new mongoose.model("logs",logs);
module.exports=newLog;
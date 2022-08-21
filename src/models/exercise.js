const mongoose=require('mongoose');
const exercise=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    description:
    {
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
})
const newExercise=new mongoose.model("newExercise",exercise);
module.exports=newExercise;
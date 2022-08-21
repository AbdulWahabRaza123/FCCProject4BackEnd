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
        type:String,
        required:true
    }
})
const newExercise=new mongoose.model("newExercise",exercise);
module.exports=newExercise;
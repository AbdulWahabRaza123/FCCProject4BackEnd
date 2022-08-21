const express=require('express');
const cors=require('cors');
const path=require('path');
const app=express();
const staticPath=path.join(__dirname,'../public');
app.use(express.static(staticPath));
const port=process.env.PORT||8000;
require('./conn');
const users=require('./models/users');
const exercise=require('./models/exercise');
const logs=require('./models/logs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors({optionsSuccessStatus:200}));
app.get('/',(req,res)=>{
    res.send('index');
})
app.get('/api/users',async(req,res)=>{
    try{
        let data = await users.find({ });
        res.json(data);
    }catch(e){
        res.json({error:"Invalid Error"});
    }
})
app.post('/api/users',async(req,res)=>{
try{
const name=req.body.username;
    const newUser=new users({
        username:name
    })
    const getUser=await newUser.save();
    res.json(getUser);
}catch(e){
    res.json({error:"Invalid Error"});
}
})
app.get('/api/users/:_id/logs',async(req,res)=>{
    try{
        const id=req.params._id;
        let userLogs=await logs.findOne({_id:id});
        res.json(userLogs);
    }catch(e){
        res.json({error:"Invalid Error"});
    }
})
app.get('/api/users/:_id/exercises',async(req,res)=>{
    try{
        const id=req.params._id;
        let userExercise=await exercise.findOne({_id:id});
        res.json(userExercise);
    }catch(e){
        res.json({Error:"invalid Error"});
    }
})
let mainCount=0;
app.post('/api/users/:_id/exercises',async(req,res)=>{
try{
    const id=req.body._id;
    req.params._id=id;
    const description=req.body.description;
    const duration=req.body.duration;
    const date=req.body.date;
    if(date==''){
        let date=new Date();
        date=date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
        console.log(date);
    }
    console.log("Here is data ",id," ",description," ",duration," ",date);
    const regExp=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    console.log("This is output ",regExp.test(date));
    if(!regExp.test(date)){
        console.log("Error in data");
        res.json({error:"Invalid Error"});
    }else{
    let user=await users.findOne({_id:id});
    const newExercise=await new exercise({
        username:user.username,
        description:description,
        duration:duration,
        date:date,
        _id:user._id,
    });
    const getOutput=await newExercise.save();
    const newLog=await new logs({
        username:getOutput.username,
        count:mainCount,
        _id:getOutput._id,
        logs:[{
            description:getOutput.description,
            duration:getOutput.duration,
            date:getOutput.date
    }]
    })
    const getLog=await newLog.save();
    mainCount++;
    res.status(200).json(getOutput);
}

}catch(e){
    console.log("Error while storing data");
    res.json({error:"Invalid Error"});
}
})
app.listen(port,()=>{
    console.log("Listening to port ",port);
})
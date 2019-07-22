const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const path = require('path');
const Joi = require('joi');

const db = require('./db');
const collection = "todo";

const schema = Joi.object().keys({
    todo : Joi.string().required()
});

app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname,'index.html'));
});

//read
app.get('/getTodos',(req,res) => {
    db.getDB().collection(collection).find({}).toArray((err,document) =>{
        if(err)
            console.log(err);
            else{
                console.log(document);
                res.json(document);
            }
    });
});

//update
app.put('./:id',(req,res) => {
    const todoID = req.params.id;
    const UserInput = req.body;

    db.getDB().collection(collection).findOneAndUpdate({__id : db.getPrimaryKey(todoID)},{$set : {todo : UserInput.todo}},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
            else
                res.json(result);
    })
})

//create
app.post('/',(req,res,next)=>{
    const UserInput = req.body;

    Joi.validate(UserInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(UserInput,(err,result)=>{
                if(err){
                const error = new Error("Failed to insert Todo Document");
                error.status = 400;
                next(error);
            }
                    else
                        res.json({result : result,document : result.ops[0],msg : "Successfully to Inserted"});
            });
        }
    });

    
});

//delete
app.delete('/:id',(req,res) => {
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({__id : db.getPrimaryKey(todoID)},(err,result) =>{
        if(err)
         console.log(err);
         else
            res.json(result);
    });
});


app.use((err,req,res,next) =>{
    res.status(err.status).json({
        error : {
            massage :err.massage
        }
    });
});

db.connect((err) =>{
    if(err){
        console.log('unable connect to database');
        process.exit(1);
    }
    else {
        app.listen(8080,() => {
        console.log('connect to databese, app listen port 8080')
        });
    }
});

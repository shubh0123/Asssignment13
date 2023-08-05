const express = require('express');
const app = express();
const fs = require('fs');   
const multer = require('multer');
const mongoose=require('mongoose');



async function connection(){
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/CodeQuotient',{useNewUrlParser:true,useUnifiedTopology:true});
        console.log("Connected to MongoDB");
    }
    catch(err){
        console.log("Error connecting to MongoDB",err);
    }
}  

const todoSchema=new mongoose.Schema({//schema for todo collection in MongoDB 
    data:String,
    id:String,
    completed:Boolean,
    img:String,
    path:String
});

const Todo=mongoose.model('Todo',todoSchema);//Todo is the name of collection in MongoDB




const multerStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads');
    },
    filename:function(req,file,callback){
      callback(null,file.originalname+Date.now());
    },
})

const upload = multer({ storage: multerStorage });


const path = require('path');
app.use(express.json());//middleware to parse json data from request body to req.body object 
app.set('views', path.join(__dirname, 'views'));//setting views directory for ejs files 
app.set('view engine', 'ejs');//setting view engine as ejs
app.use(express.json());//middleware to parse json data from request body to req.body object
app.use(express.urlencoded({ extended: true }))//middleware to parse url encoded data from request body to req.body object
app.use(express.static("public/uploads"))
app.use(upload.single("file"));//middleware to parse multipart form data from request body to req.body object

app.get('/',(req,res)=>{
res.render("todo",{error:null});
});
app.post('/formData',(req,res)=>{
    const completed=false;
    const id = Date.now().toString();
    console.log(req.file);
    const data=req.body.data;
    const img=req.file.filename;
    const path=req.file.path;
    // const todoObject={data,id,completed,img,path};

    const todo=new Todo({//creating a new document in MongoDB 
        data:data,
        id:id,
        completed:completed,
        img:img,
        path:path

    });
    todo.save().then((result)=>{//saving the document in MongoDB
        console.log(result);
        res.status(200);
        res.redirect("/");
    }).catch((err)=>{
        console.log(err);
        res.status(500).send("Error");
    })
   
    // saveTaskInFile(todoObject,function(err){
    //     if(err){
    //         res.status(500).send("Error");
    //         return;
    //     }
      
    //         res.status(200);
    //         res.redirect("/");

    // });  
});
app.get('/onRefreshSavedTodoData',(req,res)=>{

    Todo.find().then((result)=>{//fetching all the documents from MongoDB
        console.log(result);
        res.status(200).json(result);
    }).catch((err)=>{
        console.log(err);
        res.status(500).send("Error");
    }
    )
    
    
    // readDataFromFile(function(err,data){
    //     if(err){
    //         res.status(500).send("Error");
    //         return;
    //     }
    //     console.log(data);
    //     res.status(200).json(data);
    // });
})
app.delete('/todoDelete/:id',(req,res)=>{
    let id=req.params.id;
    Todo.findOneAndDelete({id:id}).then((result)=>{

        console.log(result,"deleted");
        fs.unlink(result.path,function(err){//deleting image from file
            if(err){
                res.status(500).send("Error");
                return;
            }

        })
    })
   
    


    // readDataFromFile(function(err,data){
    //     if(err){
    //         res.status(500).send("Error");
    //         return;
    //     }
    //     //deleting image from file
    //     for(let i=0;i<data.length;i++){
    //         if(data[i].id==id){
    //             fs.unlink(data[i].path,function(err){
    //                 if(err){
    //                     res.status(500).send("Error");
    //                     return;
    //                 }
    //             })
    //         }
    //     }

    //     const updatedTodos = data.filter((todo) => todo.id !== id);
    //     fs.writeFile('task.txt',JSON.stringify(updatedTodos),function(err){
    //         if(err){
    //             res.status(500).send("Error");
    //             return;
    //         }
          
    //     })
    //     res.status(200).json(updatedTodos);
    // }
    // )

})
app.patch('/updateTaskCompletion/:id',(req,res)=>{

    let id=req.params.id;
    console.log(req.body,id);

    Todo.updateOne({id:id},{completed:true}).then((result)=>{//updating the document in MongoDB
        console.log(result);
        res.status(200).send("Success");
    }
    ).catch((err)=>{
        console.log(err);
        res.status(500).send("Error");
    }
    );
    // readDataFromFile(function(err,data){
    //     if(err){
    //         res.status(500).send("Error");
    //         return;
    //     }
    //     console.log(data);
    //     let updatedTodos = data.map((todo) => {
    //         if (todo.id === id) {
    //           todo.completed = req.body.completed;
    //         }
    //         return todo;
    //       });
    //     fs.writeFile('task.txt',JSON.stringify(updatedTodos),function(err){
    //         if(err){
    //             res.status(500).send("Error");
    //             return;
    //         }
          
    //     })
    //     res.status(200).send("Success");
    // }
    // )
});


app.get('/todo.js',(req,res)=>{
    res.sendFile(__dirname+'/public/script/todo.js');
})

app.listen(
    50001,()=>{
        console.log('Server started at port 50001');
    }
)
function readDataFromFile(callback){
    fs.readFile('task.txt',(err,data)=>{
        if(err){
           callback(err);
        }
       
            if(data.length==0){
                data="[]"
            }
            try{
                data=JSON.parse(data);// convert string to object
                callback(null,data);
            }
            catch(err){
                callback(err);
            }
    });

}


function saveTaskInFile(todoData,callback){
    let fileData=readDataFromFile(function(err,data){
        if(err){
            callback(err);
        }
        data.push(todoData);
        fs.writeFile('task.txt',JSON.stringify(data),function(err){
            if(err){
                callback(err);
                return;
            }
            callback(null);
        })
    });
}

//**************MondoDB****************** */








connection();

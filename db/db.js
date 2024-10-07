require('dotenv').config();
const { json } = require('body-parser');
const { create } = require('domain');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const checkJwt = require('./auth');
const auth = require('./auth');

app.use(express.json());

// connection
var url = 'mongodb+srv://sonmez1sinan:c8ojGVwSmsvHlcuz@cluster0.ms3twk2.mongodb.net/'

mongoose.connect(url).then(() => console.log('connected to mongoDB')).catch(err => console.log(err));

// schema and produce new collection
const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: Boolean,
    permission: {
        type: String,
        enum: ['admin', 'user', 'editor'],
        required: true
    }
});

const Users = mongoose.model('Users', usersSchema);

app.post('/login', async(req, res) => {
    const {userName, password} = req.body;
    const user = await Users.findOne({userName: userName});
    if(!(await Users.findOne({userName: userName})))
        return res.status(404).send('invalid user-name or password');
    else if(await loginCheck(password, user.password)){
        const accesToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "3m"})
        res.json({ accesToken: accesToken });
    }
    else
        return res.status(401).send('invalid user-name or password');
})


app.get('/posts', (req, res) => {
    res.json(posts.filter(post => post.username === req.user.id))
})



app.get('/sinan', auth, (req,res)=>{
    res.send('finishh')
})
// const hashPassword = async(pw) =>{
//     const salt = await bcrypt.genSalt(12);
//     const hash = await bcrypt.hash(pw, salt);
//     return hash;
// }

const hashPassword = async (pw) => {
    const hash = await bcrypt.hash(pw, 12);
    return hash;
}

const loginCheck = async (pw, hashed) => {
    const result = await bcrypt.compare(pw, hashed);
    return result;
}

// const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"});
loginCheck('Met123', '$2b$12$ECOzKI4c.YEhxgLUKk0MdeYNgksbKyDYKTXRwFgvgwPPD68h.rqWG');




// creat and update
app.post('/sign-up', async (req, res) => {
    const { userName, password, active, permission } = req.body;
    if(await Users.findOne({userName: userName}))
        return res.status(409).send('This user-name has already been taken!!!');
    const hashed = await hashPassword(password);
    var newUser = await Users.create({
        userName,
        password: hashed,
        active,
        permission
    });
    res.send(newUser);
});

app.post('/add', auth, async(req, res) =>{
    const {userName, password, active, permission} = req.body;
    if(await Users.findOne({userName: userName}))
        return res.status(409).send('This user has already exist');
    const hashed = await hashPassword(password);
    await Users.insertMany({
        userName,
        password: hashed,
        active,
        permission
    });
    res.send('new user added')
})

app.put('/update', auth, async(req,res)=>{
    const {id} = req.body;
    if(await Users.findByIdAndUpdate(id, {active: true}))
        return res.send('updated');
    return res.send('there is no user');
})

app.delete('/delete',auth, async(req, res) => {
    const {id} = req.body;
    if(await Users.findByIdAndDelete(id))
        return res.send('user deleted');
    return res.send('there is no user');
});




// app.put('/update', async (req, res) => {
//     try {
//         await Users.findOneAndUpdate({ userName: "Mert" }, { permission: 'user' });
//         await Users.findOneAndUpdate({ userName: "Aliye" }, { permission: 'user' });
//         await Users.findOneAndUpdate({ userName: "Simay" }, { permission: 'editor' });
//         await Users.findOneAndUpdate({ userName: "Eren" }, { permission: 'admin' });
//         res.send('Upgraded');
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// })


// sifreler  Eren:jiejfij  Aliye:Aliyee Simay:Smy24 Mert:Mert123  Sinem:sinemmm


app.listen(9000);
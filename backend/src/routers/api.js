const express = require('express');
const router = express.Router();

const { Login, getUser, decrementTurn } = require('../controllers/User');
//==== Router User ====
router.post('/login', Login)
router.post('/getUser', getUser)
router.post('/decrementTurn', decrementTurn)


// ==== Router House ====
const { createHouse, getHouse, itemHouse, getUserHouses, deleteHouse, updateHouses } = require('../controllers/House');
router.post('/createHouse', createHouse)
router.get('/getHouse', getHouse)
router.get("/house/:id", itemHouse);
router.post("/getUserHouses", getUserHouses);
router.delete('/deleteHouse/:id', deleteHouse);
router.put('/updateHouse/:id', updateHouses);




//liked
const { getLiked, addLiked, unLiked } = require('../controllers/liked');
// ==== Router Liked ====
router.get("/liked/:id_user", getLiked);
router.post("/addLiked", addLiked);
router.post("/unLiked", unLiked);



const { getUser_chat, addUser_chat, addMessageChat, getMessagesChat } = require('../controllers/Chat');
// ==== Router Chat ====
router.get("/getUser_chat/:id_user", getUser_chat);
router.post("/addUser_chat", addUser_chat);
router.post("/addMessageChat", addMessageChat);
router.post("/getMessagesChat", getMessagesChat);

const { Payment,Callback,Checkout } = require('../controllers/payment');
router.post("/Payment", Payment);
router.post("/callback", Callback);
router.post("/checkout", Checkout);


module.exports = router;
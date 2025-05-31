const Chat = require('../models/user_chat');
const Messages = require('../models/messages_chat');

const getUser_chat = async (req, res) => {
  try {
    const id_user = req.params.id_user;

    if (!id_user) {
      return res.status(400).json({ message: "Thiếu thông tin id_user" });
    }

    const existingChats = await Chat.find({
      $or: [{ id_user }, { id_cus: id_user }],
    }).sort({ updatedAt: -1 });

    return res.json(existingChats || []);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách chat:", error);
    res.status(500).json({ message: "Lỗi server", status: false });
  }
};

const addUser_chat = async (req, res) => {
  try {
    const { id_user, id_cus } = req.body;

    if (!id_user || !id_cus) {
      return res.status(400).json({
        message: "Thiếu thông tin id_user hoặc id_cus",
        status: false,
      });
    }
    const existingChat = await Chat.findOne({ id_user, id_cus });

    if (existingChat) {
      return res.status(200).json({
        message: "Cuộc trò chuyện đã tồn tại",
        status: false,
        data: existingChat,
      });
    }

    const newChat = new Chat({ id_user, id_cus });
    await newChat.save();

    return res.status(201).json({
      message: "Tạo cuộc trò chuyện thành công",
      status: true,
      data: newChat,
    });
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện:", error);
    return res.status(500).json({ message: "Lỗi server", status: false });
  }
};


const addMessageChat = async (req, res) => {
    try {
        const { id_user_chat, from, text, images } = req.body;

        if (!id_user_chat || (!text && !images)) {
            return res.status(400).json({
                message: "Thiếu thông tin: cần id_user_chat và text hoặc images",
                status: false,
            });
        }

        const newMessage = new Messages({
            id_user_chat,
            from,
            text,
            images,
        });

        await newMessage.save();

        return res.status(201).json({
            message: "Đã gửi tin nhắn thành công",
            status: true,
        });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        return res.status(500).json({ message: "Lỗi server", status: false });
    }
};
const getMessagesChat = async (req, res) => {
    try {
        console.log("getMessagesChat", req.body);
        const { id_user_chat } = req.body;

        if (!id_user_chat) {
            return res.status(400).json({
                message: "Thiếu id_user_chat",
                status: false,
            });
        }

        const messages = await Messages.find({ id_user_chat }).sort({ createdAt: 1 }); // sort theo thời gian tăng dần

        return res.status(200).json({
            message: "Lấy tin nhắn thành công",
            status: true,
            messages: messages,
        });
    } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
        return res.status(500).json({ message: "Lỗi server", status: false });
    }
};
module.exports = {
    getUser_chat,
    addUser_chat,
    addMessageChat,
    getMessagesChat
};
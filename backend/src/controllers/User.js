const User = require('../models/User')
const Login = async (req, res) => {
    try {
        console.log(req.body)
        const { id_user, name, image_url, email } = req.body;
        let user = await User.findOne({ id_user });
        if (!user) {
            user = new User({
                id_user,
                name,
                image_url,
                email,
            });
            await user.save();
        }
        console.log("Đăng nhập thành công tài khoản:", email);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUser = async (req, res) => {
    console.log(req.body);
    try {
        const id_user = req.body.id_user;
        if (!id_user) {
            return res.status(400).json({ message: "ID người dùng là bắt buộc" });
        }
        const user = await User.find({ id_user });
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        return res.status(200).json(user); // ✅ Chỉ gửi khi có user
    } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// API trừ turn đi 1
const decrementTurn = async (req, res) => {
    try {
        const id_user = req.body.id_user;
        if (!id_user) {
            return res.status(400).json({ message: "ID người dùng là bắt buộc" });
        }

        const user = await User.findOne({ id_user });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        if (typeof user.turn !== "number") {
            return res.status(400).json({ message: "Trường turn không hợp lệ" });
        }

        if (user.turn <= 0) {
            return res.status(400).json({ message: "Không đủ lượt để trừ" });
        }

        user.turn -= 1;
        await user.save();

        return res.status(200).json({ message: "Đã trừ lượt thành công", turn: user.turn });
    } catch (error) {
        console.error("Lỗi khi trừ lượt:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
module.exports = { Login, getUser,decrementTurn };
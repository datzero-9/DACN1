const Liked = require('../models/liked');

// GET liked items by user
const getLiked = async (req, res) => {
    try {
        const id_user = req.params.id_user;
        if (!id_user) {
            return res.status(400).json({ message: 'Thiếu id_user' });
        }

        const likedItems = await Liked.find({ id_user }).sort({ createdAt: -1 });

        res.status(200).json(likedItems);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách liked:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// ADD liked item
const addLiked = async (req, res) => {
    try {
        const { id_user, id_house, image, title, price, address } = req.body;

        if (!id_user || !id_house) {
            return res.status(400).json({ message: 'Thiếu thông tin id_user hoặc id_house' });
        }

        const existingLiked = await Liked.findOne({ id_user, id_house });
        if (existingLiked) {
            return res.json({ message: 'Bất động sản đã có trong danh sách yêu thích', status: false });
        }

        const newLiked = new Liked({ id_user, id_house, image, title, price, address });
        await newLiked.save();
        res.status(200).json({ message: `Đã thích: ${title}`, status: true });
    } catch (error) {
        console.log('Có lỗi:', error);
        res.status(500).json({ message: 'Lỗi server', status: false });
    }
};

// REMOVE liked item
const unLiked = async (req, res) => {
    try {
        const { id_user, id_house } = req.body;

        if (!id_user || !id_house) {
            return res.status(400).json({ message: 'Thiếu thông tin id_user hoặc id_house', status: false });
        }

        const existingLiked = await Liked.findOne({ id_user, id_house });
        if (!existingLiked) {
            return res.status(404).json({ message: 'Không tìm thấy trong danh sách yêu thích', status: false });
        }

        const result = await Liked.deleteOne({ id_user, id_house });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Đã xóa khỏi danh sách yêu thích', status: true });
        } else {
            res.status(500).json({ message: 'Xóa không thành công', status: false });
        }
    } catch (error) {
        console.error('Có lỗi:', error);
        res.status(500).json({ message: 'Lỗi server', status: false });
    }
};



module.exports = { getLiked, addLiked, unLiked };

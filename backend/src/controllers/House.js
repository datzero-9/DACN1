const express = require('express');

const House = require('../models/house');
const User = require('../models/User');
function removeVietnameseTones(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const createHouse = async (req, res) => {
  try {
    const {
      id_user,
      demand,
      category,
      land_area,
      price,
      price_unit,
      bedroom,
      bathroom,
      floor,
      list_images,
      address,
      title,
      description,
      phone_number
    } = req.body;

    // ✅ Validate dữ liệu đầy đủ
    if (
      !id_user ||
      !demand ||
      !category ||
      !land_area ||
      !price ||
      !price_unit ||
      bedroom === undefined ||
      bathroom === undefined ||
      floor === undefined ||
      !address ||
      !title ||
      !description ||
      !phone_number
    ) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }


    const title_normalized = removeVietnameseTones(title);


    const newHouse = new House({
      id_user,
      demand,
      category,
      land_area,
      price,
      price_unit,     // ✅ Thêm đơn vị giá
      bedroom,
      bathroom,
      floor,
      list_images,
      address,
      title,
      title_normalized,
      description,
      phone_number     // ✅ Thêm số điện thoại
    });

    await newHouse.save();
    res.status(201).json("Đăng bài thành công");
  } catch (err) {
    console.error("Lỗi tạo bài đăng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


const updateHouses = async (req, res) => {
  try {
    const houseId = req.params.id;
    const {
      demand,
      category,
      land_area,
      price,
      price_unit,
      bedroom,
      bathroom,
      floor,
      list_images,
      address,
      title,
      description,
      phone_number,
    } = req.body;

    // Validate bắt buộc
    if (
      !demand ||
      !category ||
      !land_area ||
      price === undefined ||
      !price_unit ||
      bedroom === undefined ||
      bathroom === undefined ||
      floor === undefined ||
      !address ||
      !title ||
      !description ||
      !phone_number
    ) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    const title_normalized = removeVietnameseTones(title);

    // Tìm và cập nhật
    const updatedHouse = await House.findByIdAndUpdate(
      houseId,
      {
        demand,
        category,
        land_area,
        price,
        price_unit,
        bedroom,
        bathroom,
        floor,
        list_images,
        address,
        title,
        title_normalized,
        description,
        phone_number,
      },
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    res.status(200).json({ message: 'Cập nhật thành công', data: updatedHouse });
  } catch (error) {
    console.error('Lỗi cập nhật bài viết:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};



const getHouse = async (req, res) => {
  try {
    const { title, price, demand, category, minPrice, maxPrice } = req.query;

    const filter = {};
    if (title) {
      const normalizedTitle = removeVietnameseTones(title);
      filter.title_normalized = { $regex: normalizedTitle, $options: "i" };
    }

    if (demand) {
      filter.demand = demand;
    }

    if (category) {
      filter.category = category;
    }

    if (price) {
      filter.price = Number(price);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const houses = await House.find(filter).sort({ createdAt: -1 });

    // ✅ Gắn thêm thông tin user
    const enrichedHouses = await Promise.all(
      houses.map(async (house) => {
        const user = await User.findOne({ id_user: house.id_user });
        return {
          ...house._doc,
          user,
        };
      })
    );

    res.status(200).json(enrichedHouses);
  } catch (err) {
    console.error("Lỗi lấy danh sách nhà:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


const itemHouse = async (req, res) => {
  console.log("Lấy thông tin house với id:", req.params.id);
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "Không tìm thấy nhà" });
    }
    res.status(200).json(house);
  } catch (error) {
    console.error("Lỗi lấy thông tin house:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getUserHouses = async (req, res) => {
  try {
    const userId = req.body.userId;  
    console.log("Lấy danh sách nhà cho user:", userId);
    const houses = await House.find({ id_user: userId }).sort({ createdAt: -1 });
    res.status(200).json(houses);
  } catch (error) {
    console.error("Lỗi lấy danh sách bài viết:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteHouse = async (req, res) => {
  try {
    const houseId = req.params.id;  // lấy id từ params URL
    console.log("Xóa house với id:", houseId);

    // Tìm và xóa house theo id
    const deletedHouse = await House.findByIdAndDelete(houseId);

    if (!deletedHouse) {
      return res.status(404).json({ message: "House không tồn tại" });
    }

    res.status(200).json({ message: "Xóa house thành công", house: deletedHouse });
  } catch (error) {
    console.error("Lỗi xóa house:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


module.exports = { createHouse, updateHouses, getHouse, itemHouse, getUserHouses, deleteHouse };



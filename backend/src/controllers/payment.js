const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const PaymentModel = require('../models/payment'); // đường dẫn đến file schema của bạn
const User = require('../models/User')
// POST thêm Payment mới
router.post('/payments', async (req, res) => {
    try {
        const { id_user, name, image_url, email, total_price, amount } = req.body;

        // Validate cơ bản
        if (!id_user || !total_price || !amount) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const newPayment = new PaymentModel({
            id_user,
            name,
            image_url,
            email,
            total_price,
            amount,
        });

        await newPayment.save();

        res.status(201).json({ message: 'Thêm payment thành công', data: newPayment });
    } catch (error) {
        console.error('Lỗi thêm payment:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;

const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

// const backend = 'http://localhost:80/api';
// const frontend = 'http://localhost:3000';

const ngrok = 'https://9053-2401-d800-580-617-719a-1305-2eaf-e671.ngrok-free.app'; // nếu bạn dùng ngrok cho callback

// API tạo đơn thanh toán ZaloPay
const Payment = async (req, res) => {
    console.log("Yêu cầu thanh toán ZaloPay:", req.body);
    try {

        const {
            id_user,
            name,
            image_url,
            email,
            total_price,  // tổng tiền thanh toán
            amount        // số lượt mua
        } = req.body.info;

        if (!id_user || !total_price || !amount) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        const embed_data = {
            redirecturl: `zalo.com`
        };

        const items = [{
            id_user,
            name,
            image_url,
            email,
            total_price,
            amount,
        }];

        const transID = Math.floor(Math.random() * 1000000);
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // mã đơn hàng duy nhất
            app_user: id_user,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: total_price,
            description: `Bất động sản DAT - Thanh toán cho đơn hàng #${transID}`,
            bank_code: "",
            callback_url: `${ngrok}/api/callback`
        };

        const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const result = await axios.post(config.endpoint, null, { params: order });

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Lỗi tạo đơn thanh toán ZaloPay:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


// API callback nhận thông báo thanh toán từ ZaloPay
const Callback = async (req, res) => {
    let result = {};
    try {
        const dataStr = req.body.data;
        const reqMac = req.body.mac;
        const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        // Kiểm tra callback hợp lệ
        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
            console.log("Callback không hợp lệ - MAC không đúng");
        } else {
            // Thanh toán thành công
            const dataJson = JSON.parse(dataStr);
            const parsedData = JSON.parse(dataJson.item);

            console.log("Thanh toán thành công:", parsedData[0]);

            // Xử lý tạo đơn hàng hoặc cập nhật trạng thái order ở đây
            // Dữ liệu bên Payment gửi là: id_user, total_price, amount, ...
            const checkout = {
                id_user: parsedData[0].id_user,
                name: parsedData[0].name,
                image_url: parsedData[0].image_url,
                email: parsedData[0].email,
                total_price: parsedData[0].total_price,
                amount: parsedData[0].amount,
            };

            try {
                await axios.post(`${ngrok}/api/checkout`, checkout)
                    .then((res) => {
                        console.log(res.data)
                    })
                console.log("Xử lý đơn hàng  thành công");
            } catch (error) {
                console.error("Lỗi xử lý đơn hàng sau thanh toán:", error);
            }

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        console.error("Lỗi callback ZaloPay:", ex);
        result.return_code = 0; // ZaloPay sẽ callback lại tối đa 3 lần nếu trả về 0
        result.return_message = ex.message;
    }

    return res.json(result);
};

const Checkout = async (req, res) => {
    try {
        const { id_user, name, image_url, email, total_price, amount } = req.body;

        if (!id_user || !total_price || !amount) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Tạo payment mới
        const newPayment = new PaymentModel({
            id_user,
            name,
            image_url,
            email,
            total_price,
            amount,
        });

        await newPayment.save();

        // Cập nhật turn trong User: cộng thêm amount vào turn hiện tại
        const user = await User.findOne({ id_user });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        user.turn = (user.turn || 0) + Number(amount);
        await user.save();

        axios.post(`https://n8n.laptrinhmang3.xyz/webhook/payment`, { req: email })

        return res.status(201).json({
            message: 'Thêm payment thành công và cập nhật lượt turn',
            payment: newPayment,
            user,
        });
    } catch (error) {
        console.error('Lỗi thêm payment và cập nhật turn:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    Payment,
    Callback,
    Checkout
};

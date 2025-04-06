import { ApiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import  Order  from "../models/order.model.js";
import paypal from "../paypal.js";




export const createOrder = asyncHandler(async (req, res) => {
    const { productId, quantity, totalPrice } = req.body;
    const create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            // return_url: 'http://localhost:3000/success',
            // cancel_url: 'http://localhost:3000/cancel'
            return_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        },
        transactions: [{
            item_list: {
                items: [{
                    name: 'Item Name',
                    sku: 'item',
                    price: '25.00',
                    currency: 'USD',
                    quantity: 1
                }]
            },
            amount: {
                currency: 'USD',
                total: '25.00'
            },
            description: 'Item description.'
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})

export const successOrder = asyncHandler(async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [{
            amount: {
                currency: 'USD',
                total: '25.00'
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log('Payment successful');
            res.send('Payment successful');
        }
    });
})


export const cancelOrder = asyncHandler(async (req, res) => {
    res.send('Payment cancelled');
})


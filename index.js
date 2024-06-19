const express = require('express');
const bodyParser = require('body-parser');
const Instamojo = require('instamojo-nodejs');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Instamojo API credentials
const INSTAMOJO_API_KEY = 'fdabc074c1e935fcb6f790e6087e6386';
const INSTAMOJO_AUTH_TOKEN = 'bb095fe0b847d2571098eb20d35004b9';

// Initialize Instamojo API
Instamojo.setKeys(INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); // Set to false for production

// Route to create a payment request
app.post('/create-payment-request', (req, res) => {
    console.log(JSON.stringify(req.body));
    const order = req.body;

    // Extract required fields from the order
    const amount = parseFloat(order.grand_total).toFixed(2);
    const purpose = 'Purchase of ' + order.items.map(item => item.product_name).join(', ');
    const buyer_name = order.billing_address.full_name;
    const email = order.customer_email;
    const phone = order.billing_address.telephone;

    if (!amount || !purpose || !email) {
        return res.status(400).json({ error: 'Amount, purpose, and email are required fields' });
    }

    const paymentData = new Instamojo.PaymentData();
    paymentData.setRedirectUrl('https://kraftpoint.in/api/instamojo/webhook');
    paymentData.setWebhook('https://kraftpoint.in/api/instamojo/webhook');
    paymentData.send_email = 'True';
    paymentData.purpose = purpose;
    paymentData.amount = amount;
    paymentData.buyer_name = buyer_name || '';
    paymentData.email = email;
    paymentData.phone = phone.length == 10 ? phone : '';

    Instamojo.createPayment(paymentData, (error, response) => {
        if (error) {
            console.log(error.message)
            return res.status(500).json({ error: 'Error creating payment request', details: error.message });
        }
        res.json(JSON.parse(response));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

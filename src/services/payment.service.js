// payment.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Logger = require('../utils/logger.util');

class PaymentService {
	async createPaymentIntent(amount) {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100, // Convert amount from dollars to cents
			currency: 'usd',
		});

		// Save the transaction record in the database
		await this.saveTransactionRecord(paymentIntent.id, amount);

		return {
			id: paymentIntent.id,
			client_secret: paymentIntent.client_secret,
		};
	}

	async saveTransactionRecord(paymentIntentId, amount) {
		// Your implementation to save the transaction record in the database
		console.log(
			`Saved transaction record for payment intent: ${paymentIntentId}, amount: ${amount}`,
		);
	}

	async processPayment(paymentIntentId) {
		try {
			const paymentIntent = await stripe.paymentIntents.retrieve(
				paymentIntentId,
			);
			if (paymentIntent.status === 'succeeded') {
				Logger.info(`Payment processed successfully: ${paymentIntentId}`);
				return true;
			}
			return false;
		} catch (error) {
			Logger.error('Error processing payment:', error);
			throw error;
		}
	}

	async createRefund(paymentIntentId, amount) {
		try {
			const refund = await stripe.refunds.create({
				payment_intent: paymentIntentId,
				amount: Math.round(amount * 100), // Convert to cents
			});
			Logger.info(`Refund created: ${refund.id}`);
			return refund;
		} catch (error) {
			Logger.error('Error creating refund:', error);
			throw error;
		}
	}
}

module.exports = new PaymentService();

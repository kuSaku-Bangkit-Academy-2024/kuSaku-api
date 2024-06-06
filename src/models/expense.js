const validator = require('validator');
const ClientError = require("../utils/clientError");

class Expense {
    constructor({ expenseId, describe, price, timestamp, category }) {
        this.expenseId = expenseId;
        this.describe = describe;
        this.price = price;
        this.timestamp = timestamp;
        this.category = category;
    }

    validate() {
        const requiredFields = ['expenseId', 'describe', 'price', 'timestamp', 'category'];
        for (let field of requiredFields) {
            if (!this[field]) {
                throw new ClientError(`${field} is required`, 400);
            }
        }

        const isValidCategory = value => ['Other', 'Food', 'Education',
                                    'Transportation', 'Household',
                                    'Social Life', 'Apparel', 'Health',
                                    'Entertainment'].includes(value);

        const isInvalid =
            !validator.isLength(this.expenseId, { max: 36 }) ||  // UUIDv4 is 36 characters long
            !validator.isLength(this.describe, { min: 5, max: 64 }) ||
            !validator.isInt(this.price.toString(), { min: 0 }) ||
            !(this.timestamp > 0) ||  // Check if timestamp is a positive integer
            !isValidCategory(this.category);

        if (isInvalid) {
            throw new ClientError(`Invalid Input`, 400);
        }
    }

    toFirestore() {
        return {
            timestamp: this.timestamp,
            expenseId: this.expenseId,
            describe: this.describe,
            price: parseInt(this.price, 10),
            category: this.category
        };
    }

    toInterface() {
        return {
            timestamp: this.timestamp,
            expenseId: this.expenseId,
            describe: this.describe,
            price: this.price,
            category: this.category
        };
    }
}

module.exports = Expense;

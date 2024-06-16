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
            !validator.isLength(this.expenseId, { max: 36 }) ||
            !validator.isLength(this.describe, { min: 5, max: 64 }) ||
            !validator.isInt(this.price.toString(), { min: 0 }) ||
            !(this.timestamp > 0) ||
            !isValidCategory(this.category);

        if (isInvalid) {
            throw new ClientError(`Invalid Input`, 400);
        }
    }

    epochToDateString() {
        const date = new Date(this.timestamp * 1000);
        date.setHours(date.getHours() - 7);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const dateString = year + '-' + month + '-' + day;
        return dateString;
    }

    toFirestore() {
        return {
            expenseId: this.expenseId,
            describe: this.describe,
            price: parseInt(this.price, 10),
            timestamp: this.timestamp,
            category: this.category
        };
    }

    toInterface() {
        return {
            expenseId: this.expenseId,
            describe: this.describe,
            price: this.price,
            timestamp: this.epochToDateString(),
            category: this.category
        };
    }
}

module.exports = Expense;

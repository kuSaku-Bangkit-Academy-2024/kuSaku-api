const ClientError = require("../utils/clientError");

class Expense {
  constructor({id, describe, amount, timestamp, category}) {
    this.id = id;
    this.describe = describe;
    this.amount = amount;
    this.timestamp = timestamp;
    this.category = category;
  }

  validate() {
    const requiredFields = ['id', 'describe', 'amount', 'timestamp', 'category'];
    for (let field of requiredFields) {
      if (!this[field]) {
        if(!this.category) {
            throw new ClientError(`Can't recognize the category of transaction`, 400);
        } else {
            throw new ClientError(`${field} is required`, 400);
        }
      }
    }
  }

  toFirestore() {
    return {
        id: this.id,
        describe: this.describe,
        amount: this.amount,
        timestamp: this.timestamp,
        category: this.category
    };
  }

  toInterface(){
    return {
        id: this.id,
        describe: this.describe,
        amount: this.amount,
        timestamp: this.timestamp,
        category: this.category
    };
  }
}

module.exports = Expense;
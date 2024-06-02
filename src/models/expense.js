const ClientError = require("../utils/clientError");

class Wallet {
  constructor({ id, salary, balance, expenses }) {
    this.id = id;
    this.salary = salary;
    this.balance = balance; 
    this.expenses = expenses;
  }

  toFirestore() {
    return {
      id: this.id,
      salary: this.salary,
      balance: this.balance,
      expenses: this.expenses
    };
  }

  toInterface() {
    return {
      id: this.id,
      salary: this.salary,
      balance: this.balance,
      expenses: this.expenses
    };
  }
}

class Expense extends Wallet {
  constructor({ id, describe, amount, price, timestamp, category }) {
    this.id = id;
    this.describe = describe;
    this.amount = amount;
    this.price = price;
    this.timestamp = timestamp;
    this.category = category;
  }

  validate() {
    const requiredFields = ['id', 'describe', 'amount', 'price', 'timestamp', 'category'];
    for (let field of requiredFields) {
      if (!this[field]) {
        if (!this.category) {
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
      price: this.price,
      amount: this.amount,
      timestamp: this.timestamp,
      category: this.category
    };
  }

  toInterface() {
    return {
      id: this.id,
      describe: this.describe,
      amount: this.amount,
      timestamp: this.timestamp,
      category: this.category
    };
  }
}

module.exports = { Wallet, Expense };

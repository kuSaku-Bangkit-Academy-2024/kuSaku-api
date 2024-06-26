const validator = require('validator')
const ClientError = require("../utils/clientError");

class User {
  constructor({id, email, name, password, age, sex, occupation, income, city, dependents, hobby}) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.age = age || 17;
    this.sex = sex || 'male';
    this.occupation = occupation || 'None';
    this.income = income;
    this.city = city || 'None';
    this.dependents = dependents || 1;
    this.hobby = hobby || 'None';
  }

  validate() {
    const requiredFields = ['email', 'password', 'name', 'age', 'sex', 'occupation', 'income', 'city', 'dependents'];
    for (let field of requiredFields) {
      if (!this[field]) {
        throw new ClientError(`${field} is required`, 400);
      }
    }
    
    const isInvalid = (this.sex !== 'male' && this.sex !== 'female') ||
      !validator.isEmail(this.email) ||
      !validator.isLength(this.password, { min: 5 }) ||
      !validator.isInt(this.age.toString(), { min: 17 }) || 
      !validator.isInt(this.income.toString(), { min: 0 }) ||
      !validator.isInt(this.dependents.toString(), { min: 0 }) 

    if (isInvalid){
      throw new ClientError(`Invalid Input`, 400);
    }
  }

  toFirestore() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      age: parseInt(this.age, 10),
      sex: this.sex,
      occupation: this.occupation,
      income: parseInt(this.income, 10),
      city: this.city,
      dependents: parseInt(this.dependents, 10),
      hobby: this.hobby
    };
  }

  toInterface(){
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      age: this.age,
      sex: this.sex,
      occupation: this.occupation,
      income: this.income,
      city: this.city,
      dependents: this.dependents,
      hobby: this.hobby
    };
  }
}

module.exports = User;
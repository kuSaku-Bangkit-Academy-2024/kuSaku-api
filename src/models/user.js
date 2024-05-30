const ClientError = require("../utils/clientError");

class User {
  constructor({id, email, name, password, age, sex, occupation, income, city, dependents, hobby}) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.age = age;
    this.sex = sex;
    this.occupation = occupation;
    this.income = income;
    this.city = city;
    this.dependents = dependents;
    this.hobby = hobby || 'None';
  }

  validate() {
    const requiredFields = ['email', 'password', 'name', 'age', 'sex', 'occupation', 'income', 'city', 'dependents'];
    for (let field of requiredFields) {
      if (!this[field]) {
        throw new ClientError(`${field} is required`, 400);
      }
    }

    // tambahin validasi lain
  }

  toFirestore() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      age: this.age,
      sex: this.sex,
      occupation: this.occupation,
      income: this.income,
      city: this.city,
      dependents: this.dependents,
      hobby: this.hobby
    };
  }

  toInterface(){
    return {
      id: this.id, // pake gak sih?
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
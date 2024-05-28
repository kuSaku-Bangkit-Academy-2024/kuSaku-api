class User {
  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User(doc.id, data.email, data.name);
  }

  toFirestore() {
    return {
      email: this.email,
      name: this.name,
    };
  }
}

module.exports = User;
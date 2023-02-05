class Abstract {
    constructor(name, description, price) {
        this.id = this.generateId();
        this.name = name;
        this.description = description;
        this.imageURL = null;
        this.price = price;
    }
}
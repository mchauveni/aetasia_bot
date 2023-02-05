const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs')

let itemDB = JSON.parse(fs.readFileSync('./data/items.json'));

class Item {

    constructor(name, description, price) {
        this.id = this.generateId();
        this.name = name;
        this.description = description;
        this.imageURL = null;
        this.price = price;
    }

    add() {
        console.log("Adding item : " + this.name + " (" + this.id + ")");
        itemDB.push(this);
        writeItemDB();
    }

    delete() {
        console.log("Deleting item : " + this.name + ' (' + this.id + ')');
        let index = itemDB.indexOf(this.id);
        itemDB.splice(index, 1);
        writeItemDB()
    }

    update() {
        itemDB = JSON.parse(fs.readFileSync('./data/items.json'));
        let index = null;
        for (let i = 0; i < itemDB.length; i++) {
            if (itemDB[i].id == this.id) {
                index = i;
                break;
            }
        }

        //If, for some reason, the shit isnt in the database
        if (index == null) {
            this.add();
        }

        itemDB.splice(index, 1, this);
        writeItemDB();
    }

    generateId() {
        return String(Date.now()).substring(9);
    }

    edit(name, desc, price, imgURL) {
        if (name != null) { this.name = name }
        if (desc != null) { this.desc = desc }
        if (price != null) { this.price = price }
        if (imgURL != null) { this.imageURL = imgURL }

        this.update();
    }

    fiche() {
        let embed = new MessageEmbed()
            .setColor('#2f3136')
            .setTitle(this.name)
            .addFields(
                { name: 'ID', value: '`' + this.id + '`', inline: true },
                { name: 'Prix', value: String(this.price), inline: true },
                { name: 'Description', value: this.description }
            )
        if (this.imageURL != null) {
            embed.setThumbnail(this.imageURL)
        }
        return embed;
    }

}


function writeItemDB() {
    fs.writeFileSync('./data/items.json', JSON.stringify(itemDB));
}

module.exports = Item;

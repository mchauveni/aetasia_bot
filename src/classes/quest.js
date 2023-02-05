const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs')

let questDB = JSON.parse(fs.readFileSync('./data/quests.json'));

class Quest {

    constructor(title) {
        this.id = this.generateId();
        this.rank = null;
        this.title = title;
        this.theGuyWhoAsked = null;
        this.goal = null;
        this.place = [];
        this.description = null;
        this.rewards = {
            money: 0,
            items: []
        }
    }

    generateId() {
        return String(Date.now()).substring(9);
    }

    setRank(rank) {
        this.rank = rank;
    }

    setTitle(title) {
        this.title = title;
    }

    setDescription(desc) {
        this.description = desc;
    }

    setTheGuyWhoAsked(theGuy) {
        this.theGuyWhoAsked = theGuy;
    }

    setGoal(goal) {
        this.goal = goal;
    }

    setRewards(rewards) {
        this.rewards = rewards;
    }

    addPlace(place) {
        if (place != null) {
            this.place.forEach(element => {
                if (place.id == element) { return }
            });

            this.place.push(place.id)
        };
    }

    add() {
        console.log("Adding quest : " + this.title + ' (' + this.id + ')');
        questDB.push(this);
        writeQuestDB();
    }

    delete() {
        console.log("Deleting quest : " + this.title + ' (' + this.id + ')');
        let index = questDB.indexOf(this.id);
        questDB.splice(index, 1);
        writeQuestDB();
    }

    update() {
        questDB = JSON.parse(fs.readFileSync('./data/quests.json'));
        let index = null;
        for (let i = 0; i < questDB.length; i++) {
            if (questDB[i].id == this.id) {
                index = i;
                break;
            }
        }

        //If, for some reason, the character isnt in the database
        if (index == null) {
            this.add();
        }

        questDB.splice(index, 1, this);
        writeQuestDB();
    }

    edit(rang, objectif, commanditaire, lieu, description) {
        if (rang != null) { this.setRank(rang) }
        if (objectif != null) { this.setGoal(objectif) }
        if (commanditaire != null) { this.setTheGuyWhoAsked(commanditaire) }
        if (lieu != null) { this.addPlace(lieu) }
        if (description != null) { this.setDescription(description) }

        this.update();
    }

    fiche() {
        let embed = new MessageEmbed()
            .setColor('#2f3136')
            .setTitle(this.title)
            .setThumbnail('https://media.discordapp.net/attachments/591303930802339840/958071510382309376/unknown.png')
            .addField('ID', '`' + this.id + '`', true)

        if (this.theGuyWhoAsked != null) { embed.addField('Commanditaire', this.theGuyWhoAsked, true) }
        if (this.place[0] != null) { embed.addField('Lieu', '<#' + this.place[0] + ">", true) }
        if (this.goal != null) { embed.addField('Objectif', this.goal) }
        if (this.description != null) { embed.addField('Description', this.description) }
        if (this.rewards.money != null) { embed.addField('Récompenses', String(this.rewards.money)) }
        return embed;
    }
}

function writeQuestDB() {
    fs.writeFileSync('./data/quests.json', JSON.stringify(questDB));
}

module.exports = Quest;
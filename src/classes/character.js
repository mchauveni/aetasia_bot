const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs')

let characterDB = JSON.parse(fs.readFileSync('./data/character.json'));
const races = JSON.parse(fs.readFileSync('./data/races.json'));

class Character {

    constructor(userId, name, race) {
        this.id = this.generateId();
        this.userId = userId;
        this.name = name;
        this.race = race;
        this.exp = 1;
        this.lvl = 1;
        this.money = 0;
        this.rank = 'D';
        this.inventory = [];
        this.statPointLeft = 0;
        this.stats = [
            {
                name: "PV",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
            {
                name: "PM",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
            {
                name: "FOR",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
            {
                name: "AGI",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
            {
                name: "END",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
            {
                name: "VIT",
                baseStat: 0,
                invested: 0,
                value: 0,
            },
        ];
    }


    /**
     * Adds character to DB
     */
    add() {
        console.log("Adding character : " + this.name + " (" + this.id + ")");
        characterDB.push(this);
        writeCharacDB();
    }

    delete() {
        console.log("Deleting character : " + this.name + ' (' + this.id + ')');
        let index = characterDB.indexOf(this.id);
        characterDB.splice(index, 1);
        writeCharacDB()
    }

    update() {
        characterDB = JSON.parse(fs.readFileSync('./data/character.json'));
        let index = null;
        for (let i = 0; i < characterDB.length; i++) {
            if (characterDB[i].id == this.id) {
                index = i;
                break;
            }
        }

        //If, for some reason, the character isnt in the database
        if (index == null) {
            this.add();
        }

        characterDB.splice(index, 1, this);
        writeCharacDB();
    }

    /**
     * Adds competence points to a character
     *
     * @param {int} nb Number of points to add
     */
    addCompetencePoint(nb) {
        if (nb == null) {
            nb = 1;
        }
        this.statPointLeft = this.statPointLeft + nb;
        this.calcAllStats();
    }

    /**
     * Adds competence points to a character
     * @param {int} nb Number of points to add
     */
    addMoney(nb) {
        if (nb == null) {
            nb = 1;
        }
        this.money = this.money + nb;
        this.update();
    }

    /**
     * Adds competence points to a character
     * @param {int} nb Number of points to add
     */
    addExp(nb) {
        if (nb == null) {
            nb = 1;
        }
        if (this.exp + nb > 1000000) {
            nb = 1000000 - this.exp;
        }
        this.exp = this.exp + nb;
        this.calcLvl();
    }

    /**
     * Calculates the level of a character given its XP
     */
    calcLvl() {
        let currentLvL = Math.round(Math.cbrt(this.exp));
        if (currentLvL > this.lvl) {
            this.lvlUp(currentLvL - this.lvl);
        }
    }

    /**
     * Gain a level. Adds competence points.
     * 
     * @param {int} nb Number of level gained
     */
    lvlUp(nb) {
        this.lvl += nb;
        for (let i = 0; i < nb; i++) {
            if ((this.lvl - nb) % 10 == 0 && this.lvl - nb != 0) {
                this.addCompetencePoint(10);
            } else {
                this.addCompetencePoint(5);
            }
        }
        this.calcAllStats();
    }

    /**
     * Upgrade a stat of a character, while removing a statPoint
     * 
     * @param {String} competence Name of the stat
     * @returns 
     */
    upgradeCompetence(competence) {
        if (this.statPointLeft == 0) { return; }
        this.statPointLeft--;
        this.stats[this.statIndex(competence)].invested++;
        this.calcAllStats();
    }

    /**
     * Sets the value of all the stats of a character.
     */
    calcAllStats() {
        let characRace = this.searchRace(this.race);
        this.stats[0].value = Math.round(((characRace.pv + this.stats[0].baseStat) * this.lvl / 50) + 10);
        this.stats[1].value = Math.round(((characRace.pm + this.stats[1].baseStat) * this.lvl / 50) + 10);
        this.stats[2].value = Math.round((this.stats[2].baseStat + this.stats[2].invested) * (Math.floor(characRace.for * 1.25) / 100));
        this.stats[3].value = Math.round((this.stats[3].baseStat + this.stats[3].invested) * (Math.floor(characRace.agi * 1.25) / 100));
        this.stats[4].value = Math.round((this.stats[4].baseStat + this.stats[4].invested) * (Math.floor(characRace.end * 1.25) / 100));
        this.stats[5].value = Math.round((this.stats[5].baseStat + this.stats[5].invested) * (Math.floor(characRace.vit * 1.25) / 100));
        this.update();
    }

    /**
     * Set base stats for a character.
     * 
     * @param {int} pv 
     * @param {int} pm 
     * @param {int} force 
     * @param {int} agilite 
     * @param {int} endurance 
     * @param {int} vitesse 
     */
    setBaseStats(pv, pm, force, agilite, endurance, vitesse) {
        if (pv != null) { this.stats[0].baseStat = pv };
        if (pm != null) { this.stats[1].baseStat = pm };
        if (force != null) { this.stats[2].baseStat = force };
        if (agilite != null) { this.stats[3].baseStat = agilite };
        if (endurance != null) { this.stats[4].baseStat = endurance };
        if (vitesse != null) { this.stats[5].baseStat = vitesse };
        this.calcAllStats();
    }

    /**
     * Makes a roll for a stat
     * 
     * @param {String} stat Name of the stat
     * @returns Random number between stat.value/2 & stat.value
     */
    roll(stat) {
        return Math.floor(Math.random() * (this.stats[this.statIndex(stat)].value - Math.round(this.stats[this.statIndex(stat)].value / 2) + 1)) + Math.round(this.stats[this.statIndex(stat)].value / 2)
    }

    /**
     * Generates an ID
     * @returns 
     */
    generateId() {
        return String(Date.now()).substring(7);
    }

    /**
     * Finds a race in the database
     * 
     * @param {String} name name of the race lol fck me
     * @returns ``Race object`` the race corresponding to the id
     */
    searchRace(name) {
        let found = null;
        races.forEach(race => {
            if (race.name == name.toUpperCase()) {
                found = race;
            }
        });
        return found;
    }

    /**
     * Finds the index of a stat given its name
     * 
     * @param {String} name Name of the stat
     * @returns index of the stat
     */
    statIndex(name) {
        let index = null;
        switch (name.toUpperCase()) {
            case 'PV':
            case 'POINT DE VIE':
                index = 0
                break;
            case 'PM':
            case 'MP':
            case 'POINT DE MAGIE':
                index = 1;
                break;
            case 'FOR':
            case 'FORCE':
                index = 2;
                break;

            case 'AGILITE':
            case 'AGILITÉ':
            case 'AGI':
                index = 3;
                break;
            case 'ENDURANCE':
            case 'END':
                index = 4;
                break;
            case 'VITESSE':
            case 'VIT':
                index = 5;
                break;
        }
        return index;
    }

    /**
     * The template for a character sheet.
     * 
     * @param {User} user The guy who asked
     * @returns ``Discord.RichEmbed``
     */
    fiche() {
        this.calcAllStats();
        this.calcLvl();
        return new MessageEmbed()
            .setColor('#2f3136')
            .setTitle(this.name)
            .setThumbnail('https://media.discordapp.net/attachments/591303930802339840/958071510382309376/unknown.png')
            .addFields(
                { name: 'ID', value: "`" + this.id + "`", inline: true },
                { name: 'Race', value: this.race, inline: true },

                { name: 'Point de compétence', value: String(this.statPointLeft) },

                { name: 'EXP', value: String(this.exp), inline: true },
                { name: 'LVL', value: String(this.lvl), inline: true },
                { name: 'Argent', value: String(this.money), inline: true },

                { name: 'Point de Vie', value: String(this.stats[0].value), inline: true },
                { name: 'Point de Magie', value: String(this.stats[1].value), inline: true },
                { name: '\u200B', value: '\u200B', inline: true },

                { name: 'Force', value: String(this.stats[2].value), inline: true },
                { name: 'Agilité', value: String(this.stats[3].value), inline: true },
                { name: '\u200B', value: '\u200B', inline: true },

                { name: 'Endurance', value: String(this.stats[4].value), inline: true },
                { name: 'Vitesse', value: String(this.stats[5].value), inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
            )
    }

    /**
     * Sends a list of buttons to upgrade stats
     * 
     * @param {int} style Int of the style
     * @returns ``MessageActionRow`` with 4 buttons
     */
    competenceButtonRow(style) {
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('stats_for_' + this.id)
                    .setLabel('Force')
                    .setStyle(style),
                new MessageButton()
                    .setCustomId('stats_agi_' + this.id)
                    .setLabel('Agilité')
                    .setStyle(style),
                new MessageButton()
                    .setCustomId('stats_end_' + this.id)
                    .setLabel('Endurance')
                    .setStyle(style),
                new MessageButton()
                    .setCustomId('stats_vit_' + this.id)
                    .setLabel('Vitesse')
                    .setStyle(style)
            );
    }

    /**
     * Sends 2 buttons to validate or cancel the deletion of a charac
     * 
     * @returns ``MessageActionRow`` with 2 buttons
     */
    deleteButtonRow() {
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('del_valid_' + this.id)
                    .setLabel('Valider')
                    .setStyle(3),
                new MessageButton()
                    .setCustomId('del_cancel_' + this.id)
                    .setLabel('Annuler')
                    .setStyle(4)
            );
    }

    /**
     * Sends a button that copy the ID if a character to the clipboard
     * 
     * @returns ``MessageActionRow`` with 1 button
     */
    copyIdButton() {
        return new MessageButton()
            .setCustomId('copy_' + this.id)
            .setLabel(this.name)
            .setStyle(1)
            .setEmoji("📋")
    }
}

class Stat {
    constructor(name) { }
}

function writeCharacDB() {
    fs.writeFileSync('./data/character.json', JSON.stringify(characterDB));
}

module.exports = Character;
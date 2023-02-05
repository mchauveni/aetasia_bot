const { Client, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
var ncp = require("copy-paste");
const Character = require('./classes/character');
const Quest = require('./classes/quest');
const Item = require('./classes/item');

const { token } = require('./config.json');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });

let characterDB = JSON.parse(fs.readFileSync('./data/character.json'));
let questDB = JSON.parse(fs.readFileSync('./data/quests.json'));
let itemDB = JSON.parse(fs.readFileSync('./data/items.json'));
const idRoleModo = "957360560318611456";
const idRoleAdmin = "816666498662662165";

/* When the client is ready */
client.on('ready', async () => {
    //convertDBArraysToObjects(); // Because the DB is an array of object and not an array of Characters
    console.log(`Logged in !`);
    client.user.setActivity("Aetesia", { type: "PLAYING" })
});

/* WHEN A SLASH COMMAND IS USED (i may change all this shit tho) */
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    let charac = null;

    switch (commandName) {
        /*
         * ================================================================================================================================
         * COMMANDES DES JOUEURS
         * ================================================================================================================================
         */
        case 'fiche':
            charac = searchCharacter(options.getString('id'));
            if (charac == null) {
                await interaction.reply({ content: 'L\'ID fournit est incorrect !', ephemeral: true })
            } else {
                let characOwner = await client.users.fetch(charac.userId);
                let btnRow = new MessageActionRow()
                    .addComponents(charac.copyIdButton())
                await interaction.reply({ content: '\u200B', embeds: [charac.fiche().setAuthor({ name: characOwner.username, iconURL: characOwner.avatarURL() })], components: [btnRow] });
            }
            break;

        case 'liste':
            let user = null;
            if (options.getUser('joueur') == null) {
                user = interaction.user;
            } else {
                user = options.getUser('joueur');
            }
            let list = searchPlayersCharacters(user.id);

            let msg = 'Les personnage de ' + user.username + ' sont :\n';
            let btnRow = new MessageActionRow();
            let msgEmbed = new MessageEmbed()
                .setColor('#000000')
                .setTimestamp()
                .setFooter({ text: user.username, iconURL: user.avatarURL() });

            list.forEach(charac => {
                btnRow.addComponents(charac.copyIdButton());
                msgEmbed.addField(charac.name, '`' + charac.id + '`');
            });

            await interaction.reply({ content: msg, embeds: [msgEmbed], components: [btnRow] });
            break;

        case 'stats':
            charac = searchCharacter(options.getString('id'));
            await interaction.reply({ content: 'Modifier les stats de ' + charac.name + ' (`' + charac.id + '`).\nPoints restants : ' + charac.statPointLeft, components: [charac.competenceButtonRow(3)] })
            break;

        case 'roll':
            let result = searchCharacter(options.getString('id')).roll(options.getString('stat'));
            await interaction.reply("Résultat : **" + result + "** !")
            break;

        /* 
         * ================================================================================================================================
         * COMMANDES DES MODOS
         * ================================================================================================================================
         */
        case 'perso':
            // Checks if is a mod
            if (!interaction.member.roles.cache.some(role => role.id == idRoleModo)) { return await interaction.reply({ content: "⚠️ Vous devez être modérateur pour utiliser cette commande !", ephemeral: true }) }

            switch (interaction.options.getSubcommand()) {
                case 'ajouter':
                    if (searchPlayersCharacters(options.getUser('joueur').id).length >= 3) {
                        return await interaction.reply({ content: '⚠️ Le joueur ciblé possède déjà 3 personnages ou plus !', ephemeral: true })
                    };
                    switch (options.getString('race').toUpperCase()) {
                        case 'HUMAIN':
                        case 'NAIN':
                        case 'ELFE':
                        case 'HYBRIDE':
                        case 'VAMPIRE':
                        case 'TIEFFELIN':
                        case 'GNOME':
                        case 'ORQUE':
                        case 'PLANTE':
                        case 'FLEUR':
                        case 'ARBRE':
                            let newCharac = new Character(options.getUser('joueur').id, options.getString('nom'), options.getString('race').charAt(0).toUpperCase() + options.getString('race').slice(1).toLowerCase());
                            newCharac.add();
                            await interaction.reply('Le personnage ' + newCharac.name + ' (`' + newCharac.id + '`) a été ajouté à la base de donnée.')
                            break;
                        default:
                            await interaction.reply({ content: "⚠️ La race fournie n'est pas valide", ephemeral: true });
                            break;
                    }
                    break;

                case 'supprimer':
                    charac = searchCharacter(options.getString('id'));
                    if (charac == null) { return await interaction.reply({ content: "⚠️ L'ID fournit est incorrect", ephemeral: true }) }
                    await interaction.reply({ content: "Voulez vous **vraiment** supprimer " + charac.name + " ?", components: [charac.deleteButtonRow()] })
                    break;

                case 'argent':
                    charac = searchCharacter(options.getString('id'));
                    charac.addMoney(options.getInteger('nombre'));
                    await interaction.reply({ content: 'Argent ajouté(s) !', embeds: [charac.fiche()] })
                    break;

                case 'point_de_compétence':
                    charac = searchCharacter(options.getString('id'));
                    if (charac == null) { return await interaction.reply({ content: "⚠️ L'ID fournit est incorrect", ephemeral: true }) }
                    charac.addCompetencePoint(options.getInteger('nombre'));
                    await interaction.reply({ content: 'Point(s) de compétence ajouté(s) !', embeds: [charac.fiche()] })
                    break;

                case 'exp':
                    charac = searchCharacter(options.getString('id'));
                    charac.addExp(options.getInteger('nombre'));
                    await interaction.reply({ content: 'Point d\'XP ajouté(s) !', embeds: [charac.fiche()] })
                    break;

                case 'stat_de_base':
                    if (options.getInteger('pv') + options.getInteger('pm') != 50 || options.getInteger('for') + options.getInteger('agi') + options.getInteger('end') + options.getInteger('vit') != 15) {
                        return await interaction.reply({ content: '⚠️ Les valeurs attribuées pour les stats ne sont pas correctes !', ephemeral: true })
                    }
                    searchCharacter(options.getString('id')).setBaseStats(options.getInteger('pv'), options.getInteger('pm'), options.getInteger('for'), options.getInteger('agi'), options.getInteger('end'), options.getInteger('vit'))
                    await interaction.reply({ content: "Stat de base mise à jour !", embeds: [searchCharacter(options.getString('id')).fiche()] })
                    break;
            }
            break;

        case 'item':
            let item = null;
            if (!interaction.member.roles.cache.some(role => role.id == idRoleModo)) { return await interaction.reply({ content: "⚠️ Vous devez être modérateur pour utiliser cette commande !", ephemeral: true }) }

            switch (interaction.options.getSubcommand()) {
                case 'ajouter':
                    let newItem = new Item(options.getString('nom'), options.getString('description'), options.getInteger('prix'));
                    newItem.add();
                    await interaction.reply({ content: 'L\'item a été ajoutée !', embeds: [newItem.fiche()] })
                    break;

                case 'modifier':
                    item = searchItem(options.getString('id'));
                    if (item == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    item.edit(options.getString('nom'), options.getString('description'), options.getInteger('prix'), options.getString('image'));

                    await interaction.reply({ content: 'L\'item a été modifiée !', embeds: [item.fiche()] })
                    break;

                case 'supprimer':
                    item = searchItem(options.getString('id'));
                    if (item == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    await interaction.reply('La quête **' + item.title + '** (`' + item.id + '`) a été supprimée !')
                    item.delete();
                    break;

                case 'infos':
                    item = searchItem(options.getString('id'));
                    if (item == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    await interaction.reply({ content: 'Informations sur l\'item :', embeds: [item.fiche()] })
                    break;
            }
            break;

        /*
         * ================================================================================================================================
         * COMMANDES DES ADMINS
         * ================================================================================================================================
         */
        case 'quete':
            let quest = null;
            if (!interaction.member.roles.cache.some(role => role.id == idRoleAdmin)) { return await interaction.reply({ content: "⚠️ Vous devez être administrateur pour utiliser cette commande !", ephemeral: true }) }
            if (!interaction.member.roles.cache.some(role => role.id == idRoleModo)) { return await interaction.reply({ content: "⚠️ Vous devez être modérateur pour utiliser cette commande !", ephemeral: true }) }

            switch (interaction.options.getSubcommand()) {
                case 'ajouter':
                    let newQuest = new Quest(options.getString('nom'));
                    newQuest.setRank(options.getString('rang'))
                    newQuest.setGoal(options.getString('objectif'))
                    newQuest.setTheGuyWhoAsked(options.getString('commanditaire'))
                    newQuest.addPlace(options.getChannel('lieu'))
                    newQuest.setDescription(options.getString('description'));
                    newQuest.add();
                    await interaction.reply({ content: 'La quête a été ajoutée !', embeds: [newQuest.fiche()] })
                    break;

                case 'modifier':
                    quest = searchQuest(options.getString('id'));
                    if (quest == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    quest.edit(options.getString('rang'), options.getString('objectif'), options.getString('commanditaire'), options.getChannel('lieu'), options.getString('description'));

                    await interaction.reply({ content: 'La quête a été modifiée !', embeds: [quest.fiche()] })
                    break;

                case 'supprimer':
                    quest = searchQuest(options.getString('id'));
                    if (quest == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    await interaction.reply('La quête **' + quest.title + '** (`' + quest.id + '`) a été supprimée !')
                    quest.delete();
                    break;

                case 'infos':
                    quest = searchQuest(options.getString('id'));
                    if (quest == null) { return await interaction.reply({ content: '⚠️ ID incorrect !', ephemeral: true }) }
                    await interaction.reply({ content: 'Informations sur **' + quest.title + '** :', embeds: [quest.fiche()] })
                    break;

                case 'liste':
                    let msg = 'Toutes les quêtes sont :';
                    let msgEmbed = new MessageEmbed()
                        .setColor('#000000')
                        .setTimestamp()
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() });
                    questDB.forEach(element => {
                        msgEmbed.addField(element.title, '`' + element.id + '`');
                    });
                    await interaction.reply({ content: msg, embeds: [msgEmbed] });
                    break;
            }
            break;
    }
});

/* WHEN THEY CLICK A BUTTON */
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    let buttonInfos = interaction.customId.split('_'); // eg : "stats_for_1648332385542" or "del_cancel_1648332385542"
    let charac = null;

    switch (buttonInfos[0]) {
        case 'stats':
            charac = searchCharacter(buttonInfos[2]);
            if (charac == null) { return; }
            if (charac.userId != interaction.user.id) { return await interaction.reply({ content: 'Ce n\'est pas ton perso !', ephemeral: true }) }

            await interaction.deferUpdate();
            await new Promise(resolve => setTimeout(resolve, 500));

            charac.upgradeCompetence(buttonInfos[1]);
            let msg = 'Modifier les stats de ' + charac.name + ' (`' + charac.id + '`).\nPoints restants : ' + charac.statPointLeft;
            await interaction.editReply({ content: msg, components: [charac.competenceButtonRow(3)] });
            break;

        case 'del':
            charac = searchCharacter(buttonInfos[2]);
            if (charac == null) { return; }

            await interaction.deferUpdate();
            await new Promise(resolve => setTimeout(resolve, 500));

            if (buttonInfos[1] == "valid") {
                await interaction.editReply({ content: charac.name + " a été supprimé !", components: [] })
                charac.delete();
            } else {
                await interaction.editReply({ content: charac.name + " est sain est sauf alors !", components: [] })
            }
            break;

        case 'copy':
            charac = searchCharacter(buttonInfos[1]);
            if (charac == null) { return; }

            await interaction.deferUpdate();
            await new Promise(resolve => setTimeout(resolve, 500));

            ncp.copy(charac.id);
            break;
    }
})

/**
 * Finds a character in the database
 * 
 * @param {String} id id of a Character
 * @returns ``Character object`` the character corresponding to the id
 */
function searchCharacter(id) {
    characterDB = JSON.parse(fs.readFileSync('./data/character.json'));
    let found = null;
    characterDB.forEach(element => {
        if (element.id == id) {
            found = element;
        }
    });
    found = Object.assign(new Character(), found);
    return found;
}

/**
 * Finds a quest in the database
 * 
 * @param {String} id id of a Quest
 * @returns ``Quest object`` the quest corresponding to the id
 */
function searchQuest(id) {
    questDB = JSON.parse(fs.readFileSync('./data/quests.json'));
    let found = null;
    questDB.forEach(element => {
        if (element.id == id) {
            found = element;
        }
    });
    found = Object.assign(new Quest(), found);
    return found;
}

function searchItem(id) {
    itemDB = JSON.parse(fs.readFileSync('./data/items.json'));
    let found = null;
    itemDB.forEach(element => {
        if (element.id == id) {
            found = element;
        }
    });
    found = Object.assign(new Item(), found);
    return found;
}

/**
 * Search all the characters a player owns
 * 
 * @param {userId} userId ID of a discord user
 * @returns Array of ``Character Object``
 */
function searchPlayersCharacters(userId) {
    characterDB = JSON.parse(fs.readFileSync('./data/character.json'));
    let found = [];
    characterDB.forEach(element => {
        if (element.userId == userId) {
            found.push(element);
        }
    });

    for (let i = 0; i < found.length; i++) {
        found[i] = Object.assign(new Character(), found[i]);
    }
    return found;
}

client.login(token);
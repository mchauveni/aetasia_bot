const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [

    /* BORDEL POUR JOUEURS ================================================================================================================================ */
    new SlashCommandBuilder()
        .setName('fiche')
        .setDescription('Voir sa fiche de perso')
        .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true)),

    new SlashCommandBuilder()
        .setName('liste')
        .setDescription('Affiche la liste des IDs de personnages lié au joueur')
        .addUserOption(option => option.setName('joueur').setDescription('Joueur dont il faut afficher la liste')),

    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Pour utiliser des points de compétence')
        .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true)),

    new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Faire un jet de dé')
        .addStringOption(option => option.setName('id').setDescription('ID du personnage').setRequired(true))
        .addStringOption(option => option.setName('stat').setDescription('La stat pour laquelle roll').setRequired(true)),

    /* PERSO ================================================================================================================================ */
    new SlashCommandBuilder()
        .setName('perso')
        .setDescription('Toutes les commandes liées aux personnages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajoute un personnage')
                .addUserOption(option => option.setName('joueur').setDescription('Le joueur auquel est lié le personnage').setRequired(true))
                .addStringOption(option => option.setName('nom').setDescription('Le nom complet du personnage').setRequired(true))
                .addStringOption(option => option.setName('race').setDescription('La race du personnage').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('supprimer')
                .setDescription('Supprime un personnage')
                .addStringOption(option => option.setName('id').setDescription('ID du personnage').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('argent')
                .setDescription('Ajoute de l\'argent à un perso')
                .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true))
                .addIntegerOption(option => option.setName('nombre').setDescription('Nombre d\'argent à ajouter (default : 1)')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('point_de_compétence')
                .setDescription('Ajoute un point de compétence')
                .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true))
                .addIntegerOption(option => option.setName('nombre').setDescription('Nombre de point de compétence à ajouter (default : 1)')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('exp')
                .setDescription('Ajoute des points d\'XP.')
                .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true))
                .addIntegerOption(option => option.setName('nombre').setDescription('Nombre d\'XP à ajouter (default : 1)')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('stat_de_base')
                .setDescription('Définit les stats de base (affichées sur la fiche)')
                .addStringOption(option => option.setName('id').setDescription('L\'ID du personnage').setRequired(true))
                .addIntegerOption(option => option.setName('pv').setDescription('Point de vie'))
                .addIntegerOption(option => option.setName('pm').setDescription('Point de mavie'))
                .addIntegerOption(option => option.setName('for').setDescription('Force'))
                .addIntegerOption(option => option.setName('agi').setDescription('Agilité'))
                .addIntegerOption(option => option.setName('end').setDescription('Endurance'))
                .addIntegerOption(option => option.setName('vit').setDescription('Vitesse'))),

    /* ITEMS ================================================================================================================================ */
    new SlashCommandBuilder()
        .setName('item')
        .setDescription('Toutes les commandes liées aux items')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajoute un item')
                .addStringOption(option => option.setName('nom').setDescription('Nom de l\'item').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Description de l\'item').setRequired(true))
                .addIntegerOption(option => option.setName('prix').setDescription('Prix de l\'item').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('modifier')
                .setDescription('Modifier un item')
                .addStringOption(option => option.setName('id').setDescription('ID de l\'item').setRequired(true))
                .addStringOption(option => option.setName('nom').setDescription('Nom de l\'item'))
                .addStringOption(option => option.setName('description').setDescription('Description de l\'item'))
                .addIntegerOption(option => option.setName('prix').setDescription('Prix de l\'item'))
                .addStringOption(option => option.setName('image').setDescription('URL de l\'image')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('supprimer')
                .setDescription('Supprime un item')
                .addStringOption(option => option.setName('id').setDescription('ID de l\'item').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('infos')
                .setDescription('Donne les infos d\'un item')
                .addStringOption(option => option.setName('id').setDescription('ID de l\'item').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Affiche la liste de tous les items')),

    /* QUETES ================================================================================================================================ */
    new SlashCommandBuilder()
        .setName('quete')
        .setDescription('Toutes les commandes liées aux quêtes')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajoute une quête')
                .addStringOption(option => option.setName('nom').setDescription('Nom de la quête').setRequired(true))
                .addStringOption(option => option.setName('rang').setDescription('Rang de la quête'))
                .addStringOption(option => option.setName('commanditaire').setDescription('Commanditaire de la quête'))
                .addStringOption(option => option.setName('objectif').setDescription('Objectif de la quête'))
                .addChannelOption(option => option.setName('lieu').setDescription('Lieu de la quête'))
                .addStringOption(option => option.setName('description').setDescription('Description de la quête')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('modifier')
                .setDescription('Modifier une quête')
                .addStringOption(option => option.setName('id').setDescription('ID de la quête').setRequired(true))
                .addStringOption(option => option.setName('rang').setDescription('Rang de la quête'))
                .addStringOption(option => option.setName('commanditaire').setDescription('Commanditaire de la quête'))
                .addStringOption(option => option.setName('objectif').setDescription('Objectif de la quête'))
                .addChannelOption(option => option.setName('lieu').setDescription('Lieu de la quête'))
                .addStringOption(option => option.setName('description').setDescription('Description de la quête')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('supprimer')
                .setDescription('Supprime une quête')
                .addStringOption(option => option.setName('id').setDescription('ID de la quête').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('infos')
                .setDescription('Donne les infos d\'une quête')
                .addStringOption(option => option.setName('id').setDescription('ID de la quête').setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Affiche la liste de toutes les quêtes'))
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
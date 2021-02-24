require('dotenv').config();
var Discord = require('discord.js');
var logger = require('winston');
const axios = require('axios');

var token = process.env.token;
var serverName = process.env.serverName;
var prefix = '!';

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = 'debug';

var bot = new Discord.Client();
bot.once('ready', function (evt) {
  logger.info('Connected!');
});

bot.login(token);

bot.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'help':
      message.channel.send('**Stats** \n !stats');
      break;

    case 'stats':
      const query = args[0];
      const uri = `https://api.battlemetrics.com/servers?filter[search]="${serverName}"`;
      console.log(uri);

      const resp = await axios.get(uri);
      var json = JSON.parse(JSON.stringify(resp.data));
      if (resp.status != 200) {
        message.reply(
          'An error occurred while trying to make the API request!'
        );
      } else {
        console.log('resp data:', json);
        message.channel.send('**Server Stats for  ' + serverName + '**:');
        json.data.map((data) => {
          message.channel.send(
            `Server ID: ${data.id}
            Game: ${data.relationships.game.data.id}
            Server IP: ${data.attributes.ip}
            Players: ${data.attributes.player}
            Server Rank: ${data.attributes.rank}`
          );
        });
      }
      break;

    default:
      message.channel.send('Command: ' + command + ' not found');
  }
});

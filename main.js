require('dotenv').config()
var Discord = require('discord.js');
var unirest = require('unirest');
var logger = require('winston');

var token = process.env.token;
var serverId = process.env.serverId;
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

bot.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'help':
      message.channel.send('**Stats** \n !stats');
      break;

    case 'stats':
      var query = args[0];
      console.log(
        'https://api.battlemetrics.com/servers?filter[search]="' +
          process.env.serverName +
          '"'
      );
      unirest
        .get(
          'https://api.battlemetrics.com/servers?filter[search]="' +
            process.env.serverName +
            '"'
        )
        .end(function (result) {
          var json = JSON.parse(JSON.stringify(result.body));
          if (result.status != 200) {
            message.reply(
              'An error occurred while trying to make the API request!'
            );
          } else {
            console.log(json);
            var i = 1;
            message.channel.send(
              '**Server Stats for  ' + process.env.serverName + '**:'
            );
            json.data.map((data) => {
              message.channel.send(
                '**Server #' +
                  i +
                  '**:' +
                  '\n' +
                  '\tServer Name: ' +
                  data.attributes.name +
                  '\n' +
                  '\tServer ID: ' +
                  data.id +
                  '\n' +
                  '\tGame: ' +
                  data.relationships.game.data.id +
                  '\n' +
                  '\tServer IP: ' +
                  data.attributes.ip +
                  '\n' +
                  '\tPlayers: ' +
                  data.attributes.players +
                  '\n' +
                  '\tMax Players: ' +
                  data.attributes.maxPlayers +
                  '\n' +
                  '\tServer Rank: ' +
                  data.attributes.rank
              );
              i = i + 1;
            });
          }
        });
      break;

    default:
      message.channel.send('Command: ' + command + ' not found');
  }
});

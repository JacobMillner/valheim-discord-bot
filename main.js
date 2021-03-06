require('dotenv').config();
var Discord = require('discord.js');
var logger = require('winston');
const axios = require('axios');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const ConnectionLogs = require('./utils/server-events');
const connectionLogs = new ConnectionLogs();

var token = process.env.token;
var serverName = process.env.serverName;
const backupPath = process.env.backupLocation;
const notifChannelId = process.env.notificationChannel;
const db = `${backupPath}/${process.env.backupFileName}.db`;
const fwl = `${backupPath}/${process.env.backupFileName}.fwl`;
var prefix = '!';

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = 'debug';

var bot = new Discord.Client();

bot.login(token);

bot.once('ready', async function (evt) {
  logger.info('Connected!');
  const notifChannel = await bot.channels.cache.find(
    (x) => x.id == notifChannelId
  );
  notifChannel.send('I HAVE ARRIVED!');
});

connectionLogs.on('event', async (event) => {
  const notifChannel = await bot.channels.cache.find(
    (x) => x.id == notifChannelId
  );
  console.log('server event: ', event);
  notifChannel.send(event);
});

bot.on('message', async (message) => {
  const notifChannel = await bot.channels.cache.find(
    (x) => x.id == notifChannelId
  );
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'help':
      message.channel.send('**Stats** \n !stats');
      break;

    case 'feed':
      message.channel.send(`Thanks for the guac ${message.member}`);
      message.channel.send('https://i.imgur.com/5TfODZo.jpgs');
      break;

    case 'setsail':
      message.channel.send('https://i.imgur.com/YOE1hgz.jpg');
      break;

    case 'backup':
      if (message.member.hasPermission('ADMINISTRATOR')) {
        // back back back it up
        try {
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dateFmt = `${year}-${month}-${day}`;
          const newFile = `${backupPath}/${process.env.backupFileName}-${dateFmt}.tar.gz`;
          const { stdout, stderr } = await exec(
            `tar -cvzf ${newFile} ${db} ${fwl}`
          );
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          message.channel.send(
            `World successfully backed up as ${process.env.backupFileName}-${dateFmt}.tar.gz`
          );
        } catch (err) {
          console.log('Error backing up world.');
          console.log(err);
          message.channel.send('Oops... I broke it.');
        }
      } else {
        message.channel.send('YOUR NOT MY DAD!');
      }
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
            Players: ${data.attributes.players}
            Server Rank: ${data.attributes.rank}
            Server Password: ${process.env.serverPass}`
          );
        });
      }
      break;

    default:
      message.channel.send('Command: ' + command + ' not found');
  }
});

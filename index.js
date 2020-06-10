const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const axios = require('axios');
const cheerio = require('cheerio');
const htmlToImage = require('html-to-image');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const fetchData = async (url) => {
	const result = await axios.get(url);
	// console.log(result);
	return result.data;
};

const main = async (url) => {
	const content = await fetchData(url);
	const $ = cheerio.load(content);

	console.log('chegou aui: ' + $('.col-xl-6').find('.text-center').eq(1).find('a').html());

	let length = $('.character-slots').eq(1).find('.item').find('a').find('img').length;
	let x = 0;
	let y = 0;

	const canvas = createCanvas(500, 200);
	const ctx = canvas.getContext('2d');
	for (let i = 0; i <= length - 1; i++) {
		try {
			console.log(i);
			await loadImage(
				$('.character-slots').eq(1).find('.item').find('a').find('img').eq(i).attr('src')
			).then((image) => {
				ctx.drawImage(image, x, y, 50, 50);
			});
			x = x + 50;
		} catch (ex) {
			continue;
		}
	}
	let lengthInv = $('.col-xl-9.col-lg-8').find('.col-xl-12').find('a').length;
	x = 0;
	y = 75;
	let baseUrl = 'https://gameinfo.albiononline.com/api/gameinfo/items/';
	for (let j = 0; j <= lengthInv - 1; j++) {
		let erro = 0;
		let urlLength = $('.col-xl-9.col-lg-8')
			.find('.col-xl-12')
			.find('a')
			.find('img')
			.eq(j)
			.attr('data-src')
			.split('/').length;
		let nameItem = $('.col-xl-9.col-lg-8')
			.find('.col-xl-12')
			.find('a')
			.find('img')
			.eq(j)
			.attr('data-src')
			.split('/')[urlLength - 1];
		console.log(baseUrl + nameItem);

		console.log(j);
		await loadImage(baseUrl + nameItem).then((image) => {
			ctx.drawImage(image, x, y, 50, 50);
		});
		x = x + 50;
		console.log(x);
		if (x == 500) {
			x = 0;
			y = y + 50;
		}
	}

	const nameFile = Date.now();
	let base64Image = canvas.toDataURL().split(';base64,').pop();
	fs.writeFile('images/' + nameFile + '.png', base64Image, { encoding: 'base64' }, function(err) {
		console.log('File created');
	});

	const file = new Discord.MessageAttachment('./images/' + nameFile + '.png');
	const exampleEmbed = {
		title: 'Vitima: ' + $('.col-xl-6').find('.text-center').eq(1).find('a').html(),
		description: 'IP: ' + $('.col-lg-4.col-md-6').eq(2).find('h3').html(),
		url: url,
		color: 1081341,
		image: {
			url: 'attachment://' + nameFile + '.png'
		}
	};

	return { files: [ file ], embed: exampleEmbed };
};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
	if (msg.author.bot) return;
	if (msg.channel.type == 'dm') return;
	console.log('fui chamado');
	const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
	const comando = args.shift().toLowerCase();

	if (comando === 'ping') {
		const exampleEmbed = new Discord.MessageEmbed().attachFiles([
			'https://gameinfo.albiononline.com/api/gameinfo/items/T7_HEAD_PLATE_SET2.png?count=1&quality=2',
			'https://gameinfo.albiononline.com/api/gameinfo/items/T7_HEAD_PLATE_SET2.png?count=1&quality=2'
		]);
		await msg.channel.send(exampleEmbed);
	}

	if (comando === 'regear') {
		let text = await main(args[0]);
		console.log(text);
		await msg.channel.send(text);
	}
});

client.login(process.env.token);

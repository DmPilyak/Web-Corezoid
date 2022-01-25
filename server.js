var CryptoJS = require("crypto-js");
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8000;

const urlencodedParser = express.urlencoded({extended: true});
app.use(
	cors({
		origin: "*"
	})
);
app.use(express.json());
app.use(express.static(__dirname));
app.use('/signup', bodyParser.urlencoded({
    extended: true
}));
app.use('/confirming', bodyParser.urlencoded({
	extended: true
}));
app.use(
	session({
    secret: 'you secret key',
    saveUninitialized: true,
  })
);

app.set('view engine', 'hbs');
app.set('views', './views');

//hbs
//app.get('/hbs', )

app.post('/signup', function(req, res, next) {
	const user = req.body;
	res.render('main.hbs', {
		title: "Products",
		message: "prpduct list",
		products: "smth"
	});
	const body = JSON.stringify({
		timeout: 30,
		ops: [{
			conv_id: "1025689",
			type: 'create',
			obj: 'task',
			data: {
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
				password: user.password
			}
		}]
	});
	var time = Math.floor(Date.now() / 1000);
	var login = "120272";
	var secret = "Xr6G8Zre9WucAWPWLD4n0u33TPcgkICzmZxr93gNlfOM57VaMz";
	var signature = CryptoJS.enc.Hex.stringify(
		CryptoJS.SHA1(time + secret + body + secret)
	);
	const request = require('request')
	const result = request({
		uri: `https://sync-api.corezoid.com/api/1/json/${login}/${time}/${signature}`,
		method: 'post',
		headers: {
			"Content-Type": "application/json",
		},
		body: body,
		gzip: true
	}, function (error, response, body) {
			if(JSON.parse(response.body).ops[0].data.alreadyRegistered == true) {
				res.status(404).send(`Incorrect email`);
				return;
			} else {
				const user = req.body;
				res.redirect("/confirming?email=" + user.email);
				return;
			}
	})
});

app.get('/confirming', (req, res) => {
	res.sendFile(__dirname + "/confirming.html");
	//res.send('confirming', {email: req.params.email})
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/home.html");
})

app.get('/signup', (req, res) => {
	res.sendFile(__dirname + "/signUp.html");
})

app.post('/confirming', (req, res) => {
	let user = req.body;
	console.log(user);
	const body = JSON.stringify({
		timeout: 30,
		ops: [{
			conv_id: "1032662",
			type: 'create',
			obj: 'task',
			data: {
				uid: user.uid,
				email: user.email
			}
		}]
	});
	var time = Math.floor(Date.now() / 1000);
	var login = "120295";
	var secret = "oxSxgjivU4v3ba2YYC7S5kZuHD8D8MeJU6Gvor1W2JhAWuZ06W";
	var signature = CryptoJS.enc.Hex.stringify(
		CryptoJS.SHA1(time + secret + body + secret)
	);
	const request = require('request')
	const result = request({
		uri: `https://sync-api.corezoid.com/api/1/json/${login}/${time}/${signature}`,
		method: 'post',
		headers: {
			"Content-Type": "application/json",
		},
		body: body,
		gzip: true
	}, function (error, response, body) {
			let user = JSON.parse(response.body).ops[0].data.user;
			console.log(user, 333);
			if(user !== 'null') {
				//записать юзера в кукки и перейти на некст страницу с этими даными 
				res.redirect("/account?name=" + user.first_name + "&surname=" + user.last_name);
			} else {
				//остаться на странице с параметрами 
			}
		})
})

app.get('/account', (req, res) => {
	res.sendFile(__dirname + "/account.html");
})

app.post("/about", urlencodedParser, (req, res) => {
	res.status(201).send(JSON.stringify({"from_JS": req.body.name}));
})

app.listen(PORT, () => {
	console.log('Server has been started...');
})


const fetch = require('node-fetch');
const CryptoJS = require("crypto-js");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8000;

const urlencodedParser = express.urlencoded({extended: true});

app.use(cookieParser());

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

app.use('/login', bodyParser.urlencoded({
	extended: true
}));


app.post('/signup', async (req, res, next) => {
	const userData = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		password: req.body.password
	}
	const login = "120272";
	const secret = "Xr6G8Zre9WucAWPWLD4n0u33TPcgkICzmZxr93gNlfOM57VaMz";
	const conv_id = "1025689";
	let corezoidResponse = await sendRequestToCorezoid(userData, login, secret, conv_id);
	let alreadyRegistered = JSON.stringify(corezoidResponse.ops[0].data.alreadyRegistered);
	if(alreadyRegistered == "false"){
		res.cookie('userEmail', userData.email);
		res.redirect("/confirming");
	} else {
		res.redirect("/signup");
	}
});

app.post('/login', async (req, res) => {
	const userData = {
		email: req.body.logemail,
		password: req.body.logpass
	}
	const login = "120399";
	const secret = "eenxR1C0UEqWolzXLCG8DP7EaTYzCnFNa86T96Y1TOUH90ti3r";
	const conv_id = "1034747";
	let corezoidResponse = await sendRequestToCorezoid(userData, login, secret, conv_id);
	let user = JSON.parse(corezoidResponse.ops[0].data.user);
	if(user != null){
		res.cookie('userEmail', user.email);
		res.cookie('userName', user.first_name);
		res.cookie('userSurname', user.last_name);
		res.cookie('userPassword', user.password);
		res.redirect("/account");
	} else {
		res.redirect("/signup");
	}
})

app.get('/confirming', (req, res) => {
	res.sendFile(__dirname + "/confirming.html");
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/home.html");
})

app.get('/signup', (req, res) => {
	res.clearCookie("userEmail");
	res.clearCookie("userName");
	res.clearCookie("userSurname");
	res.clearCookie("userPassword");
	res.sendFile(__dirname + "/signUp.html");
})

app.post('/confirming', async (req, res) => {
	const userData = {
		email: req.body.email,
		uid: req.body.uid
	}
	const login = "120295";
	const secret = "oxSxgjivU4v3ba2YYC7S5kZuHD8D8MeJU6Gvor1W2JhAWuZ06W";
	const conv_id = "1032662";
	let corezoidResponse = await sendRequestToCorezoid(userData, login, secret, conv_id);
	let user = JSON.parse(corezoidResponse.ops[0].data.user);
	if(user != null){
		res.cookie('userEmail', user.email);
		res.cookie('userName', user.first_name);
		res.cookie('userSurname', user.last_name);
		res.cookie('userPassword', user.password);
		res.redirect("/account");
	} else{
		res.redirect("/confirming");
	}
})

app.get('/account', (req, res) => {
	res.sendFile(__dirname + "/account.html");
})

app.listen(PORT, () => {
	console.log('Server has been started...');
})

async function sendRequestToCorezoid(userData, login, secret, conv_id) {
	const body = JSON.stringify({
		timeout: 30,
		ops: [{
			conv_id: conv_id,
			type: 'create',
			obj: 'task',
			data: userData
		}]
	});
	var time = Math.floor(Date.now() / 1000);
	const signature = CryptoJS.enc.Hex.stringify(
		CryptoJS.SHA1(time + secret + body + secret)
	);
	let resp = fetch(
		`https://sync-api.corezoid.com/api/1/json/${login}/${time}/${signature}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: body,
			gzip: true
		}
	).then(  
    function(response) {  
      if (response.status < 400) {
				return response.json().then(function(data) {  
					return data;  
				});  
      }  
    }  
  )
	return resp; 
};
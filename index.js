const path = require("path");
const fs = require("fs");
const request = require("request");
let JAR = request.jar();
const requestJ = request.defaults({
	jar: JAR
});
const cheerio = require("cheerio");
let domain = function (pathname) {
	return "https://iecho.cc" + pathname;
};
let email = Date.now() + '@qq.com';
let passwd = "a123456789";
let headers = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2885.0 Safari/537.36",
	"X-Requested-With": "XMLHttpRequest"
};
let ssConfigPath = path.join("D:\\Program Files (x86)\\ss", "gui-config.json");
let isLinux = process.platform === "linux";

console.log("正在获取邀请码...");
request(domain("/invite"), function (error, response, body) {
	if (!error && response.statusCode == 200) {
		let $ = cheerio.load(body);
		let code = $("table").children("tbody").children().first().children().eq(1).text();
		register(code)
	} else {
		console.error("获取邀请码失败：", error);
	}
});

/// 注册账号
function register(code) {
	request({
		url: domain("/auth/register.json"),
		method: "POST",
		form: {
			do_register: true,
			r_email: email,
			r_passwd: passwd,
			r_passwd2: passwd,
			r_user_name: null,
			r_invite: code
		},
		headers: headers
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let json = JSON.parse(body);
			if (json.code === 200 && json.data.error === 0) {
				console.log(json.data.message, "正在登录...");
				login();
			} else {
				console.log(json);
			}
		} else {
			console.error("注册账号：", error);
		}
	});
}

/// 登录
function login() {
	requestJ({
		url: domain("/auth/login.json"),
		method: "POST",
		form: {
			do_login: true,
			email: email,
			passwd: passwd,
			remember_me: "week"
		},
		headers: headers
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let json = JSON.parse(body);
			if (json.code === 200 && json.data.error === 0) {
				console.log("登录成功,正在获取节点...")
				getNode(6); // 1东京节点 6韩国高速节点
			} else {
				console.log(json.data.message);
			}
		} else {
			console.error("登录：", error);
		}
	});
}

/// 获取节点
function getNode(id) {
	requestJ({
		url: domain("/node/getNodeInfo.json"),
		method: "POST",
		form: {
			id: id
		},
		headers: headers
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let json = JSON.parse(body);
			if (json.code === 200 && json.data.error === 0) {
				if (isLinux) {
					console.log("URI:\n", json.data.info.ssurl);
				} else {
					let ssJSON = JSON.parse(json.data.info.ssjson);
					console.log("获取节点成功，正在写入ss配置文件");
					fs.readFile(ssConfigPath, "utf8", function (err, content) {
						let config = JSON.parse(content);
						config.configs.length = 0;
						ssJSON.userinfo = {
							email: email,
							password: passwd
						};
						config.configs.push(ssJSON);
						fs.writeFile(ssConfigPath, JSON.stringify(config), "utf8", function (err) {
							if (err) {
								return console.log("写入配置失败", err.message);
							}
							console.log(`写入节点信息成功，email:${email},password:${passwd}`);
						});
					});
				}
			} else {
				console.log(json.data.message);
			}
		} else {
			console.error("登录：", error);
		}
	});
}
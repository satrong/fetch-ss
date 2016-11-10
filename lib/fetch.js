/// 爬虫

const cheerio = require("cheerio");
const request = require("request");
const requestJ = request.defaults({
    jar: request.jar()
});
let UAs = require("./ua.json");
let siteurl;

process.argv.map(item => {
    if (item.indexOf("--url=") > -1) {
        siteurl = item.replace(/^--url=/i, "");
    }
});

class Fetch {
    constructor() {
        this.request = requestJ;
        this.ua = UAs[Math.floor(Math.random() * UAs.length)];
        this.headers = {
            "Referer": this.domain("/"),
            "User-Agent": this.ua,
            "X-Requested-With": "XMLHttpRequest"
        };
        this.email = `${this.guid(8)}@${["qq", "163", "foxmail", "gmail", "sina"][Math.floor(Math.random() * 5)]}.com`;
        this.passwd = this.guid(16);
    }

    domain(pathname) {
        return siteurl + pathname;
    };

    guid(max) {
        max = max || 40;
        var str = '';
        for (var i = 0; i < (max / 3) + 1; i++)
            str += Math.floor(Math.random() * 65536).toString(36);
        return str.substring(0, max);
    }

    /// 获取邀请码
    getInvite() {
        let that = this;
        return new Promise((resolve, reject) => {
            console.log("正在获取邀请码...");
            that.request({
                url: that.domain("/invite"),
                headers: {
                    "User-Agent": that.ua
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let $ = cheerio.load(body);
                    let code = $("table").children("tbody").children().first().children().eq(1).text();
                    resolve(code);
                } else {
                    reject("获取邀请码失败：" + error.message);
                }
            });
        });
    }

    /// 注册账号
    register(code) {
        let that = this;
        console.log("正在注册账号...");
        return new Promise((resolve, reject) => {
            that.request({
                url: that.domain("/auth/register.json"),
                method: "POST",
                form: {
                    do_register: true,
                    r_email: that.email,
                    r_passwd: that.passwd,
                    r_passwd2: that.passwd,
                    r_user_name: null,
                    r_invite: code
                },
                headers: that.headers
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let json = JSON.parse(body);
                    if (json.code === 200 && json.data.error === 0) {
                        console.log(json.data.message, "正在登录...");
                        resolve();
                    } else {
                        reject(json);
                    }
                } else {
                    reject("注册账号：" + error.message);
                }
            });
        });
    }

    /// 登录
    login() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.request({
                url: that.domain("/auth/login.json"),
                method: "POST",
                form: {
                    do_login: true,
                    email: that.email,
                    passwd: that.passwd,
                    remember_me: "week"
                },
                headers: Object.assign({}, that.headers, {
                    "Host": "iecho.cc",
                    "Origin": "https://iecho.cc",
                    "Pragma": "no-cache",
                    "Referer": "https://iecho.cc/member/node"
                })
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let json = JSON.parse(body);
                    if (json.code === 200 && json.data.error === 0) {
                        console.log("登录成功,正在获取韩国高速节点...");
                        resolve(6); // 1东京节点 6韩国高速节点
                    } else {
                        console.log(json.data.message);
                        reject(json.data.message);
                    }
                } else {
                    reject("登录：", error.message);
                }
            });
        });
    }

    /// 获取节点
    getNode(id) {
        let that = this;
        console.log(`正在获取 ${{ "6": "韩国高速节点", "1": "东京节点" }[id]} 节点...`);
        return new Promise((resolve, reject) => {
            that.request({
                url: that.domain("/node/getNodeInfo.json"),
                method: "POST",
                form: {
                    id: id
                },
                timeout: 60000,
                headers: that.headers
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let json = JSON.parse(body);
                    if (json.code === 200 && json.data.error === 0) {
                        console.log("获取节点信息成功");
                        resolve(json);
                    } else {
                        console.log(json.data.message);
                        reject(json.data.message);
                    }
                } else {
                    reject("获取节点：", error.message);
                }
            });
        });
    }

    async start() {
        if (!siteurl) return console.log("请配置地址");
        let data;
        try {
            let code = await this.getInvite();
            await this.register(code);
            await this.login();
            data = await this.getNode(6).catch(err => {
                console.log(err);
            });

            if (!data) {
                data = await this.getNode(1);
            }
            return data;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Fetch;
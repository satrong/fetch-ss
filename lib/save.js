// 保存爬取的数据

const path = require("path");
const fs = require("fs");
let isLinux = process.platform === "linux";
let guiConfig = require("./gui.config.json");

/// 写文件
async function writeFile(filepath, content) {
    return await new Promise((resovle, reject) => {
        fs.writeFile(filepath, content, "utf8", err => {
            err ? reject(err) : resovle(true);
        });
    }).catch(err => console.log(err));
}

module.exports = function (result) {
    if (!result) return;
    writeFile("../temp.json", JSON.stringify(result.data.info)).then(status => {
        if (status) {
            console.log("节点信息已缓存到temp.json文件中");
            if (isLinux) {
                console.log("URI:", result.data.info.ssurl);
            } else {
                console.log("正在写入ss配置文件...");
                guiConfig.configs.push(JSON.parse(result.data.info.ssjson));
                writeFile("../gui-config.json", JSON.stringify(guiConfig)).then(status => {
                    console.log(`写入ss配置文件成功${status ? "成功" : ""}`)
                });
            }
        }
    });
};
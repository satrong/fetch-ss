由于注册的`iecho.cc`账号只能使用一天，自己闲麻烦，于是写了一个爬虫自动获取它的节点信息。

# 自动获取流程：
- 注册账号
- 登录
- 获取节点信息
- 写入到shadowsocks的配置文件

# 配置
直接到`index.js`修改`shadowsocks`安装路径（即变量`ssConfigPath`）

> 注意：Linux下只返回URI路径

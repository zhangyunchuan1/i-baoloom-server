# baoloom-egg-server



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

### 账号密码：

- 服务器：47.108.158.162  password: 987654321yun. (mysql 一样).

### redis 服务操作：（注意，启动项目前，需要先启动redis服务，需要先安装redis）

- 启动redis:  brew services start redis
- 关闭redis:  brew services stop redis
- 重启redis:  brew services restart redis
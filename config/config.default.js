/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};
  config.proxy = true;
  //数据库连接信息
  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '47.108.158.162',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '987654321Yun.',
      // 数据库名
      database: 'web_db',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  //redis配置信息
  /**
   * 使用方法：
   * await this.app.redis.set('name','123456789');
    let name = await this.app.redis.get('name');
    多个redis app.redis.get('xxxx').set('foo', 'bar');
    删除key this.app.redis.del(`key`);
  */
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '47.108.158.162',   // Redis host
      password: '987654321Yun.',
      db: 0,
    },
  };

  //配置跨域
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  //安全检查：不建议关闭
  config.security= {
    csrf : {
      enable: false,
    }
  }

  //参数校验插件参数
  config.validate = {
    convert: true,
    widelyUndefined:true
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610354641249_9274';

  // add your middleware config here
  config.middleware = [
    'errorHandler',  // 加载 errorHandler 中间件
  ];  
  config.errorHandler = {
    match: '/',  // 只对 / 前缀的 url 路径生效
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.uploadDir = '/usr/local/nginx/html/uploadFile';

  return {
    ...config,
    ...userConfig,
  };
};

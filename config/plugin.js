'use strict';

// /** @type Egg.EggPlugin */
// module.exports = {
//   // had enabled by egg
//   // static: {
//   //   enable: true,
//   // }
// };

/** 开启egg-mysql插件 */
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

/** redis 服务 */
exports.redis = {
  enable: true,
  package: 'egg-redis',
};

/** post请求参数校验插件  */
exports.validate = {
  enable: true,
  package: 'egg-validate',
};

/** http请求配置跨域  */
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
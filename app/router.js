'use strict';
const path = require('path');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/test', controller.home.test);
  require('./router/user')(app);  //用户相关接口
  require('./router/article')(app);  //文章相关接口
  require('./router/color')(app);  //色卡相关接口
  require('./router/tool')(app);  //工具相关接口
};

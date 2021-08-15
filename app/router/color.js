module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt(app);
  // console.log('jwt:',app.middleware);
  router.post('/color/queryRecommendColor', controller.color.queryRecommendColor);  //查询推荐色卡
  router.post('/color/queryMyColor', jwt, controller.color.queryMyColor);  //查询我的色卡
  router.post('/color/addColorCard', jwt, controller.color.addColorCard);  //新增色卡
};
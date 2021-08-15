module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt(app);
  router.post('/tool/tools', controller.tool.queryTools);
  router.post('/tool/allTool', jwt, controller.tool.queryAllTool);
  router.post('/tool/myTool', jwt, controller.tool.queryMyTool);
  router.post('/tool/subscribe', jwt, controller.tool.subscribeTools);
};
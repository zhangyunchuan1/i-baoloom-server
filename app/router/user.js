module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt(app);
  router.get('/user', controller.user.info);
  router.post('/user/register', controller.user.register);
  router.post('/user/login', controller.user.login);
  router.post('/user/loginSendCode', controller.user.loginSendCode);
  router.post('/user/registerSendCode', controller.user.registerSendCode);
  router.post('/user/followUser', jwt, controller.user.followUser);
  router.post('/user/queryMyUserInfo', jwt, controller.user.queryMyUserInfo);
};
module.exports = app => {
  const { router, controller } = app;
  router.post('/user', controller.user.info);
  router.post('/user/register', controller.user.register);
  router.post('/user/login', controller.user.login);
  router.post('/user/loginSendCode', controller.user.loginSendCode);
};
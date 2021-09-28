module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt(app);
  console.log('jwt:',app.middleware);
  router.post('/article/articleType', controller.article.articleType);
  router.post('/article/queryArticleByType', controller.article.queryArticleByType);
  router.post('/article/articleDetail', controller.article.articleDetail);
  router.post('/article/addArticle', jwt, controller.article.addArticle);
  router.post('/article/editArticle', jwt, controller.article.editArticle);
  router.post('/article/comment', jwt, controller.article.comment);
  router.post('/article/getComment', controller.article.getComment);
  router.post('/article/likeOrDislike', jwt, controller.article.likeOrDislikeArticle);
  router.post('/article/uploadImg', controller.article.uploadImg);
  router.post('/article/queryMyArticleList', jwt, controller.article.queryMyArticleList);
  router.post('/article/updateArticleStatus', jwt, controller.article.updateArticleStatus);
};
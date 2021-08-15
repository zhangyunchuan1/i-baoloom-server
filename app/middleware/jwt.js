const jwt = require('jsonwebtoken'); 
const Http = require('../utils/tools/http.js');

/**
 * 中间件描述：需要用户登录认证的接口，用此中间件验证
 * @param token
 */
module.exports = (app) => {
  return async function authentication(ctx, next) {
    let authToken = ctx.header.token // 获取header里的token
    if(authToken){
      let decoded = null;
      try {
        //解密token
        decoded = await jwt.verify(authToken, 'anyStr',{ expiresIn: '1h' });
      } catch (error) {}
      if(decoded){
        //获取根据token中的用户id去redis中的查找token
        const redis_token = await app.redis.get('token_'+decoded.id);
        if (authToken === redis_token) {
          console.log('1223123123123123123123', decoded.id)
          ctx.locals.userid = decoded.id
          await next()
        } else {
          ctx.body = Http.response(201,null,'您的账号已在其他地方登录！');
        }
      }else{
        ctx.body = Http.response(201,null,'登录已过期！');
      }
    }else {
      ctx.body = Http.response(202,null,'请登陆后再进行操作！');
    }
  }
}
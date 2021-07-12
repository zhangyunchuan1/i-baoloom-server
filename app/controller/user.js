const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken'); 
const Http = require('../utils/tools/http.js');
const { createSixNum } = require('../utils/tools/tool.js');
const sendEmail = require('../utils/tools/mailer.js');
const bcrypt = require('bcrypt');  //密码加密
const saltRounds = 10;  //加密位数
const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;  //邮箱校验规则

class UserController extends Controller {
  /**
   * 查询所有用户
  */
  async info() {
    const ctx = this.ctx;
    const user = await ctx.service.user.find();
    ctx.body = user;
  }
  /**
   * 注册用户
   * @param {string} userName 用户名
   * @param {string} password 密码
   * @param {string} email 邮箱
   * @param {string} type 注册方式 1:用户名注册/2:邮箱注册
  */
  async register() {
    const ctx = this.ctx;
    let { userName,password,email,type } = ctx.request.body;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{type:true,password:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    //判断注册方式
    if(type == '1'){  //用户名注册
      let checkResult = Http.checkParams(ctx.request.body,{userName:true});
      if(!checkResult.status){
        return ctx.body = Http.response(500,null,checkResult.message);
      }
      //查重
      let finduser = await ctx.service.user.findUserByName(userName);
      if(finduser.length  <= 0){
        let hashPassword = await bcrypt.hashSync(password, saltRounds);
        let result  = await ctx.service.user.registerUser({ userName,password:hashPassword });
        if(result){
          return ctx.body = Http.response(200,null,'注册成功！');
        }
      }else{
        return ctx.body = Http.response(500,null,'用户名已被占用！');
      }
    }else if(type == '2'){  //邮箱注册
      let checkResult = Http.checkParams(ctx.request.body,{email:true});
      if(!checkResult.status){
        return ctx.body = Http.response(500,null,checkResult.message);
      }
      if(reg.test(email)){
        //查重
        let finduser = await ctx.service.user.findUserByEmail(email);
        if(finduser.length  <= 0){
          let hashPassword = await bcrypt.hashSync(password, saltRounds);
          let result  = await ctx.service.user.registerUser({ email,password:hashPassword });
          if(result){
            return ctx.body = Http.response(200,null,'注册成功！');
          }
        }else{
          return ctx.body = Http.response(500,null,'邮箱已被注册！');
        }
      }else{
        return ctx.body = Http.response(500,null,'邮箱格式不正确！');
      }
    }
  }
  /**
   * 方法描述：用户登录
   * @param userName 用户名
   * @param password 密码
   * @param email 邮箱
   * @param code 验证码
   * @param type 登录类型 1: 用户名登录 2: 邮箱验证码登录
   */
   async login() {
    const { ctx } = this;
    console.log('rucasnhu----', ctx.request.body)
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body, {type:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const { type } = ctx.request.body;
    if(type == '1'){  //用户选择密码登录
      //校验参数是否缺少
      let checkResult = Http.checkParams(ctx.request.body, {userName:true,password:true});
      if(!checkResult.status){
        return ctx.body = Http.response(500,null,checkResult.message);
      }
      const {userName,password} = ctx.request.body;
      if(reg.test(userName)){
        //邮箱登录
        var users = await ctx.service.user.findUserByEmail(userName);
      }else{
        //用户名登录
        var users = await ctx.service.user.findUserByName(userName);
      }
      if(users.length > 0){
        const match = await bcrypt.compare(password, users[0].password);
        if(match){
          let user = { ...users[0],password:undefined};
          let token = jwt.sign(user, 'anyStr',{ expiresIn: '1h' }); //生成token，exporesIn为过期时间，单位：ms/h/days/d  eg:1000, "2 days", "10h", "7d"
          const data = {
              token,
              user
          }
          await this.app.redis.set('token_'+user.id,token);
          ctx.body = Http.response(200,data,'登录成功！');
        }else{
          ctx.body = Http.response(500,null,'用户名或密码错误！');
        }
      }else{
        ctx.body = Http.response(500,null,'用户不存在！');
      }
    }else{  //用户选择邮箱验证码登录
      //校验参数是否缺少
      let checkResult = Http.checkParams(ctx.request.body, {email:true, code: true});
      if(!checkResult.status){
        return ctx.body = Http.response(500,null,checkResult.message);
      }
      const { email, code } = ctx.request.body;
      //邮箱格式校验
      if(!reg.test(email)){
        return ctx.body = Http.response(500,null,'邮箱格式错误！');
      }
      //查询是否存在该邮箱用户
      var users = await ctx.service.user.findUserByEmail(email);
      if(users.length > 0){
        //判断验证码和邮箱是否有效
        let redis_code = await this.app.redis.get(`login_code_${email}`);
        if(redis_code && redis_code == code){
          let user = { ...users[0]};
          delete user['password'];
          let token = jwt.sign(user, 'anyStr',{ expiresIn: '1h' }); //生成token，exporesIn为过期时间，单位：ms/h/days/d  eg:1000, "2 days", "10h", "7d"
          const data = {
              token,
              user
          }
          await this.app.redis.set('token_'+user.id,token);
          ctx.body = Http.response(200,data,'登录成功！');
        }else{
          ctx.body = Http.response(200,null,'验证码已失效！');
        }
      }else{
        ctx.body = Http.response(500,null,'用户不存在！');
      }
    }
  }
  /**
   * 方法描述：注册-发送邮箱验证码
   * @param email 邮箱
   */
   async sendEmailCode(){
    const { ctx } = this;
    const { email } = ctx.request.body;
    //参数校验
    let checkResult = Http.checkParams(ctx.request.body,{email:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,'邮箱格式错误！');
    }
    const users = await ctx.service.user.findUserByEmail(email);
    if(users.length > 0){
      //已注册
      return ctx.body = Http.response(500,null,'邮箱已被注册！');
    }else{
      //未注册,生成6位验证码
      let emailCode = createSixNum();
      await this.app.redis.set(email,emailCode,'EX', 30*60);  //验证码有效时间30分钟
      sendEmail(email,emailCode)
      ctx.body = result(null,'验证码已发送！',200);
    }
  }

  /**
   * 邮箱登录-发送验证码
   * @param { email } string 邮箱号
  */
  async loginSendCode(){
    const { ctx } = this;
    const { email } = ctx.request.body;
    //参数校验
    let checkResult = Http.checkParams(ctx.request.body,{email:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    //邮箱格式校验
    if(!reg.test(email)){
      return ctx.body = Http.response(500,null,'邮箱格式错误！');
    }
    //查询该邮箱是否注册
    const users = await ctx.service.user.findUserByEmail(email);
    if(users.length > 0){
      //已注册，生成验证码
      let emailCode = createSixNum();
      await this.app.redis.set(`login_code_${email}`,emailCode,'EX', 30*60);  //验证码有效时间30分钟
      sendEmail(email,emailCode);
      ctx.body = Http.response(200,null,'验证码已发送！');
    }else{
      //未注册
      return ctx.body = Http.response(500,null,'邮箱未注册！');
    }
  }
}

module.exports = UserController;
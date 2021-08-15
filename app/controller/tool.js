const Controller = require('egg').Controller;
const Http = require('../utils/tools/http.js');

class ToolController extends Controller {
  /**
   * 查询未订阅的工具
   * 需要登录
  */
  async queryAllTool() {
    const ctx = this.ctx;
    const userId = ctx.locals.userid;
    let resultData = [];
    let data = await ctx.service.tool.queryAllTool();
    let userTool = await ctx.service.tool.queryMyTool(userId);
    console.log('==========:', userTool)
      if(userTool.length > 0){
        //有订阅
        data.forEach(item => {
          let has = userTool.some(function(ele) { console.log(item.id, ele.toolId); return item.id == ele.toolId; });
          if (!has) resultData.push({...item, subscribed:false, toolId: item.id});
        }); 
        console.log('------:', resultData);
      }else{
        // 一个都没订阅
        data.forEach(item => {
          item.toolId = item.id;
          item.subscribed = false;
        });
        resultData = data;
      }
    return ctx.body = Http.response(200,resultData,'查询成功！');
  }
  /**
   * 查询已订阅的工具
   * 需要登录
  */
   async queryMyTool() {
    const ctx = this.ctx;
    const userId = ctx.locals.userid;
    let userTool = await ctx.service.tool.queryMyTool(userId);
    userTool.forEach(item => {
      item.subscribed = true;
    });
    return ctx.body = Http.response(200,userTool,'查询成功！');
  }
  /**
   * 查询所有的工具
   * 不需要登录
  */
   async queryTools() {
    const ctx = this.ctx;
    let data = await ctx.service.tool.queryAllTool();
    data.forEach(item => {
      item.subscribed = false;
    });
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 添加订阅工具
  */
   async subscribeTools() {
    const ctx = this.ctx;
    //校验参数是否缺少
    console.log(ctx.request.body);
    let checkResult = Http.checkParams(ctx.request.body,{toolId:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    //订阅者id
    const userId = ctx.locals.userid;
    let res = await ctx.service.tool.subscribeTools({toolId:ctx.request.body.toolId,userId});
    return res && (ctx.body = Http.response(200,null,'订阅成功！'));
  }
}

module.exports = ToolController;
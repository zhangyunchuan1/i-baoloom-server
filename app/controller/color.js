const Controller = require('egg').Controller;
const Http = require('../utils/tools/http.js');

class ColorController extends Controller {
  /**
   * 查询推荐色卡
  */
  async queryRecommendColor() {
    const ctx = this.ctx;
    let data = await ctx.service.color.queryRecommendColor();
    data.forEach(item => {
      item.colors = JSON.parse(item.colors);
    });
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 查询我的色卡
  */
   async queryMyColor() {
    const ctx = this.ctx;
    let data = await ctx.service.color.queryMyColor(ctx.locals.userid);
    data.forEach(item => {
      item.colors = JSON.parse(item.colors);
    });
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 新增色卡
   * @param {string} title 色卡标题
   * @param {string} colors 色卡集 如： "#bfbfbf,#df45f4"
   * @param {string} type 色卡类型 1:推荐色卡 / 2:个人色卡
  */
   async addColorCard() {
    const ctx = this.ctx;
    console.log('入参：', ctx.request.body);
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{title:true, colors:true, type: true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const data = await ctx.service.color.addColorCard({...this.ctx.request.body,createBy:ctx.locals.userid});
    return ctx.body = Http.response(200,data,'新增成功！');
  }
}

module.exports = ColorController;
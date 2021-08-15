const Controller = require('egg').Controller;
const Http = require('../utils/tools/http.js');
const pump = require("pump");
const fs = require("fs");

class ArticleController extends Controller {
  /**
   * 根据类型查询文章列表
   * @param type : String 文章板块
   * @param sort : String 排序 【综合排序：all，最多观看:view，最新发布:createTime，最多评论:comment，最多收藏:collect】
   * @param pageSize : number 每页条数 -默认10条
   * @param page : number 当前页
  */
   async queryArticleByType() {
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{type:true,sort:true,page:true,pageSize:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const data = await ctx.service.article.queryArticleByType(ctx.request.body);
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 查询文章详情
   * @param id 文章唯一id
  */
  async articleDetail() {
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{id:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    let { id } = ctx.request.body;
    const data = await ctx.service.article.articalDetail(id);
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 查询文章类型
  */
   async articleType() {
    const ctx = this.ctx;
    const data = await ctx.service.article.articleType();
    return ctx.body = Http.response(200,data,'查询成功！');
  }
  /**
   * 添加文章
   * @param title
   * @param content
  */
  async addArticle(){
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{title:true,content:true,type:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const data = await ctx.service.article.addArticle({...this.ctx.request.body,createBy:ctx.locals.userid});
    return ctx.body = Http.response(200,data,'新增成功！');
  }
  /**
   * 编辑文章
   * @param id  文章id
   * @param title  标题
   * @param content  内容
  */
   async editArticle(){
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{title:true,content:true,id:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    //文章创建者和修改者是否一致
    let articalforUserId = await ctx.service.article.findArticleUserId({id:ctx.request.body.id});
    if(ctx.locals.userid === articalforUserId){
      const data = await ctx.service.article.editArticle({...this.ctx.request.body, id:ctx.request.body.id});
      return  data && (ctx.body = Http.response(200,null,'修改成功！'));
    }else{
      return ctx.body = Http.response(500,null,'没有权限');
    }
  }
  /**
   * 评论
   * @param content
   * @param belong  文章id
   * @param parant  文章id/评论id
  */
   async comment(){
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{content:true,belong:true,createTo:true,parant:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const data = await ctx.service.article.comment({...this.ctx.request.body, createBy:ctx.locals.userid});
    return ctx.body = Http.response(200,data,'评论成功！');
  }
  /**
   * 获取文章的评论
   * @param belong  文章id
  */
   async getComment(){
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{belong:true });
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    const data = await ctx.service.article.getComment(this.ctx.request.body);
    //将查出来所有文章相关的评论，结构化
    let _data = [];
    data.forEach(item => {
      if(item.parant === this.ctx.request.body.belong){
        let children = [];
        data.forEach(ele => {
          if(ele.parant === item.id){
            children.push(ele);
          }
        });
        _data.push({
          ...item,
          children
        })
      }
    });
    return ctx.body = Http.response(200,_data,'查询成功！');
  }
  /**
   * 文章点赞
   * @param id 文章id
   * @param type {String} 1:点赞/2:取消点赞
  */
   async likeOrDislikeArticle(){
    const ctx = this.ctx;
    //校验参数是否缺少
    let checkResult = Http.checkParams(ctx.request.body,{id:true,type:true});
    if(!checkResult.status){
      return ctx.body = Http.response(500,null,checkResult.message);
    }
    //点赞者id
    const userId = ctx.locals.userid;
    if(ctx.request.body.type == '1'){  //点赞
      //用户是否已经点过赞
      let hasLike = await ctx.service.article.getIsLike({...ctx.request.body,userId});
      if(hasLike){
        return ctx.body = Http.response(200,null,'您已点赞！');
      }else{  //未点赞，添加点赞记录
        let res = await ctx.service.article.likeArtical({...ctx.request.body,userId});
        return res && (ctx.body = Http.response(200,null,'点赞成功！'));
      }
    }else if(ctx.request.body.type == '2'){  //取消点赞
      let res = await ctx.service.article.dislikeArtical({belong:ctx.request.body.id,createBy:userId});
      return res && (ctx.body = Http.response(200,null,'取消成功！'));
    }
  }
  /**
   * 上传图片
  */
  async uploadImg(){
  const { ctx } = this;
  const parts = ctx.multipart({ autoFields: true });
  let files = {};
  let stream;
  while ((stream = await parts()) != null) {
    if(!stream.filename){
      break;
    }
    const fieldname = stream.fieldname; // file表单的名字
    // 上传图片的目录
    const dir = await ctx.service.article.getUploadFile(stream.filename);
    const target = dir.uploadDir;
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    files = Object.assign(files, {
      [fieldname]: dir.saveDir
    });
  }
  if(Object.keys(files).length > 0){
    ctx.body = Http.response(200,files,'图片上传成功!')
  }else{
    ctx.body = Http.response(500,null,'图片上传失败!')
  }
  }
}

module.exports = ArticleController;
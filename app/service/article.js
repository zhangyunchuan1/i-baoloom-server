const Service = require('egg').Service;
const uuid = require('uuid/v1');
const moment = require('moment');

class ArticleService extends Service {
  /**
   * 查询文章详情
  */
  async articalDetail(id) {
    //文章详情
    let data = await this.app.mysql.query(`SELECT * FROM article WHERE id = ?`,id);
    // 点赞数
    let likes = await this.app.mysql.query(`SELECT isLike FROM likes WHERE belong = ? AND isLike = '1'`,id);
    if(data.length == 1){
      data[0].likes = likes.length;
    }
    return data
  }
  /**
   * 添加文章
  */
   async addArticle(params) {
    let { title, content,createBy } = params;
    //唯一ID
    const id = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('article', {id,title,content,createTime,createBy});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 查询文章所属人id
   * @id 文章id
  */
   async findArticleUserId(params) {
    let { id } = params;
    let result = await this.app.mysql.query('SELECT createBy FROM article WHERE id = ?',id);
    if(result.length > 0 && result.length == 1){
      return result[0].createBy;
    }else{
      return null;
    }
  }
  /**
   * 编辑文章
  */
   async editArticle(params) {
    let { title, content, id } = params;
    let result = await this.app.mysql.query(`UPDATE article SET title = ? ,content = ?  WHERE id = ? ;`, [title,content,id]);
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 评论文章
  */
   async comment(params) {
    let { content, belong, createBy, createTo, parant } = params;
    //唯一ID
    const id = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('comment', {id,content,belong,createBy, createTo,parant, createTime});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 查询文章的评论
  */
   async getComment(params) {
    let { belong } = params;
    let data = await this.app.mysql.query(`
    SELECT a.* , 
    (SELECT b.userName FROM user b WHERE a.createBy = b.id) AS createByName ,
    (SELECT c.userName FROM user c WHERE a.createTo = c.id) AS createToName 
    FROM comment a
    WHERE a.belong = ? 
    Order By a.createTime ASC`,belong);
    return data;
  }
  /**
   * 文章点赞
  */
  async likeArtical(params) {
    let { id, userId } = params;
    const uid = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('likes', {id:uid,belong:id,createTime,createBy:userId,isLike:'1'});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 取消文章点赞
  */
   async dislikeArtical(params) {
    let { belong, createBy } = params;
    let result = await this.app.mysql.query(`UPDATE likes SET isLike = '2' WHERE belong = ? AND createBy = ?`,[belong,createBy]);
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 获取文章点赞数
  */
  async getArticalLikes(params) {
    let { id } = params;
    let data = await this.app.mysql.query(`SELECT COUNT(*) AS num FROM likes WHERE id = ?;`,id);
    return data[0].num;
  }
  /**
   * 获取文章-用户是否点赞
  */
   async getIsLike(params) {
    let { id,createBy } = params;
    let data = await this.app.mysql.query(`SELECT * FROM likes WHERE id = ? AND createBy = ?;`,[id,createBy]);
    if(data.length > 0 && data[0].isLike == '1'){
      return true;
    }
    return false;
  }
}
module.exports = ArticleService;
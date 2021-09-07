const Service = require('egg').Service;
const uuid = require('uuid/v1');
const moment = require('moment');
const path = require("path");
const sd = require('silly-datetime');
const mkdirp = require('mkdirp');

class ArticleService extends Service {
  /**
   * 根据类型查询文章列表
  */
   async queryArticleByType(params) {
    let { type, sort, pageSize, page} = params;
    //查询总条数
    let total = await this.app.mysql.query(`
      SELECT count(*)
      FROM article
      WHERE type = ${type}
    `, type);
    //查询符合条件的数据
    let data = await this.app.mysql.query(`
      SELECT a.* ,b.userName, b.avatar
      FROM article a 
      JOIN user b ON a.createBy = b.id 
      WHERE type = ${type} 
      ${sort === 'all'?'order by a.createTime desc':'order by '+sort+' desc'} 
      limit ${pageSize?pageSize:'10'} 
      offset ${(page-1)*pageSize} 
    `);

    return {
      data,
      total:total[0]['count(*)'],
      pageSize,
      page
    }
  }
  /**
   * 查询文章详情
  */
  async articalDetail(id) {
    //文章详情
    let data = await this.app.mysql.query(`
      SELECT a.*, b.userName 
      FROM article a 
      JOIN user b  
      ON a.createBy = b.id AND a.id = ?
    `, id);
    // 点赞数
    let likes = await this.app.mysql.query(`SELECT isLike FROM likes WHERE belong = ? AND isLike = '1'`,id);
    if(data.length == 1){
      data[0].likes = likes.length;
      //记录添加浏览次数
      this.app.mysql.update('article', {
        views: data[0].views+1,
      }, {
        where: {
          id: id
        }
      });
    }
    return data
  }
  /**
   * 查询文章类型
  */
   async articleType() {
    let data = await this.app.mysql.query(`SELECT * FROM config_article_type WHERE status = 1 order by sort ASC`);
    return data
  }
  /**
   * 添加文章
  */
   async addArticle(params) {
    let { title, content, createBy, type, cover } = params;
    //唯一ID
    const id = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('article', {id,title,content,createTime,createBy,type,cover});
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
    (SELECT b.userName FROM user b WHERE a.createBy = b.id) AS createByName,
    (SELECT b.avatar FROM user b WHERE a.createBy = b.id) AS createByAvatar,
    (SELECT c.userName FROM user c WHERE a.createTo = c.id) AS createToName,
    (SELECT c.avatar FROM user c WHERE a.createTo = c.id) AS createToAvatar 
    FROM comment a
    WHERE a.belong = ? 
    Order By a.createTime ASC`,belong);
    return data;
  }

  //(SELECT b.userName AS createByName, b.avatar AS createByAvatar FROM user b WHERE a.createBy = b.id) ,
  //(SELECT c.userName AS createToName, c.avatar AS createToAvatar FROM user c WHERE a.createTo = c.id)  
  /**
   * 文章点赞-插入
  */
  async insertLikeArtical(params) {
    let { id, userId, likeType } = params;
    const uid = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('likes', {id:uid,belong:id,createTime,createBy:userId,isLike:'1',likeType});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 更新文章点赞状态
  */
   async updatelikeArtical(params) {
    let { isLike, belong, createBy } = params;
    let result = await this.app.mysql.query(`UPDATE likes SET isLike = ? WHERE belong = ? AND createBy = ?`,[isLike, belong,createBy]);
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
    let { belong,createBy } = params;
    let data = await this.app.mysql.query(`SELECT * FROM likes WHERE belong = ? AND createBy = ?;`,[belong,createBy]);
    if(data.length > 0 && data[0].isLike == '1'){
      return true;
    }
    return false;
  }
  /**
   * 获取文章-用户是否有点赞记录
  */
   async getHasLike(params) {
    let { belong,createBy } = params;
    let data = await this.app.mysql.query(`SELECT * FROM likes WHERE belong = ? AND createBy = ?;`,[belong,createBy]);
    if(data.length > 0){
      return true;
    }
    return false;
  }
  /**
   * 获取文件上传目录
   * @param {*} filename
   */
   async getUploadFile(filename) {
    // 1.获取当前日期
    let day = sd.format(new Date(), 'YYYYMMDD');
    // 2.创建图片保存的路径
    let dir = path.join(this.config.uploadDir, "images");
    await mkdirp(dir); // 不存在就创建目录
    let date = Date.now(); // 毫秒数
    // 返回图片保存的路径
    let uploadDir = path.join(dir, day+'-'+date + path.extname(filename));
    console.log('文件路径----', uploadDir)
    // app\public\avatar\upload\20200312\1536895331666.png
    return {
      uploadDir,
      saveDir: this.ctx.origin +"/upload/"+ day+'-'+date + path.extname(filename)
    }
  }
}
module.exports = ArticleService;
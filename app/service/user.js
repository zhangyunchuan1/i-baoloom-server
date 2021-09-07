const Service = require('egg').Service;
const uuid = require('uuid/v1');
const moment = require('moment');

class UserService extends Service {
  async find() {
    let data = await this.app.mysql.query('SELECT * FROM user');
    console.log('查询结果',data)
    return data
  }
  /**
   * 根据用户名查询用户是否存在
  */
  async findUserByName(userName) {
    let data = await this.app.mysql.query('SELECT * FROM user WHERE userName = ?',userName);
    console.log('查询结果',data)
    return data
  }
  /**
   * 根据邮箱查询用户是否存在
  */
   async findUserByEmail(email) {
    let data = await this.app.mysql.query('SELECT * FROM user WHERE email = ?',email);
    console.log('查询结果',data)
    return data
  }
  /**
   * 根据id查询用户是否存在
  */
   async findUserById(id) {
    let data = await this.app.mysql.query(`
      SELECT id, userName, avatar, visits, 
      (SELECT COUNT(*) FROM article WHERE createBy = ?) AS articleTotal
      FROM user 
      WHERE id = ?
    `,[id, id]);
    console.log('查询结果',data)
    return data
  }
  /**
   * 注册用户
  */
  async registerUser(params) {
    let { userName, password, email } = params;
    //生成用户唯一ID
    const id = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('user', {id,userName,createTime,password,email});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 添加访问量
  */
   async addVisits(id) {
    let result = await this.app.mysql.query(`UPDATE user SET visits=visits+1 WHERE id = ?`,id);
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
  /**
   * 关注用户/取消关注
  */
  async followUser(params) {
    let { userId, type, createBy } = params;
    console.log(userId, type, createBy)
    if(type === "1"){
      //关注
      //生成用户唯一ID
      const id = uuid();
      let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
      let result = await this.app.mysql.insert('fans', {id, belong:userId, createBy, createTime});
      if(result.affectedRows != 1){
        return false
      }
      return true
    }else if(type === "2"){
      //取消关注
      let result = await this.app.mysql.delete('fans', {
        belong: userId,
        createBy: createBy
      });
      if(result.affectedRows != 1){
        return false
      }
      return true
    }
  }
  /**
   * 获取用户关注数量
  */
  async getFansNum(belong){
    let data = await this.app.mysql.query('SELECT COUNT(*) FROM fans WHERE belong = ?',belong);
    console.log('查询结果',data)
    return data[0]["COUNT(*)"]
  }
  /**
   * 获取用户是否关注某人
  */
   async getIsFollow(params) {
    let { belong,createBy } = params;
    console.log('查询结果',belong,createBy)
    let data = await this.app.mysql.query(`SELECT * FROM fans WHERE belong = ? AND createBy = ?;`,[belong,createBy]);
    if(data.length > 0){
      return true;
    }
    return false;
  }
}
module.exports = UserService;
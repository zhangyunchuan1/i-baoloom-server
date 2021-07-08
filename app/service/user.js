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
}
module.exports = UserService;
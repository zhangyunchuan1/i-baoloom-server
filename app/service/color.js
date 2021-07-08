const Service = require('egg').Service;
const uuid = require('uuid/v1');
const moment = require('moment');

class ColorService extends Service {
  /**
   * 查询推荐色卡
  */
  async queryRecommendColor() {
    let data = await this.app.mysql.query(`SELECT * FROM color_card WHERE type = 1`);
    return data
  }
  /**
   * 查询我的色卡
  */
   async queryMyColor(createBy) {
    let data = await this.app.mysql.query(`SELECT * FROM color_card WHERE createBy = ?`, createBy);
    return data
  }
  /**
   * 新增色卡
  */
   async addColorCard(params) {
    let { title, colors, type, createBy } = params;
    //唯一ID
    const id = uuid();
    let createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('color_card', {id, title, colors, type, createTime, createBy});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
}

module.exports = ColorService;
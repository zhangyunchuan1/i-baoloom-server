const Service = require('egg').Service;
const uuid = require('uuid/v1');
const moment = require('moment');

class ToolService extends Service {
  /**
   * 查询所有工具
  */
   async queryAllTool() {
    let data = await this.app.mysql.query(`SELECT * FROM tool`);
    return data
  }
  /**
   * 查询我订阅的工具
  */
   async queryMyTool(userId) {
    let data = await this.app.mysql.query(`
    SELECT a.id,b.title,b.describe,b.img,a.toolId,b.path,b.icon,b.selectedIcon
    FROM user_tool a 
    JOIN tool b
    ON a.toolId = b.id AND a.userId = ?`, userId);
    return data
  }
  /**
   * 订阅工具
  */
   async subscribeTools(params) {
    let { toolId, userId } = params;
    const uid = uuid();
    let updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.app.mysql.insert('user_tool', {id:uid,toolId:toolId,updateTime,userId:userId});
    if(result.affectedRows != 1){
      return false
    }
    return true
  }
}

module.exports = ToolService;
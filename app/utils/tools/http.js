//接口相关公共函数

class Http {
  /**
   * @param ctx 上下闻对象
   * 返回response数据格式封装
   * @param status 响应状态 {
   *    200:返回成功，
   *    201:返回登录失效，
   *    202:返回未登录，
   *    500:服务端报错，
   * }
   * @param data 响应数据
   * @param message 响应提示
   * @returns {*}
  */
  static response(status = 200,data = null,message = '') {
    let response = {
      status,
      data,
      message
    }
    return response;
  }

  /**
   * 校验参数是否必填
   * @param params 参数对象
   * @param rule 必填字段 {age:true,name:true}
   * @returns {*}
  */
  static checkParams(params,rule) {
    let err = {
      status:true,
      message:`校验通过！`
    };
    for (let key in rule) {
      if(rule[key]){
        if(!params[key] && params[key] != ''){
          err = {
            status:false,
            message:`${key}字段为必传参数！`
          };
          break;
        }
      }
    }
    console.log('校验结果：',err);
    return err;
  }
}

module.exports = Http;
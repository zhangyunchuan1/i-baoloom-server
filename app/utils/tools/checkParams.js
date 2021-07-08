
/**
 * 工具函数
 * 校验参数是否必传
 * @param:{
 *    rule:{
 *      userName:true,  //代表必传
 *      age:false，  //代表不必传
 *    }
 * }
*/

const checkParams = function (rule,params) {
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
        return err;
      }
    }
  }
  return err;
}

module.exports = checkParams;
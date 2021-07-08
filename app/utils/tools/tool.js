/**
 * 去除字符串中所有空格
*/

const removeSpace = function(str) {
    let newStr = str.replace(/\s*/g, '');
    return newStr;
}
/**
* 随机生成6位数验证码
*/
const createSixNum = function(){
  var Num="";
  for(var i=0;i<6;i++)
  {
      Num+=Math.floor(Math.random()*10);
  }
  return Num;
}
module.exports = {
  removeSpace,
  createSixNum
}
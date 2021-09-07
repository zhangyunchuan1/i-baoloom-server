const jwt = require('jsonwebtoken'); 
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
/**
* 解密token，获取用户Id
*/
const jwtToken = (authToken) => {
  let userId = "";
  if(authToken){
    let decoded = null;
    try {
      //解密token
      decoded = jwt.verify(authToken, 'anyStr',{ expiresIn: '1h' });
      if(decoded){
        userId = decoded.id
      }
    } catch (error) {}
  }
  return userId;
}

module.exports = {
  removeSpace,
  createSixNum,
  jwtToken
}



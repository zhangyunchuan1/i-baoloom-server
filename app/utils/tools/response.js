/**
 * 工具函数
 * 接口返回response
 * @param
*/

const response = function (status = 200,data = null,message = '') {
  let response = {
    status,
    data,
    message
  }
  return response;
}

module.exports = response;
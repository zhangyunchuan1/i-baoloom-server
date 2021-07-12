'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, get';
  }
  async test() {
    const { ctx } = this;
    ctx.body = 'hi, post';
  }
}

module.exports = HomeController;

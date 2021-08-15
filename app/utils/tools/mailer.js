  
const nodemailer = require('nodemailer');

// 开启一个 SMTP 连接池
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // use SSL
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: '1028580665@qq.com',
        pass: 'jgoxrkbzhseobdee' // QQ邮箱需要使用授权码
    }
});

module.exports = function sendEmail(person,html){
  // 设置邮件内容（谁发送什么给谁）
  let mailOptions = {
    from: '"i-baoloom" <1028580665@qq.com>', // 发件人
    to: person, // 收件人
    subject: 'i-baoloom 验证码', // 主题
    text: '这是一封来自 i-baoloom 的验证邮件', // plain text body
    html: html, // html body  <b>您的验证码为：${code}</b>
    // 下面是发送附件，不需要就注释掉
    // attachments: [{
    //         filename: 'test.md',
    //         path: './test.md'
    //     },
    //     {
    //         filename: 'content',
    //         content: '发送内容'
    //     }
    // ]
  };
  // 使用先前创建的传输器的 sendMail 方法传递消息对象
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log(`Message: ${info.messageId}`);
    console.log(`sent: ${info.response}`);
  });
}
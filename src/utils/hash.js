const md5 = require('md5')
const hash = () => md5(Math.random())+md5(new Date() - 0)
module.exports = hash

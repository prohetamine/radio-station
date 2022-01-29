const md5 = require('md5')
const hash = name => md5(name)
module.exports = hash

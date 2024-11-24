let host = `${process.env.MYSQL_HOST}`
let port = `${process.env.MYSQL_PORT}`
let user = `${process.env.MYSQL_USER}`
let password = `${process.env.MYSQL_PASS}`
let database = `${process.env.MYSQL_NAME}`
module.exports = {
    database: {
        host: host,
        user: user,
        password: password,
        database: database,
    }

};
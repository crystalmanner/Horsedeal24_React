require('dotenv').config()
module.exports = {
  development: {
    // username: 'database_dev',
    // password: 'database_dev',
    // database: 'database_dev',
    // host: '127.0.0.1',
    // dialect: 'mysql'
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
  },
  test: {
    // username: 'database_test',
    // password: null,
    // database: 'database_test',
    // host: '127.0.0.1',
    // dialect: 'mysql'
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    // ssl: true,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // },
  },
  production: {
    // username: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // host: process.env.DB_HOSTNAME,
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    // dialectOptions: {
    //   ssl: {
    //     ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
    //   }
    // }
  }
};

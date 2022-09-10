const mongoose = require('mongoose');
const { now } = require('../server');

const connect = () => {
    if (process.env.NODE_ENV != 'production') {
        mongoose.set('debug', true)
    }

    mongoose.connect('mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PW + '@localhost:27017/admin', {
        dbName: 'stardue64',
        useNewUrlParser: true,
    }, (err) => {
        if (err) {
            console.error(now() + 'failed to connect to mongodb');
        } else {
            console.log('successfully connected to mongodb');
        }
    })
}
mongoose.connection.on('error', (err) => {
    console.log(now() + 'mongodb connection error', err);
});

mongoose.connection.on('disconnected', () => {
    console.log(now() + 'disconnected to mongodb. retry to connect.');
    connect();
});

module.exports = connect;
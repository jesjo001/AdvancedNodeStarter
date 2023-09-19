// const mongoose = require('mongoose')
// const redis = require('redis');
// const util = require('util');

// const redisUrl = 'redis://127.0.0.1:6379'
// const client = redis.createClient(redisUrl);
// client.get = util.promisify(client.get);

// const exec = mongoose.Query.prototype.exec;

// mongoose.Query.prototype.cache = function(query) {
//     this.useCache =  true;
//     return this;
// }

// mongoose.Query.prototype.exec = async function() {

//     if(!this.useCache) return exec.apply(this, arguments)

//     const key = Object.assign({}, this.getQuery(), {
//         collection: this.mongooseCollection.name
//     })
//     // TODO: if key exist then return cached value

//     const cachedValue = await client.get(key)

//     if(cachedValue) {
//         const doc = JSON.parse(cachedValue)

//         Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(JSON.parse(cachedValue))
        
//         console.log(this)
//         return JSON.parse(cachedValue)
//     }

//     console.log(key)
//     const result =  await exec.apply(this, arguments)
//     client.set(key, JSON.stringify(result), 'EX', 10 )
//     return result
// }


const mongoose = require('mongoose')
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

// const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache =  true;
    this.hashKey = JSON.stringify(options.key || '')

    return this;
}

mongoose.Query.prototype.exec = async function() {

    let operation = this.op

    console.log('operation', operation)
    console.log('this.op', this.op)

    if(!this.useCache) return exec.apply(this, arguments)


    const key = Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    })
    // TODO: if key exist then return cached value

    const cachedValue = await client.hget(this.hashkey, key)
    console.log("cached value: " , cachedValue)

    if(cachedValue) {
        const doc = JSON.parse(cachedValue)

        return Array.isArray(doc) ? 
        doc.map(d => new this.model(d)) 
        : new this.model(doc)
        
    }

    console.log(key);
    const result =  await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result
}

module.exports = {
    clearHash(hashKey){
      client.del(JSON.stringify(hashKey));
    }
}
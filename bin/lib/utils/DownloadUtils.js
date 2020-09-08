const fs = require('fs');
const axios = require('axios');

async function downloadImage (url, destination) {
    const writer = fs.createWriteStream(destination)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

exports.downloadImage = this.downloadImage
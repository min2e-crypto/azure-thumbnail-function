const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');

module.exports = async function (context, inputBlob) {
  const blobName = context.bindingData.name;
  context.log('Processing:', blobName);

  try {
    const thumbnail = await sharp(inputBlob).resize(200, 200).toBuffer();

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );

    const containerClient = blobServiceClient.getContainerClient('thumbnails');
    await containerClient.createIfNotExists();

    const thumbnailName = 'thumb_' + blobName;
    const blockBlobClient = containerClient.getBlockBlobClient(thumbnailName);

    await blockBlobClient.upload(thumbnail, thumbnail.length);

    context.log('Success:', thumbnailName);
  } catch (error) {
    context.log.error('Error:', error.message);
    throw error;
  }
};

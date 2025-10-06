const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');

module.exports = async function (context, inputBlob) {
  const blobName = context.bindingData.name;
  context.log('Processing:', blobName);

  try {
    const thumbnail = await sharp(inputBlob)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );

    const containerClient = blobServiceClient.getContainerClient('thumbnails');
    await containerClient.createIfNotExists();

    const thumbnailName = 'thumb_' + blobName;
    const blockBlobClient = containerClient.getBlockBlobClient(thumbnailName);

    await blockBlobClient.upload(thumbnail, thumbnail.length, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' },
    });

    context.log('Success!', thumbnailName);
    return { status: 'success', filename: thumbnailName };
  } catch (error) {
    context.log.error('Error details:', error);
    throw error;
  }
};

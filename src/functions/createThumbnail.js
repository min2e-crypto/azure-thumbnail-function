const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');

// Blob Storage Trigger로 이미지 업로드 감지 및 썸네일 생성
app.storageBlob('createThumbnail', {
    path: 'images/{name}',
    connection: 'AzureWebJobsStorage',
    handler: async (blob, context) => {
        context.log(`Processing blob: ${context.triggerMetadata.name}`);
        
        try {
            const blobName = context.triggerMetadata.name;
            const connectionString = process.env.AzureWebJobsStorage;
            
            // 이미지 리사이징
            const thumbnail = await sharp(blob)
                .resize(200, 200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
            
            // thumbnails 컨테이너에 저장
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('thumbnails');
            
            // 컨테이너가 없으면 생성
            await containerClient.createIfNotExists({
                access: 'blob'
            });
            
            const thumbnailBlobName = `thumb_${blobName}`;
            const blockBlobClient = containerClient.getBlockBlobClient(thumbnailBlobName);
            
            await blockBlobClient.upload(thumbnail, thumbnail.length, {
                blobHTTPHeaders: {
                    blobContentType: 'image/jpeg'
                }
            });
            
            context.log(`Thumbnail created: ${thumbnailBlobName}`);
        } catch (error) {
            context.error(`Error processing blob: ${error.message}`);
            throw error;
        }
    }
});
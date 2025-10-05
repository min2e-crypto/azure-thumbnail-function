const sharp = require('sharp');

module.exports = async function (context, inputBlob) {
    const fileName = context.bindingData.name;
  
    context.log('Processing file:', fileName);
    context.log('File size:', inputBlob.length, 'bytes');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const isImage = imageExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
    );
    
    if (!isImage) {
        context.log('Not an image file, skipping...');
        return;
    }
    
    try {
        const thumbnail = await sharp(inputBlob)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 80
            })
            .toBuffer();
        
        context.bindings.outputBlob = thumbnail;
        
        context.log('Thumbnail created successfully for:', fileName);
        context.log('Thumbnail size:', thumbnail.length, 'bytes');
    } catch (error) {
        context.log.error('Error creating thumbnail:', error.message);
        throw error;
    }
};
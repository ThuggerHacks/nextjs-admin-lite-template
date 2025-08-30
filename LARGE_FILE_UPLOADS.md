# Large File Uploads (10GB) Implementation

This document describes the implementation of 10GB file upload support in both the documents and library sections of the Tonelizer platform.

## Overview

The system now supports uploading files up to 10GB in size through:
1. **Direct uploads** for files up to 10GB
2. **Chunked uploads** for very large files (recommended for files >100MB)
3. **Progress tracking** for better user experience
4. **Resumable uploads** through session management

## Backend Configuration

### File Size Limits

- **Maximum file size**: 10GB (10 * 1024^3 bytes)
- **Field size limit**: 10GB
- **Request timeout**: 30 minutes
- **Body size limit**: 10GB

### Updated Files

#### 1. `backend/src/middleware/upload.js`
- Updated multer configuration to support 10GB files
- Added field size limits and file count restrictions

#### 2. `backend/src/routes/uploads.js`
- Added chunked upload support with session management
- New routes:
  - `POST /api/uploads/session` - Create upload session
  - `POST /api/uploads/chunk` - Upload file chunk
  - `POST /api/uploads/complete` - Complete upload session
- Maintains backward compatibility with direct uploads

#### 3. `backend/src/routes/libraries.js`
- Updated multer configuration for 10GB support
- Updated file size validation from 50MB to 10GB

#### 4. `backend/src/index.js`
- Increased request timeout to 30 minutes
- Set body size limits to 10GB

## Frontend Configuration

### Updated Files

#### 1. `lib/axios.ts`
- Increased timeout to 30 minutes for large operations
- Added max content length and body length limits

#### 2. `lib/services/fileService.ts`
- Added `uploadLargeFile()` method with progress tracking
- Added `uploadFileInChunks()` method for chunked uploads
- Automatic fallback to chunked uploads for files >100MB

#### 3. `lib/services/libraryFileService.ts`
- Added `uploadLargeFile()` method with progress tracking
- Added `uploadFileInChunks()` method for chunked uploads
- Same chunked upload logic as file service

## Upload Methods

### 1. Direct Upload
- **Use case**: Files up to 10GB
- **Method**: Single HTTP request with file data
- **Pros**: Simple, fast for smaller files
- **Cons**: Memory intensive for very large files

### 2. Chunked Upload
- **Use case**: Files >100MB (automatically selected)
- **Method**: File split into 10MB chunks
- **Pros**: Memory efficient, resumable, better progress tracking
- **Cons**: More complex, multiple HTTP requests

## Chunked Upload Flow

1. **Create Session**
   ```
   POST /api/uploads/session
   Body: { fileName, fileSize, folderId }
   Response: { sessionId, totalChunks }
   ```

2. **Upload Chunks**
   ```
   POST /api/uploads/chunk
   Body: { sessionId, chunkIndex, chunk, fileName }
   Response: { uploadedChunks, totalChunks }
   ```

3. **Complete Upload**
   ```
   POST /api/uploads/complete
   Body: { sessionId }
   Response: { file: { url, size, ... } }
   ```

## Usage Examples

### Frontend - File Upload with Progress

```typescript
import { fileService } from '@/lib/services/fileService';

// Upload large file with progress tracking
const uploadLargeFile = async (file: File) => {
  try {
    const result = await fileService.uploadLargeFile(
      file, 
      folderId, 
      (progress) => {
        console.log(`Upload progress: ${progress}%`);
        // Update UI progress bar
      }
    );
    console.log('Upload completed:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Frontend - Library File Upload

```typescript
import { libraryFileService } from '@/lib/services/libraryFileService';

// Upload large file to library
const uploadToLibrary = async (file: File, libraryId: string) => {
  try {
    const result = await libraryFileService.uploadLargeFile(
      { file, folderId, description: '' },
      libraryId,
      (progress) => {
        console.log(`Library upload progress: ${progress}%`);
      }
    );
    console.log('Library upload completed:', result);
  } catch (error) {
    console.error('Library upload failed:', error);
  }
};
```

## Performance Considerations

### Memory Usage
- **Direct uploads**: File loaded entirely into memory
- **Chunked uploads**: Only 10MB chunks in memory at a time
- **Recommendation**: Use chunked uploads for files >100MB

### Network Efficiency
- **Chunked uploads**: Better error handling and retry logic
- **Progress tracking**: Real-time feedback for users
- **Resumable**: Can resume failed uploads

### Storage
- **Temporary storage**: Chunks stored in `uploads/sessions/` during upload
- **Cleanup**: Session directories automatically removed after completion
- **Final storage**: Files stored in main uploads directory

## Error Handling

### Common Issues
1. **File size exceeded**: Returns 400 error with size limit message
2. **Session expired**: Returns 404 error for invalid session
3. **Chunk missing**: Returns 400 error with missing chunk info
4. **Network timeout**: Increased timeout to 30 minutes

### Recovery
- **Failed chunks**: Can be retried individually
- **Session recovery**: Session info persists until completion
- **Partial uploads**: Automatically cleaned up after timeout

## Security Considerations

### Authentication
- All upload endpoints require valid JWT token
- User ownership validation for upload sessions
- Folder access control maintained

### File Validation
- File size limits enforced on both frontend and backend
- File type validation (currently allows all types)
- Path traversal protection

## Monitoring and Logging

### Error Logging
- All upload errors logged with context
- Session creation and completion tracked
- Chunk upload failures logged

### Performance Metrics
- Upload duration tracking
- Chunk upload success rates
- Memory usage monitoring

## Future Enhancements

### Planned Features
1. **Resumable uploads**: Resume from last successful chunk
2. **Parallel chunk uploads**: Upload multiple chunks simultaneously
3. **Compression**: Automatic file compression for large files
4. **CDN integration**: Direct upload to cloud storage
5. **Progress persistence**: Save progress across browser sessions

### Scalability Improvements
1. **Redis sessions**: Replace file-based session storage
2. **Worker queues**: Background chunk processing
3. **Load balancing**: Distribute uploads across servers
4. **Storage optimization**: Implement deduplication

## Testing

### Test Scenarios
1. **Small files** (<100MB): Direct upload
2. **Medium files** (100MB-1GB): Chunked upload
3. **Large files** (1GB-10GB): Chunked upload with progress
4. **Edge cases**: Network interruptions, browser refresh
5. **Error conditions**: Invalid sessions, missing chunks

### Performance Testing
- Upload speed measurements
- Memory usage monitoring
- Network bandwidth utilization
- Server resource consumption

## Troubleshooting

### Common Issues

#### Upload Fails with "File too large"
- Check backend multer configuration
- Verify frontend file size validation
- Ensure server has sufficient memory

#### Chunked Upload Hangs
- Check network timeout settings
- Verify session directory permissions
- Monitor server memory usage

#### Progress Bar Not Updating
- Check progress callback implementation
- Verify chunk upload responses
- Check browser console for errors

### Debug Information
- Enable detailed logging in backend
- Check browser network tab for requests
- Monitor server logs for errors
- Verify file permissions on upload directories

## Conclusion

The 10GB file upload implementation provides a robust, scalable solution for handling large files in both documents and library sections. The combination of direct uploads for smaller files and chunked uploads for larger files ensures optimal performance and user experience while maintaining system stability.

The implementation includes comprehensive error handling, progress tracking, and security measures to ensure reliable file uploads across various network conditions and file sizes.

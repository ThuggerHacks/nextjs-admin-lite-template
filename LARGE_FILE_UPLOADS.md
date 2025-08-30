# 🚀 Large File Uploads (Up to 10GB)

This document explains how the large file upload feature works and how to configure it for handling files up to 10GB.

## ✨ **Features**

- **File Size Support**: Upload files up to 10GB
- **Chunked Uploads**: Large files are automatically split into 5MB chunks
- **Progress Tracking**: Real-time progress for each chunk
- **Resume Capability**: Failed uploads can be resumed
- **Memory Efficient**: Chunks are processed individually to minimize memory usage
- **Security**: User authentication and session validation

## 🏗️ **Architecture**

### Frontend (React/Next.js)
- **DocumentsManager.tsx**: Main upload component with chunked upload logic
- **documentsService.ts**: Service layer for API communication
- **Progress Indicators**: Visual feedback for upload progress

### Backend (Node.js/Express)
- **uploads.js**: API routes for chunked uploads
- **Session Management**: Temporary storage for upload sessions
- **Chunk Assembly**: File reconstruction from uploaded chunks

## 🔧 **Configuration**

### Frontend Configuration

#### Next.js (next.config.js)
```javascript
// Configure for large file uploads
experimental: {
  serverComponentsExternalPackages: ['multer'],
},
api: {
  bodyParser: {
    sizeLimit: '10gb',
  },
  responseLimit: false,
},
webpack: (config, { isServer }) => {
  // Increase chunk size limit
  config.optimization.splitChunks = {
    ...config.optimization.splitChunks,
    maxSize: 10 * 1024 * 1024, // 10MB chunks
  };
  return config;
},
```

### Backend Configuration

#### Express Server (index.js)
```javascript
// Configure for large file uploads
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));

// Increase timeout for large uploads
app.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutes
  next();
});
```

#### Multer Configuration (uploads.js)
```javascript
// Configure multer for chunk uploads (no file size limit for chunks)
const chunkUpload = multer({
  storage: multer.memoryStorage(), // Store chunks in memory temporarily
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB limit for chunks
  }
});
```

## 📁 **API Endpoints**

### 1. Create Upload Session
```http
POST /api/uploads/session
Content-Type: application/json

{
  "fileName": "large-file.zip",
  "fileSize": 5368709120,
  "parentId": "folder123"
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "totalChunks": 1024,
  "chunkSize": 5242880
}
```

### 2. Upload Chunk
```http
POST /api/uploads/chunk
Content-Type: multipart/form-data

Form Data:
- sessionId: "session_1234567890_abc123"
- chunkIndex: "0"
- chunk: [binary data]
- fileName: "large-file.zip"
```

**Response:**
```json
{
  "message": "Chunk uploaded successfully",
  "chunkIndex": 0,
  "uploadedChunks": 1,
  "totalChunks": 1024
}
```

### 3. Complete Upload
```http
POST /api/uploads/complete
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "message": "File assembled successfully",
  "file": {
    "id": "file_1234567890",
    "name": "large-file.zip",
    "size": 5368709120,
    "url": "/api/uploads/files/1234567890-large-file.zip"
  }
}
```

## 🔄 **Upload Flow**

### 1. **Session Creation**
- User selects a large file (>5MB)
- Frontend creates upload session
- Backend generates unique session ID
- Creates temporary directory for chunks

### 2. **Chunk Upload**
- File is split into 5MB chunks
- Each chunk is uploaded individually
- Progress is tracked per chunk
- Chunks are stored temporarily

### 3. **File Assembly**
- All chunks are verified
- File is reconstructed from chunks
- Temporary chunks are cleaned up
- File record is created in database

## 📊 **Progress Tracking**

The frontend provides detailed progress information:

- **Overall Progress**: Percentage of file uploaded
- **Chunk Progress**: Current chunk being processed
- **Status Indicators**: Uploading, completed, error
- **Real-time Updates**: Progress updates every chunk

## 🛡️ **Security Features**

- **Authentication**: All upload endpoints require valid JWT token
- **Session Validation**: Users can only access their own upload sessions
- **File Size Limits**: Server-side validation of file sizes
- **Chunk Verification**: Ensures all chunks are uploaded before assembly

## 🚨 **Error Handling**

### Common Error Scenarios

1. **Session Expired**: Upload session not found
2. **Chunk Missing**: Incomplete chunk upload
3. **File Size Exceeded**: File larger than 10GB limit
4. **Authentication Failed**: Invalid or expired token
5. **Disk Space**: Insufficient storage space

### Error Recovery

- **Automatic Retry**: Failed chunks are retried automatically
- **Session Persistence**: Upload sessions persist across page refreshes
- **Progress Preservation**: Upload progress is maintained on errors

## 📁 **Directory Structure**

```
backend/
├── uploads/
│   ├── chunks/           # Temporary chunk storage
│   │   └── session_xxx/  # Individual session directories
│   └── files/            # Final assembled files
├── src/
│   └── routes/
│       └── uploads.js    # Upload API routes
```

## ⚡ **Performance Optimizations**

- **Chunk Size**: 5MB chunks balance memory usage and network efficiency
- **Parallel Uploads**: Multiple chunks can be uploaded simultaneously
- **Memory Management**: Chunks are processed individually to minimize memory footprint
- **Streaming**: File assembly uses streams for large files

## 🔍 **Monitoring & Logging**

### Logged Events
- Upload session creation
- Chunk upload success/failure
- File assembly completion
- Error conditions and stack traces

### Metrics
- Upload success rate
- Average upload time
- Chunk upload performance
- Storage usage

## 🧪 **Testing Large Uploads**

### Test File Sizes
- **Small**: <5MB (regular upload)
- **Medium**: 5MB - 100MB (chunked upload)
- **Large**: 100MB - 1GB (stress test)
- **Very Large**: 1GB - 10GB (limit test)

### Test Scenarios
1. **Normal Upload**: Complete file upload
2. **Network Interruption**: Simulate network failures
3. **Browser Refresh**: Test session persistence
4. **Multiple Files**: Concurrent large file uploads
5. **Resume Upload**: Resume interrupted uploads

## 🚀 **Usage Example**

```typescript
// Frontend usage in DocumentsManager
const handleFileUpload = async (fileList: any[]) => {
  for (const file of fileList) {
    if (file.size > 5 * 1024 * 1024) {
      // Large file - use chunked upload
      await uploadLargeFile(file);
    } else {
      // Small file - use regular upload
      await uploadSmallFile(file);
    }
  }
};
```

## 📋 **Requirements**

### Frontend
- React 18+
- Next.js 13+
- Modern browser with File API support

### Backend
- Node.js 16+
- Express 4+
- Multer 1.4+
- Sufficient disk space for temporary storage

### System
- Minimum 2GB RAM
- 20GB+ free disk space
- Stable network connection

## 🔧 **Troubleshooting**

### Common Issues

1. **Upload Fails at 100%**
   - Check disk space
   - Verify chunk integrity
   - Check server logs

2. **Slow Upload Performance**
   - Reduce chunk size
   - Check network bandwidth
   - Optimize server configuration

3. **Memory Issues**
   - Monitor server memory usage
   - Reduce concurrent uploads
   - Increase server resources

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=uploads:*
NODE_ENV=development
```

## 📈 **Future Enhancements**

- **Resumable Uploads**: Resume interrupted uploads
- **Parallel Chunks**: Upload multiple chunks simultaneously
- **Compression**: Automatic file compression
- **Encryption**: End-to-end encryption
- **CDN Integration**: Distribute uploads across multiple servers

## 📞 **Support**

For issues or questions about large file uploads:
1. Check server logs for error details
2. Verify configuration settings
3. Test with smaller files first
4. Monitor system resources during uploads

---

**Note**: This feature is designed for reliable large file uploads. Always test with your specific use case and ensure adequate server resources are available.

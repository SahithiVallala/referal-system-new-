// backend/blobStorage.js
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

class BlobStorageSync {
  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT || 'emailstorage14206';
    this.accountKey = process.env.AZURE_STORAGE_KEY;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'referal-data';
    this.blobName = 'tracker.db';
    this.localDbPath = path.join(__dirname, 'tracker.db');
    this.enabled = !!this.accountKey;
    
    if (this.enabled) {
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${this.accountName};AccountKey=${this.accountKey};EndpointSuffix=core.windows.net`;
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      this.blobClient = this.containerClient.getBlobClient(this.blobName);
      this.blockBlobClient = this.blobClient.getBlockBlobClient();
      console.log('✅ Azure Blob Storage configured for data persistence');
    } else {
      console.log('⚠️  Azure Storage Key not provided - running in ephemeral mode');
    }
  }

  async initialize() {
    if (!this.enabled) return;
    
    try {
      // Create container if it doesn't exist
      await this.containerClient.createIfNotExists();
      
      // Download existing database if available
      await this.downloadDatabase();
      
      // Start auto-sync every 30 seconds
      this.startAutoSync();
      
      console.log('✅ Blob Storage initialized - data will persist across restarts');
    } catch (error) {
      console.error('⚠️  Blob Storage initialization failed:', error.message);
      console.log('⚠️  Continuing with local storage only (ephemeral)');
      this.enabled = false;
    }
  }

  async downloadDatabase() {
    if (!this.enabled) return;
    
    try {
      // Check if blob exists
      const exists = await this.blobClient.exists();
      
      if (exists) {
        // Download the database file
        await this.blobClient.downloadToFile(this.localDbPath);
        const stats = fs.statSync(this.localDbPath);
        console.log(`📥 Downloaded database from Blob Storage (${stats.size} bytes)`);
      } else {
        console.log('📝 No existing database in Blob Storage - will create new one');
      }
    } catch (error) {
      console.error('⚠️  Failed to download database:', error.message);
    }
  }

  async uploadDatabase() {
    if (!this.enabled) return;
    
    try {
      // Check if local database exists
      if (!fs.existsSync(this.localDbPath)) {
        return;
      }

      // Upload the database file
      await this.blockBlobClient.uploadFile(this.localDbPath, {
        blobHTTPHeaders: { blobContentType: 'application/x-sqlite3' }
      });
      
      const stats = fs.statSync(this.localDbPath);
      if (process.env.VERBOSE === 'true') {
        console.log(`📤 Uploaded database to Blob Storage (${stats.size} bytes)`);
      }
    } catch (error) {
      console.error('⚠️  Failed to upload database:', error.message);
    }
  }

  startAutoSync() {
    if (!this.enabled) return;
    
    // Upload database every 30 seconds
    this.syncInterval = setInterval(() => {
      this.uploadDatabase();
    }, 30000); // 30 seconds
    
    // Also upload on process exit
    process.on('SIGTERM', async () => {
      console.log('📤 Final database sync before shutdown...');
      await this.uploadDatabase();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('📤 Final database sync before shutdown...');
      await this.uploadDatabase();
      process.exit(0);
    });
  }

  async manualSync() {
    return this.uploadDatabase();
  }
}

module.exports = new BlobStorageSync();

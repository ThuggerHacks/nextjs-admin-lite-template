const prisma = require('./prisma');

class CurrentSucursal {
  constructor() {
    this.info = null;
    this.lastFetch = null;
    this.fetchInterval = 5 * 60 * 1000; // 5 minutes
  }

  async getInfo() {
    const now = Date.now();
    
    if (!this.info || !this.lastFetch || (now - this.lastFetch) > this.fetchInterval) {
      await this.fetchInfo();
    }
    
    return this.info;
  }

  async fetchInfo() {
    try {
      // Get sucursal name from environment variable or use a default
      const sucursalName = process.env.SUCURSAL_NAME || 'Default Sucursal';
      
      const sucursal = await prisma.sucursal.findUnique({
        where: { name: sucursalName }
      });
      
      if (sucursal) {
        this.info = sucursal;
        this.lastFetch = Date.now();
        console.log(`Current sucursal loaded: ${sucursal.name} (${sucursal.id})`);
      } else {
        console.error(`No sucursal found with name: ${sucursalName}`);
        console.error('Please run the initialization script or check your database.');
        throw new Error(`Sucursal not configured. No sucursal found with name: ${sucursalName}`);
      }
    } catch (error) {
      console.error('Error fetching current sucursal info:', error);
      throw error;
    }
  }

  async setInfo(sucursalInfo) {
    this.info = sucursalInfo;
    this.lastFetch = Date.now();
  }

  getSucursalId() {
    return this.info?.id;
  }

  getSucursalName() {
    return this.info?.name;
  }

  getServerUrl() {
    return this.info?.serverUrl;
  }
}

const currentSucursal = new CurrentSucursal();

module.exports = currentSucursal; 
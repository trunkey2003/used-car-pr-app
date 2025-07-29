const cds = require('@sap/cds');

module.exports = cds.service.impl('PRService', async function () {
  const { PurchaseRequisition, MaterialMaster, Plant, StorageLocation, PurchasingGroup, PurchasingDocumentType } = cds.entities('usedcar');

  this.before(['CREATE', 'UPDATE'], PurchaseRequisition, async (req) => {
    console.log('=== PurchaseRequisition BEFORE handler triggered ===');
    console.log('Operation:', req.method);
    console.log('Request data:', JSON.stringify(req.data, null, 2));

    const { Material, Plant: plantCode, StorageLocation: storageLocation, PurchasingGroup: group, PurchaseRequisitionType } = req.data;
    
    console.log('Extracted values:');
    console.log(`- Material: ${Material}`);
    console.log(`- Plant: ${plantCode}`);
    console.log(`- StorageLocation: ${storageLocation}`);
    console.log(`- PurchasingGroup: ${group}`);
    console.log(`- PurchaseRequisitionType: ${PurchaseRequisitionType}`);

    const db = cds.transaction(req);

    try {
      // Check Material
      console.log('Checking Material...');
      const materialExists = await db.exists(MaterialMaster).where({ Material });
      console.log(`Material exists: ${materialExists}`);
      if (!materialExists) {
        console.log(`Material validation failed for: ${Material}`);
        req.error(400, `Material '${Material}' does not exist.`);
      }

      // Check Plant
      console.log('Checking Plant...');
      const plantExists = await db.exists(Plant).where({ Plant: plantCode });
      console.log(`Plant exists: ${plantExists}`);
      if (!plantExists) {
        console.log(`Plant validation failed for: ${plantCode}`);
        req.error(400, `Plant '${plantCode}' does not exist.`);
      }

      // This is your target log
      console.log(`Query plant: ${plantCode} & storageLocation: ${storageLocation}`);
      
      // Check Storage Location
      console.log('Checking StorageLocation...');
      const storageExists = await db.exists(StorageLocation).where({ Plant: plantCode, StorageLocation: storageLocation });
      console.log(`StorageLocation exists: ${storageExists}`);
      if (!storageExists) {
        console.log(`StorageLocation validation failed for: ${storageLocation} in plant: ${plantCode}`);
        req.error(400, `Storage Location '${storageLocation}' does not exist for Plant '${plantCode}'.`);
      }

      // Check Purchasing Group
      console.log('Checking PurchasingGroup...');
      const groupExists = await db.exists(PurchasingGroup).where({ PurchasingGroup: group });
      console.log(`PurchasingGroup exists: ${groupExists}`);
      if (!groupExists) {
        console.log(`PurchasingGroup validation failed for: ${group}`);
        req.error(400, `Purchasing Group '${group}' does not exist.`);
      }

      // Check Purchase Requisition Type
      console.log('Checking PurchaseRequisitionType...');
      const typeExists = await db.exists(PurchasingDocumentType).where({ DocumentType: PurchaseRequisitionType });
      console.log(`PurchaseRequisitionType exists: ${typeExists}`);
      if (!typeExists) {
        console.log(`PurchaseRequisitionType validation failed for: ${PurchaseRequisitionType}`);
        req.error(400, `Purchase Requisition Type '${PurchaseRequisitionType}' does not exist.`);
      }

      console.log('All validations passed!');
    } catch (error) {
      console.error('Error in validation:', error);
      throw error;
    }
  });

  // Also add an AFTER handler to see if UPDATE completes
  this.after(['UPDATE'], PurchaseRequisition, async (results, req) => {
    console.log('=== PurchaseRequisition AFTER UPDATE handler ===');
    console.log('Update completed successfully');
  });
});
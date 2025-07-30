const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const {
    PurchaseRequisition,
    MaterialMaster,
    Plant,
    StorageLocation,
    PurchasingGroup,
    PurchasingDocumentType
  } = this.entities;

  this.before(['CREATE', 'UPDATE'], PurchaseRequisition, async (req) => {
    const {
      Material,
      Plant: plantCode,
      StorageLocation: storageLocation,
      PurchasingGroup: group,
      PurchaseRequisitionType,
      AccountAssignments
    } = req.data;

    const db = cds.transaction(req);

    try {
      const materialExists = await db.exists(MaterialMaster).where({ Material });
      if (!materialExists) {
        req.error(400, `Material '${Material}' does not exist.`);
      }

      const plantExists = await db.exists(Plant).where({ Plant: plantCode });
      if (!plantExists) {
        req.error(400, `Plant '${plantCode}' does not exist.`);
      }

      const storageExists = await db.exists(StorageLocation).where({
        Plant: plantCode,
        StorageLocation: storageLocation
      });
      if (!storageExists) {
        req.error(400, `Storage Location '${storageLocation}' does not exist for Plant '${plantCode}'.`);
      }

      const groupExists = await db.exists(PurchasingGroup).where({ PurchasingGroup: group });
      if (!groupExists) {
        req.error(400, `Purchasing Group '${group}' does not exist.`);
      }

      const typeExists = await db.exists(PurchasingDocumentType).where({ DocumentType: PurchaseRequisitionType });
      if (!typeExists) {
        req.error(400, `Purchase Requisition Type '${PurchaseRequisitionType}' does not exist.`);
      }

      const quantity = parseFloat(req.data.Quantity);
      if (isNaN(quantity) || quantity <= 0) {
        req.error(400, `Quantity must be a positive number.`);
      }

      const deliveryDate = new Date(req.data.DeliveryDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (isNaN(deliveryDate.getTime()) || deliveryDate < now) {
        req.error(400, `Delivery Date must be today or a future date.`);
      }

      let LIMIT = 0;
      if (!AccountAssignments || !AccountAssignments.length || !(AccountAssignments[0].CostCenter)) {
        req.error(400, `Missing AccountAssignments or CostCenter determine LIMIT.`);
      } else {
        LIMIT = parseFloat(AccountAssignments[0].CostCenter);
      }

      const infoRecord = await db.run(
        SELECT.one.from('usedcar.PurchasingInfoRecord').where({
          Material
        })
      );

      if (!infoRecord || !infoRecord.PurchasingInfoRecord) {
        req.error(400, `Missing purchasingInfoRecord to determine NetPrice.`);
      }

      const eine = await db.run(
        SELECT.one.from('usedcar.PurchasingOrgInfoRecord').where({
          PurchasingInfoRecord: infoRecord.PurchasingInfoRecord,
        })
      );

      if (!eine || eine.NetPrice == null || eine.PriceUnit == null) {
        req.error(400, `No org-level pricing found for InfoRecord '${infoRecord.PurchasingInfoRecord}' and Purchasing Organization '${PurchasingOrganization}'.`);
      }

      const netPrice = parseFloat(eine.NetPrice);
      const priceUnit = parseFloat(eine.PriceUnit || 1);
      const effectivePrice = netPrice / priceUnit;
      const totalValue = effectivePrice * quantity;

      if (totalValue > LIMIT) {
        req.error(400, `Total PR value (${totalValue.toFixed(2)} AUD) exceeds purchasing limit of ${LIMIT} AUD.`);
      }
    } catch (error) {
      throw error;
    }
  });

  this.after(['UPDATE'], PurchaseRequisition, async (results, req) => {
    // No after logic
  });
});

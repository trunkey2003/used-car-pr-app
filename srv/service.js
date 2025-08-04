const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const {
    PurchaseRequisition,
    MaterialMaster,
    Plant,
    StorageLocation,
    PurchasingGroup,
    PurchasingDocumentType,
    PurchaseOrderHeader,
    PurchaseOrderItem,
    VendorMaster,
    MaterialDocument
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

  });

  this.before(['CREATE', 'UPDATE'], PurchaseOrderHeader, async (req) => {
    const {
      Supplier,
      PurchaseOrder,
      PurchaseOrderType,
      DocumentDate,
    } = req.data;

    const db = cds.transaction(req);

    if (!Supplier) {
      req.error(400, `Supplier must be provided.`);
    }
    if (!await db.exists(VendorMaster).where({ Supplier })) {
      req.error(400, `Supplier '${Supplier}' does not exist.`);
    }

    if (!PurchaseOrderType) {
      req.error(400, `PurchaseOrderType must be provided.`);
    }
    if (!await db.exists(PurchasingDocumentType).where({ DocumentType: PurchaseOrderType })) {
      req.error(400, `Purchase Order Type '${PurchaseOrderType}' does not exist.`);
    }

    if (!DocumentDate) {
      req.error(400, `DocumentDate must be provided.`);
    }
    const docDate = new Date(DocumentDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (isNaN(docDate) || docDate > today) {
      req.error(400, `DocumentDate must be today or in the past.`);
    }

    const purchaseOrderItems = req.data.toPurchaseOrderItem || [];

    if (purchaseOrderItems && purchaseOrderItems.length) {
      let currentTotal = 0;
      for (const item of purchaseOrderItems) {
        const {
          Material,
          PurchaseRequisition: PR,
          Plant: plantCode,
          StorageLocation: storageLoc,
          Quantity,
          NetPrice
        } = item;

        if (!Material) {
          req.error(400, `Each line must include a Material.`);
        }
        if (!await db.exists(MaterialMaster).where({ Material })) {
          req.error(400, `Material '${Material}' does not exist.`);
        }

        if (!PR) {
          req.error(400, `Each line must include a PurchaseRequisition.`);
        }
        if (!await db.exists(PurchaseRequisition)
          .where({ PurchaseRequisition: PR, ReleaseStatus: 'REL' })) {
          req.error(400, `PurchaseRequisition '${PR}' not found or not released.`);
        }

        if (!plantCode) {
          req.error(400, `Each line must include a Plant.`);
        }
        if (!await db.exists(Plant).where({ Plant: plantCode })) {
          req.error(400, `Plant '${plantCode}' does not exist.`);
        }
        if (!storageLoc) {
          req.error(400, `Each line must include a StorageLocation.`);
        }
        if (!await db.exists(StorageLocation)
          .where({ Plant: plantCode, StorageLocation: storageLoc })) {
          req.error(400,
            `StorageLocation '${storageLoc}' does not exist for Plant '${plantCode}'.`);
        }

        const qty = parseFloat(Quantity);
        if (isNaN(qty) || qty <= 0) {
          req.error(400, `Quantity must be a positive number.`);
        }

        const np = parseFloat(NetPrice);
        if (isNaN(np) || np <= 0) {
          req.error(400, `NetPrice must be a positive number.`);
        }

        currentTotal += qty * np;
      }

      const LIMIT = 1000000; 
      const year = docDate.getFullYear();
      const month = docDate.getMonth();          
      const periodStart = new Date(year, month, 1);
      const periodEnd = new Date(year, month + 1, 0);

      const headers = await db.run(
        SELECT
          .columns('PurchaseOrder')
          .from(PurchaseOrderHeader)
          .where({
            Supplier,
            DocumentDate: { '>=': periodStart, '<=': periodEnd }
          })
      );
      const otherPOs = headers
        .map(h => h.PurchaseOrder)
        .filter(pon => pon !== PurchaseOrder);

      let existingTotal = 0;
      if (otherPOs.length) {
        const itemsInPeriod = await db.run(
          SELECT
            .columns(['Quantity', 'NetPrice'])
            .from(PurchaseOrderItem)
            .where({ PurchaseOrder: { in: otherPOs } })
        );
        for (const it of itemsInPeriod) {
          existingTotal += parseFloat(it.Quantity) * parseFloat(it.NetPrice);
        }
      }

      if ((existingTotal + currentTotal) > LIMIT) {
        req.error(400,
          `Supplier '${Supplier}' has committed ${existingTotal.toFixed(2)} AUD so far this month; ` +
          `adding this PO (${currentTotal.toFixed(2)} AUD) exceeds the ${LIMIT.toLocaleString()} AUD limit.`);
      }
    }
  });

  this.before(['CREATE', 'UPDATE'], MaterialDocument, async (req) => {
    const { Material, Plant, StorageLocation, PurchaseOrder, PurchaseOrderItem, Quantity  } = req.data;

    if (Material) {
      const materialExists = await SELECT.one.from('usedcar.MaterialMaster').where({ Material });
      if (!materialExists) {
        req.error(400, `Material '${Material}' does not exist in Material Master`, 'Material');
      }
    }

    if (Plant) {
      const plantExists = await SELECT.one.from('usedcar.Plant').where({ Plant });
      if (!plantExists) {
        req.error(400, `Plant '${Plant}' does not exist in Plant Master`, 'Plant');
      }
    }

    if (Plant && StorageLocation) {
      const storageLocationExists = await SELECT.one.from('usedcar.StorageLocation')
        .where({ Plant, StorageLocation });
      if (!storageLocationExists) {
        req.error(400, `Storage Location '${StorageLocation}' does not exist for Plant '${Plant}'`, 'StorageLocation');
      }
    }

    if (PurchaseOrder) {
      const purchaseOrderExists = await SELECT.one.from('usedcar.PurchaseOrderHeader')
        .where({ PurchaseOrder });
      if (!purchaseOrderExists) {
        req.error(400, `Purchase Order '${PurchaseOrder}' does not exist`, 'PurchaseOrder');
      }
    }

    if (PurchaseOrder && PurchaseOrderItem) {
      const purchaseOrderItemExists = await SELECT.one.from('usedcar.PurchaseOrderItem')
        .where({ PurchaseOrder, PurchaseOrderItem });
      if (!purchaseOrderItemExists) {
        req.error(400, `Purchase Order Item '${PurchaseOrderItem}' does not exist for Purchase Order '${PurchaseOrder}'`, 'PurchaseOrderItem');
      }
    }

    if (PurchaseOrder && PurchaseOrderItem && Material) {
      const purchaseOrderItemData = await SELECT.one.from('usedcar.PurchaseOrderItem')
        .where({ PurchaseOrder, PurchaseOrderItem });

      if (purchaseOrderItemData && purchaseOrderItemData.Material !== Material) {
        req.error(400, `Material '${Material}' does not match the material '${purchaseOrderItemData.Material}' in Purchase Order Item`, 'Material');
      }
    }

    if (PurchaseOrder && PurchaseOrderItem && Plant) {
      const purchaseOrderItemData = await SELECT.one.from('usedcar.PurchaseOrderItem')
        .where({ PurchaseOrder, PurchaseOrderItem });

      if (purchaseOrderItemData && purchaseOrderItemData.Plant !== Plant) {
        req.error(400, `Plant '${Plant}' does not match the plant '${purchaseOrderItemData.Plant}' in Purchase Order Item`, 'Plant');
      }
    }

    if (PurchaseOrder && PurchaseOrderItem && StorageLocation) {
      const purchaseOrderItemData = await SELECT.one.from('usedcar.PurchaseOrderItem')
        .where({ PurchaseOrder, PurchaseOrderItem });

      if (purchaseOrderItemData && purchaseOrderItemData.StorageLocation !== StorageLocation) {
        req.error(400, `Storage Location '${StorageLocation}' does not match the storage location '${purchaseOrderItemData.StorageLocation}' in Purchase Order Item`, 'StorageLocation');
      }
    }

    if (Quantity !== undefined && Quantity !== null) {
      if (Quantity <= 0) {
        req.error(400, `Quantity must be a positive value. Provided: ${Quantity}`, 'Quantity');
      }
      
      if (PurchaseOrder && PurchaseOrderItem) {
        const purchaseOrderItemData = await SELECT.one.from('usedcar.PurchaseOrderItem')
          .where({ PurchaseOrder, PurchaseOrderItem });
        
        if (purchaseOrderItemData && Quantity > purchaseOrderItemData.Quantity) {
          req.error(400, `Quantity ${Quantity} exceeds the available quantity ${purchaseOrderItemData.Quantity} in Purchase Order Item '${PurchaseOrderItem}'`, 'Quantity');
        }
      }
    }
  });
});
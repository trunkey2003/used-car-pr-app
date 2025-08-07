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
    MaterialDocument,
    SupplierInvoiceHeader,
    PurchasingInfoRecord
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
    const { Material, Plant, StorageLocation, PurchaseOrder, PurchaseOrderItem, Quantity } = req.data;

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

  this.before(['CREATE', 'UPDATE'], SupplierInvoiceHeader, async (req) => {
    const {
      Supplier,
      DocumentDate,
      GrossAmount,
      toSupplierInvoiceItem
    } = req.data;

    const db = cds.transaction(req);

    try {

      if (Supplier) {
        const supplierExists = await db.exists(VendorMaster).where({ Supplier });
        if (!supplierExists) {
          req.error(400, `Supplier '${Supplier}' does not exist in Vendor Master`, 'Supplier');
        }
      }

      if (GrossAmount !== undefined && GrossAmount !== null) {
        const grossAmt = parseFloat(GrossAmount);
        if (isNaN(grossAmt) || grossAmt <= 0) {
          req.error(400, `Gross Amount must be a positive decimal. Provided: ${GrossAmount}`, 'GrossAmount');
        }
      }

      if (DocumentDate) {
        const docDate = new Date(DocumentDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999); 

        if (isNaN(docDate.getTime()) || docDate > today) {
          req.error(400, `Document Date must be current or past date. Provided: ${DocumentDate}`, 'DocumentDate');
        }
      }

      const invoiceItems = toSupplierInvoiceItem || [];
      if (invoiceItems && invoiceItems.length > 0) {
        let totalCalculatedAmount = 0;

        for (const item of invoiceItems) {
          const {
            PurchaseOrder,
            PurchaseOrderItem,
            Material,
            Quantity,
            Amount
          } = item;

          if (PurchaseOrder) {
            const purchaseOrderExists = await db.exists(PurchaseOrderHeader)
              .where({ PurchaseOrder });
            if (!purchaseOrderExists) {
              req.error(400, `Purchase Order '${PurchaseOrder}' does not exist`, 'PurchaseOrder');
            }
          }

          if (PurchaseOrder && PurchaseOrderItem) {
            const purchaseOrderItemExists = await db.exists(PurchaseOrderItem)
              .where({ PurchaseOrder, PurchaseOrderItem });
            if (!purchaseOrderItemExists) {
              req.error(400, `Purchase Order Item '${PurchaseOrderItem}' does not exist for Purchase Order '${PurchaseOrder}'`, 'PurchaseOrderItem');
            }
          }

          if (Material) {
            const materialExists = await db.exists(MaterialMaster).where({ Material });
            if (!materialExists) {
              req.error(400, `Material '${Material}' does not exist in Material Master`, 'Material');
            }
          }

          if (Amount !== undefined && Amount !== null) {
            const itemAmount = parseFloat(Amount);
            if (isNaN(itemAmount) || itemAmount <= 0) {
              req.error(400, `Item Amount must be a positive decimal. Provided: ${Amount}`, 'Amount');
            }
            totalCalculatedAmount += itemAmount;

            if (PurchaseOrder && PurchaseOrderItem && Quantity) {
              const purchaseOrderItemData = await db.run(
                SELECT.one.from('usedcar.PurchaseOrderItem')
                  .where({ PurchaseOrder, PurchaseOrderItem })
              );

              if (purchaseOrderItemData) {
                const expectedAmount = parseFloat(purchaseOrderItemData.NetPrice) * parseFloat(Quantity);
                const tolerance = 0.01; 

                if (Math.abs(itemAmount - expectedAmount) > tolerance) {
                  req.error(400, 
                    `Invoice item amount ${itemAmount} does not match expected amount ${expectedAmount.toFixed(2)} ` +
                    `(NetPrice ${purchaseOrderItemData.NetPrice} × Quantity ${Quantity})`, 
                    'Amount'
                  );
                }
              }
            }
          }

          if (Quantity !== undefined && Quantity !== null) {
            const qty = parseFloat(Quantity);
            if (isNaN(qty) || qty <= 0) {
              req.error(400, `Quantity must be a positive decimal. Provided: ${Quantity}`, 'Quantity');
            }
          }
        }

        if (GrossAmount && totalCalculatedAmount > 0) {
          const grossAmt = parseFloat(GrossAmount);
          const tolerance = 0.01; 

          if (Math.abs(grossAmt - totalCalculatedAmount) > tolerance) {
            req.error(400, 
              `Gross Amount ${grossAmt} does not match sum of item amounts ${totalCalculatedAmount.toFixed(2)}`, 
              'GrossAmount'
            );
          }
        }
      }

      if (Supplier && GrossAmount) {
        const grossAmt = parseFloat(GrossAmount);

        const SUPPLIER_CREDIT_LIMIT = 2000000; 

        const existingInvoices = await db.run(
          SELECT
            .columns('GrossAmount')
            .from('usedcar.SupplierInvoiceHeader')
            .where({ 
              Supplier,
              SupplierInvoice: { '!=': req.data.SupplierInvoice || 'NEW' } 
            })
        );

        let totalOutstanding = 0;
        for (const invoice of existingInvoices) {
          totalOutstanding += parseFloat(invoice.GrossAmount || 0);
        }

        if ((totalOutstanding + grossAmt) > SUPPLIER_CREDIT_LIMIT) {
          req.error(400, 
            `Supplier '${Supplier}' has outstanding invoices of ${totalOutstanding.toFixed(2)}. ` +
            `Adding this invoice (${grossAmt.toFixed(2)}) would exceed credit limit of ${SUPPLIER_CREDIT_LIMIT.toLocaleString()}`, 
            'GrossAmount'
          );
        }
      }

    } catch (error) {
      throw error;
    }
  });

  this.before(['CREATE', 'UPDATE'], PurchasingInfoRecord, async (req) => {
    const { Material, Supplier } = req.data;
    
    // Foreign Key Validation: Material exists in MaterialMaster (MARA)
    if (Material) {
      const materialExists = await SELECT.one.from('MaterialMaster').where({ Material });
      if (!materialExists) {
        req.error(400, `Material ${Material} does not exist in MaterialMaster (MARA)`);
        return;
      }
    }
    
    // Foreign Key Validation: Supplier exists in VendorMaster (LFA1)
    if (Supplier) {
      const supplierExists = await SELECT.one.from('VendorMaster').where({ Supplier });
      if (!supplierExists) {
        req.error(400, `Supplier ${Supplier} does not exist in VendorMaster (LFA1)`);
        return;
      }
    }
    
    // Validate associated PurchasingOrgInfoRecord data if present
    if (req.data.toPurchasingOrgInfo && Array.isArray(req.data.toPurchasingOrgInfo)) {
      for (const orgInfo of req.data.toPurchasingOrgInfo) {
        const { PurchasingOrganization, NetPrice, PriceUnit } = orgInfo;
        
        // Foreign Key Validation: PurchasingOrganization exists in system configuration
        // Note: Assuming there's a system configuration entity for purchasing organizations
        // You may need to adjust this based on your actual system configuration entity
        if (PurchasingOrganization) {
          // This would typically check against a configuration table like T001K or similar
          // For now, implementing basic format validation
          if (!/^[A-Z0-9]{4}$/.test(PurchasingOrganization)) {
            req.error(400, `Invalid Purchasing Organization format: ${PurchasingOrganization}. Must be 4 alphanumeric characters.`);
            return;
          }
        }
        
        // Data Format Validation: NetPrice must be positive decimal
        if (NetPrice !== undefined && NetPrice !== null) {
          if (typeof NetPrice !== 'number' || NetPrice <= 0) {
            req.error(400, `NetPrice must be a positive decimal value. Received: ${NetPrice}`);
            return;
          }
          
          // Purchasing Limits: Check NetPrice against threshold (AUD 100,000)
          const PRICE_THRESHOLD = 100000.00;
          if (NetPrice > PRICE_THRESHOLD) {
            req.error(400, `NetPrice ${NetPrice} exceeds maximum allowed threshold of AUD ${PRICE_THRESHOLD.toLocaleString()}`);
            return;
          }
          
          // Optional: Check against historical prices for the same material-supplier combination
          if (Material && Supplier) {
            try {
              const historicalPrices = await SELECT(['NetPrice'])
                .from('PurchasingOrgInfoRecord')
                .where({
                  PurchasingInfoRecord: { 
                    in: SELECT(['PurchasingInfoRecord'])
                      .from('PurchasingInfoRecord')
                      .where({ Material, Supplier })
                  }
                })
                .orderBy('createdAt desc')
                .limit(5);
              
              if (historicalPrices.length > 0) {
                const avgHistoricalPrice = historicalPrices.reduce((sum, record) => sum + record.NetPrice, 0) / historicalPrices.length;
                const priceVarianceThreshold = avgHistoricalPrice * 1.5; // 50% increase threshold
                
                if (NetPrice > priceVarianceThreshold) {
                  req.error(400, `NetPrice ${NetPrice} significantly exceeds historical average of AUD ${avgHistoricalPrice.toFixed(2)}. Please review pricing.`);
                  return;
                }
              }
            } catch (error) {
              // Log warning but don't fail the transaction for historical price check
              console.warn('Could not validate against historical prices:', error.message);
            }
          }
        }
        
        // Data Format Validation: PriceUnit must be positive integer
        if (PriceUnit !== undefined && PriceUnit !== null) {
          if (!Number.isInteger(PriceUnit) || PriceUnit <= 0) {
            req.error(400, `PriceUnit must be a positive integer value. Received: ${PriceUnit}`);
            return;
          }
        }
      }
    }
    
    // Additional validation for A017 (MaterialInfoRecordPurchasingConditions)
    if (req.data.toPurchasingConditions && Array.isArray(req.data.toPurchasingConditions)) {
      for (const condition of req.data.toPurchasingConditions) {
        const { Plant } = condition;
        
        // Foreign Key Validation: Plant exists in T001W for A017
        if (Plant) {
          const plantExists = await SELECT.one.from('Plant').where({ Plant });
          if (!plantExists) {
            req.error(400, `Plant ${Plant} does not exist in Plant (T001W) for purchasing conditions`);
            return;
          }
        }
      }
    }
  });
});
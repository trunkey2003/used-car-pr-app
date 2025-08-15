const cds = require('@sap/cds');

module.exports = {
  'PRManagementService': function () {
    const {
      PurchaseRequisition,
      MaterialMaster,
      Plant,
      StorageLocation,
      PurchasingGroup,
      PurchasingDocumentType,
      VendorMaster,
      PurchasingInfoRecord,
      PurchasingOrgInfoRecord
    } = this.entities;

    const startOfToday = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const exists = (db, entity, where) => db.exists(entity).where(where);

    const handlePRBefore = async (srv, req) => {
      const db = cds.transaction(req);
      const {
        Material,
        Plant: plantCode,
        StorageLocation: storageLocation,
        PurchasingGroup: group,
        PurchaseRequisitionType,
        AccountAssignments
      } = req.data;

      if (!await exists(db, MaterialMaster, { Material })) {
        req.error(400, `Material '${Material}' does not exist.`);
      }
      if (!await exists(db, Plant, { Plant: plantCode })) {
        req.error(400, `Plant '${plantCode}' does not exist.`);
      }
      if (!await exists(db, StorageLocation, { Plant: plantCode, StorageLocation: storageLocation })) {
        req.error(400, `Storage Location '${storageLocation}' does not exist for Plant '${plantCode}'.`);
      }
      if (!await exists(db, PurchasingGroup, { PurchasingGroup: group })) {
        req.error(400, `Purchasing Group '${group}' does not exist.`);
      }
      if (!await exists(db, PurchasingDocumentType, { DocumentType: PurchaseRequisitionType })) {
        req.error(400, `Purchase Requisition Type '${PurchaseRequisitionType}' does not exist.`);
      }

      const quantity = parsePositive(req.data.Quantity);
      if (Number.isNaN(quantity)) req.error(400, `Quantity must be a positive number.`);

      const deliveryDate = new Date(req.data.DeliveryDate);
      const today = startOfToday();
      if (Number.isNaN(deliveryDate.getTime()) || deliveryDate < today) {
        req.error(400, `Delivery Date must be today or a future date.`);
      }

      let LIMIT = 0;
      if (!AccountAssignments || !AccountAssignments.length || !(AccountAssignments[0].CostCenter)) {
        req.error(400, `Missing AccountAssignments or CostCenter determine LIMIT.`);
      } else {
        LIMIT = parsePositive(AccountAssignments[0].CostCenter);
        if (Number.isNaN(LIMIT)) req.error(400, `CostCenter (LIMIT) must be a positive number.`);
      }

      const infoRecord = await db.run(
        SELECT.one.from('usedcar.PurchasingInfoRecord').where({ Material })
      );
      if (!infoRecord || !infoRecord.PurchasingInfoRecord) {
        req.error(400, `Missing purchasingInfoRecord to determine NetPrice.`);
      }

      const eine = await db.run(
        SELECT.one.from('usedcar.PurchasingOrgInfoRecord').where({
          PurchasingInfoRecord: infoRecord.PurchasingInfoRecord
        })
      );
      if (!eine || eine.NetPrice == null || eine.PriceUnit == null) {
        req.error(400, `No org-level pricing found for InfoRecord '${infoRecord.PurchasingInfoRecord}'.`);
      }

      const netPrice = parsePositive(eine.NetPrice);
      const priceUnit = parsePositive(eine.PriceUnit || 1);
      if (Number.isNaN(netPrice) || Number.isNaN(priceUnit)) {
        req.error(400, `Invalid NetPrice/PriceUnit on InfoRecord '${infoRecord.PurchasingInfoRecord}'.`);
      }
      const effectivePrice = netPrice / priceUnit;
      const totalValue = effectivePrice * quantity;

      if (totalValue > LIMIT) {
        req.error(
          400,
          `Total PR value (${totalValue.toFixed(2)} AUD) exceeds purchasing limit of ${LIMIT} AUD.`
        );
      }
    };

    this.before(['CREATE', 'UPDATE'], PurchaseRequisition, (req) => handlePRBefore(this, req));

    this.on('approve', PurchaseRequisition, async (req) => {
      const { ID } = req.params[0];
      const db = cds.transaction(req);

      try {
        // First, check if the PR exists and get its current status
        const pr = await db.run(
          SELECT.one.from(PurchaseRequisition).where({ ID })
        );

        if (!pr) {
          req.error(404, `Purchase Requisition with ID '${ID}' not found.`);
          return;
        }

        // Check if PR is already released
        if (pr.ReleaseStatus === 'REL') {
          req.error(400, `Purchase Requisition ${ID} is already approved.`);
          return;
        }

        // Check if PR is in the correct status to be approved
        if (pr.ReleaseStatus !== 'NOT_REL') {
          req.error(400, `Purchase Requisition ${ID} cannot be approved. Current status: ${pr.ReleaseStatus}`);
          return;
        }

        // Update the ReleaseStatus from "NOT_REL" to "REL"
        const result = await db.run(
          UPDATE(PurchaseRequisition)
            .set({ ReleaseStatus: 'REL' })
            .where({ ID })
        );

        // Check if the update was successful
        if (result === 0) {
          req.error(500, `Failed to update Purchase Requisition ${ID}.`);
          return;
        }

        await db.commit();

        // Log for debugging
        console.log(`Purchase Requisition ${ID} approved successfully`);

        req.notify('success', `Purchase Requisition ${ID} approved successfully`);

        return `Purchase Requisition ${ID} approved successfully`;

      } catch (error) {
        await db.rollback();
        console.error(`Error approving PR ${ID}:`, error);
        req.error(500, `Error approving Purchase Requisition: ${error.message}`);
      }
    });

    this.on('rejectCustom', PurchaseRequisition, async (req) => {
      const { ID } = req.params[0];
      const db = cds.transaction(req);

      try {
        // First, check if the PR exists and get its current status
        const pr = await db.run(
          SELECT.one.from(PurchaseRequisition).where({ ID })
        );

        if (!pr) {
          req.error(404, `Purchase Requisition with ID '${ID}' not found.`);
          return;
        }

        // Check if PR is already in NOT_REL status
        if (pr.ReleaseStatus === 'NOT_REL') {
          req.error(400, `Purchase Requisition ${ID} is already in NOT_REL status.`);
          return;
        }

        // Update the ReleaseStatus to "NOT_REL"
        const result = await db.run(
          UPDATE(PurchaseRequisition)
            .set({ ReleaseStatus: 'NOT_REL' })
            .where({ ID })
        );

        // Check if the update was successful
        if (result === 0) {
          req.error(500, `Failed to update Purchase Requisition ${ID}.`);
          return;
        }

        await db.commit();

        // Log for debugging
        console.log(`Purchase Requisition ${ID} rejected successfully`);

        req.notify('success', `Purchase Requisition ${ID} rejected successfully`);
        return `Purchase Requisition ${ID} rejected successfully`;

      } catch (error) {
        await db.rollback();
        console.error(`Error rejecting PR ${ID}:`, error);
        req.error(500, `Error rejecting Purchase Requisition: ${error.message}`);
      }
    });
  },

  'POManagementService': function () {
    const {
      PurchaseOrderHeader,
      PurchaseOrderItem,
      PurchaseRequisition,
      MaterialMaster,
      Plant,
      StorageLocation,
      PurchasingDocumentType,
      VendorMaster
    } = this.entities;

    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const exists = (db, entity, where) => db.exists(entity).where(where);

    const startOfToday = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const handlePOHeaderBefore = async (srv, req) => {
      const db = cds.transaction(req);
      const {
        Supplier,
        PurchaseOrder,
        PurchaseOrderType,
        DocumentDate
      } = req.data;

      if (!Supplier) req.error(400, `Supplier must be provided.`);
      if (!await exists(db, VendorMaster, { Supplier })) {
        req.error(400, `Supplier '${Supplier}' does not exist.`);
      }

      if (!PurchaseOrderType) req.error(400, `PurchaseOrderType must be provided.`);
      if (!await exists(db, PurchasingDocumentType, { DocumentType: PurchaseOrderType })) {
        req.error(400, `Purchase Order Type '${PurchaseOrderType}' does not exist.`);
      }

      if (!DocumentDate) req.error(400, `DocumentDate must be provided.`);
      const docDate = new Date(DocumentDate);
      const today = startOfToday();
      if (Number.isNaN(docDate.getTime()) || docDate > today) {
        req.error(400, `DocumentDate must be today or in the past.`);
      }

      const purchaseOrderItems = req.data.toPurchaseOrderItem || [];
      if (purchaseOrderItems.length) {
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

          if (!Material) req.error(400, `Each line must include a Material.`);
          if (!await exists(db, MaterialMaster, { Material })) {
            req.error(400, `Material '${Material}' does not exist.`);
          }

          if (!PR) req.error(400, `Each line must include a PurchaseRequisition.`);
          if (!await db.exists(PurchaseRequisition).where({ PurchaseRequisition: PR, ReleaseStatus: 'REL' })) {
            req.error(400, `PurchaseRequisition '${PR}' not found or not released.`);
          }

          if (!plantCode) req.error(400, `Each line must include a Plant.`);
          if (!await exists(db, Plant, { Plant: plantCode })) {
            req.error(400, `Plant '${plantCode}' does not exist.`);
          }

          if (!storageLoc) req.error(400, `Each line must include a StorageLocation.`);
          if (!await exists(db, StorageLocation, { Plant: plantCode, StorageLocation: storageLoc })) {
            req.error(400, `StorageLocation '${storageLoc}' does not exist for Plant '${plantCode}'.`);
          }

          const qty = parsePositive(Quantity);
          if (Number.isNaN(qty)) req.error(400, `Quantity must be a positive number.`);
          const np = parsePositive(NetPrice);
          if (Number.isNaN(np)) req.error(400, `NetPrice must be a positive number.`);

          currentTotal += qty * np;
        }

        const LIMIT = 1_000_000;
        const year = docDate.getFullYear();
        const month = docDate.getMonth();
        const periodStart = new Date(year, month, 1);
        const periodEnd = new Date(year, month + 1, 0);

        const headers = await db.run(
          SELECT.columns('PurchaseOrder')
            .from(PurchaseOrderHeader)
            .where({ Supplier, DocumentDate: { '>=': periodStart, '<=': periodEnd } })
        );

        const otherPOs = headers.map(h => h.PurchaseOrder).filter(pon => pon !== PurchaseOrder);

        let existingTotal = 0;
        if (otherPOs.length) {
          const itemsInPeriod = await db.run(
            SELECT.columns(['Quantity', 'NetPrice'])
              .from(PurchaseOrderItem)
              .where({ PurchaseOrder: { in: otherPOs } })
          );
          for (const it of itemsInPeriod) {
            existingTotal += parsePositive(it.Quantity) * parsePositive(it.NetPrice);
          }
        }

        if ((existingTotal + currentTotal) > LIMIT) {
          req.error(
            400,
            `Supplier '${Supplier}' has committed ${existingTotal.toFixed(2)} AUD so far this month; ` +
            `adding this PO (${currentTotal.toFixed(2)} AUD) exceeds the ${LIMIT.toLocaleString()} AUD limit.`
          );
        }
      }
    };

    this.before(['CREATE', 'UPDATE'], PurchaseOrderHeader, (req) => handlePOHeaderBefore(this, req));


    // --- inside 'POManagementService': function () { ... } ---

    // Helper to resolve one or many PR numbers from action params
    async function resolvePRs(db, p, PurchaseOrderItem) {
      // 1) Single item by ID
      if (p.ID) {
        const it = await db.run(SELECT.one.from(PurchaseOrderItem).where({ ID: p.ID }));
        if (!it) throw Object.assign(new Error('Purchase Order item not found.'), { status: 404 });
        return it.PurchaseRequisition ? [it.PurchaseRequisition] : [];
      }
      // 2) Single item by (PO, POItem)
      if (p.PurchaseOrder && p.PurchaseOrderItem) {
        const it = await db.run(
          SELECT.one.from(PurchaseOrderItem).where({
            PurchaseOrder: p.PurchaseOrder,
            PurchaseOrderItem: p.PurchaseOrderItem
          })
        );
        if (!it) throw Object.assign(new Error('Purchase Order item not found.'), { status: 404 });
        return it.PurchaseRequisition ? [it.PurchaseRequisition] : [];
      }
      // 3) All PRs for a PO (your case)
      if (p.PurchaseOrder) {
        const rows = await db.run(
          SELECT.from(PurchaseOrderItem)
            .columns('PurchaseRequisition')
            .where({ PurchaseOrder: p.PurchaseOrder })
        );
        const set = new Set(rows.map(r => r.PurchaseRequisition).filter(Boolean));
        return Array.from(set);
      }
      throw Object.assign(new Error('Missing keys. Provide ID, (PurchaseOrder, PurchaseOrderItem) or (PurchaseOrder).'), { status: 400 });
    }

    // ---------- APPROVE: NOT_REL -> REL on linked PR(s) ----------
    this.on('approve', PurchaseOrderItem, async (req) => {
      const db = cds.transaction(req);
      try {
        const p = req.params?.[0] || {};
        const prNumbers = await resolvePRs(db, p, PurchaseOrderItem);

        if (!prNumbers.length) return req.reject(404, 'No linked Purchase Requisitions found.');

        // Read current statuses
        const current = await db.run(
          SELECT.from(PurchaseRequisition)
            .columns('PurchaseRequisition', 'ReleaseStatus')
            .where({ PurchaseRequisition: { in: prNumbers } })
        );
        if (!current.length) return req.reject(404, 'Linked Purchase Requisitions not found.');

        const eligible = current.filter(r => r.ReleaseStatus === 'NOT_REL').map(r => r.PurchaseRequisition);
        if (!eligible.length) return req.reject(400, 'No PRs eligible for approval (already approved or invalid state).');

        // Atomic bulk update
        const affected = await db.run(
          UPDATE(PurchaseRequisition)
            .set({ ReleaseStatus: 'REL' })
            .where({ PurchaseRequisition: { in: eligible }, ReleaseStatus: 'NOT_REL' })
        );

        const msg = `Approved ${affected} PR(s): ${eligible.join(', ')}`;
        req.notify?.('success', msg);
        return msg;
      } catch (e) {
        return req.reject(e.status || 500, `Error approving Purchase Order-linked PR(s): ${e.message}`);
      }
    });

    // ---------- REJECT: * -> NOT_REL on linked PR(s) ----------
    this.on('rejectCustom', PurchaseOrderItem, async (req) => {
      const db = cds.transaction(req);
      try {
        const p = req.params?.[0] || {};
        const prNumbers = await resolvePRs(db, p, PurchaseOrderItem);

        if (!prNumbers.length) return req.reject(404, 'No linked Purchase Requisitions found.');

        const current = await db.run(
          SELECT.from(PurchaseRequisition)
            .columns('PurchaseRequisition', 'ReleaseStatus')
            .where({ PurchaseRequisition: { in: prNumbers } })
        );
        if (!current.length) return req.reject(404, 'Linked Purchase Requisitions not found.');

        const toRevert = current.filter(r => r.ReleaseStatus !== 'NOT_REL');
        if (!toRevert.length) return req.reject(400, 'All linked PRs are already in NOT_REL.');

        // Flip back with per-row guard to avoid races
        let total = 0;
        for (const r of toRevert) {
          const n = await db.run(
            UPDATE(PurchaseRequisition)
              .set({ ReleaseStatus: 'NOT_REL' })
              .where({ PurchaseRequisition: r.PurchaseRequisition, ReleaseStatus: r.ReleaseStatus })
          );
          total += n || 0;
        }

        const msg = `Rejected ${total} PR(s): ${toRevert.map(r => r.PurchaseRequisition).join(', ')}`;
        req.notify?.('success', msg);
        return msg;
      } catch (e) {
        return req.reject(e.status || 500, `Error rejecting Purchase Order-linked PR(s): ${e.message}`);
      }
    });



  },

  'GRManagementService': function () {
    const {
      MaterialDocument,
      PurchaseOrderHeader,
      PurchaseOrderItem,
      MaterialMaster,
      Plant,
      StorageLocation
    } = this.entities;

    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const handleMaterialDocumentBefore = async (srv, req) => {
      const { Material, Plant: plant, StorageLocation: storageLoc, PurchaseOrder, PurchaseOrderItem: poi, Quantity } = req.data;

      if (Material) {
        const materialExists = await SELECT.one.from('usedcar.MaterialMaster').where({ Material });
        if (!materialExists) req.error(400, `Material '${Material}' does not exist in Material Master`, 'Material');
      }

      if (plant) {
        const plantExists = await SELECT.one.from('usedcar.Plant').where({ Plant: plant });
        if (!plantExists) req.error(400, `Plant '${plant}' does not exist in Plant Master`, 'Plant');
      }

      if (plant && storageLoc) {
        const storageLocationExists = await SELECT.one.from('usedcar.StorageLocation')
          .where({ Plant: plant, StorageLocation: storageLoc });
        if (!storageLocationExists) {
          req.error(400, `Storage Location '${storageLoc}' does not exist for Plant '${plant}'`, 'StorageLocation');
        }
      }

      if (PurchaseOrder) {
        const purchaseOrderExists = await SELECT.one.from('usedcar.PurchaseOrderHeader').where({ PurchaseOrder });
        if (!purchaseOrderExists) req.error(400, `Purchase Order '${PurchaseOrder}' does not exist`, 'PurchaseOrder');
      }

      if (PurchaseOrder && poi) {
        const purchaseOrderItemExists = await SELECT.one.from('usedcar.PurchaseOrderItem')
          .where({ PurchaseOrder, PurchaseOrderItem: poi });
        if (!purchaseOrderItemExists) {
          req.error(400, `Purchase Order Item '${poi}' does not exist for Purchase Order '${PurchaseOrder}'`, 'PurchaseOrderItem');
        }
      }

      if (PurchaseOrder && poi && Material) {
        const item = await SELECT.one.from('usedcar.PurchaseOrderItem').where({ PurchaseOrder, PurchaseOrderItem: poi });
        if (item && item.Material !== Material) {
          req.error(400, `Material '${Material}' does not match the material '${item.Material}' in Purchase Order Item`, 'Material');
        }
      }

      if (PurchaseOrder && poi && plant) {
        const item = await SELECT.one.from('usedcar.PurchaseOrderItem').where({ PurchaseOrder, PurchaseOrderItem: poi });
        if (item && item.Plant !== plant) {
          req.error(400, `Plant '${plant}' does not match the plant '${item.Plant}' in Purchase Order Item`, 'Plant');
        }
      }

      if (PurchaseOrder && poi && storageLoc) {
        const item = await SELECT.one.from('usedcar.PurchaseOrderItem').where({ PurchaseOrder, PurchaseOrderItem: poi });
        if (item && item.StorageLocation !== storageLoc) {
          req.error(400, `Storage Location '${storageLoc}' does not match the storage location '${item.StorageLocation}' in Purchase Order Item`, 'StorageLocation');
        }
      }

      if (Quantity !== undefined && Quantity !== null) {
        const qty = parsePositive(Quantity);
        if (Number.isNaN(qty)) req.error(400, `Quantity must be a positive value. Provided: ${Quantity}`, 'Quantity');

        if (PurchaseOrder && poi) {
          const item = await SELECT.one.from('usedcar.PurchaseOrderItem').where({ PurchaseOrder, PurchaseOrderItem: poi });
          if (item && qty > parsePositive(item.Quantity)) {
            req.error(400, `Quantity ${qty} exceeds the available quantity ${item.Quantity} in Purchase Order Item '${poi}'`, 'Quantity');
          }
        }
      }
    };

    this.before(['CREATE', 'UPDATE'], MaterialDocument, (req) => handleMaterialDocumentBefore(this, req));
  },

  'InvoiceProcessingService': function () {
    const {
      SupplierInvoiceHeader,
      SupplierInvoiceItem,
      AccountingDocumentHeader,
      AccountingDocumentItem,
      PurchaseOrderHeader,
      PurchaseOrderItem,
      MaterialDocument,
      MaterialMaster,
      VendorMaster
    } = this.entities;

    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const exists = (db, entity, where) => db.exists(entity).where(where);

    const handleSupplierInvoiceBefore = async (srv, req) => {
      const db = cds.transaction(req);
      const { Supplier, DocumentDate, GrossAmount, toSupplierInvoiceItem } = req.data;

      if (Supplier) {
        if (!await exists(db, VendorMaster, { Supplier })) {
          req.error(400, `Supplier '${Supplier}' does not exist in Vendor Master`, 'Supplier');
        }
      }

      if (GrossAmount !== undefined && GrossAmount !== null) {
        const grossAmt = parsePositive(GrossAmount);
        if (Number.isNaN(grossAmt)) req.error(400, `Gross Amount must be a positive decimal. Provided: ${GrossAmount}`, 'GrossAmount');
      }

      if (DocumentDate) {
        const docDate = new Date(DocumentDate);
        const endToday = new Date(); endToday.setHours(23, 59, 59, 999);
        if (Number.isNaN(docDate.getTime()) || docDate > endToday) {
          req.error(400, `Document Date must be current or past date. Provided: ${DocumentDate}`, 'DocumentDate');
        }
      }

      const invoiceItems = toSupplierInvoiceItem || [];
      if (invoiceItems.length > 0) {
        let totalCalculatedAmount = 0;

        for (const item of invoiceItems) {
          const { PurchaseOrder, PurchaseOrderItem: poi, Material, Quantity, Amount } = item;

          if (PurchaseOrder) {
            if (!await exists(db, PurchaseOrderHeader, { PurchaseOrder })) {
              req.error(400, `Purchase Order '${PurchaseOrder}' does not exist`, 'PurchaseOrder');
            }
          }

          if (PurchaseOrder && poi) {
            if (!await exists(db, PurchaseOrderItem, { PurchaseOrder, PurchaseOrderItem: poi })) {
              req.error(400, `Purchase Order Item '${poi}' does not exist for Purchase Order '${PurchaseOrder}'`, 'PurchaseOrderItem');
            }
          }

          if (Material) {
            if (!await exists(db, MaterialMaster, { Material })) {
              req.error(400, `Material '${Material}' does not exist in Material Master`, 'Material');
            }
          }

          if (Amount !== undefined && Amount !== null) {
            const itemAmount = parsePositive(Amount);
            if (Number.isNaN(itemAmount)) req.error(400, `Item Amount must be a positive decimal. Provided: ${Amount}`, 'Amount');
            totalCalculatedAmount += itemAmount;

            if (PurchaseOrder && poi && Quantity) {
              const poItem = await db.run(
                SELECT.one.from('usedcar.PurchaseOrderItem').where({ PurchaseOrder, PurchaseOrderItem: poi })
              );
              if (poItem) {
                const expectedAmount = parsePositive(poItem.NetPrice) * parsePositive(Quantity);
                const tolerance = 0.01;
                if (Math.abs(itemAmount - expectedAmount) > tolerance) {
                  req.error(400,
                    `Invoice item amount ${itemAmount} does not match expected amount ${expectedAmount.toFixed(2)} ` +
                    `(NetPrice ${poItem.NetPrice} × Quantity ${Quantity})`,
                    'Amount'
                  );
                }
              }
            }
          }

          if (Quantity !== undefined && Quantity !== null) {
            const qty = parsePositive(Quantity);
            if (Number.isNaN(qty)) req.error(400, `Quantity must be a positive decimal. Provided: ${Quantity}`, 'Quantity');
          }
        }

        if (GrossAmount && totalCalculatedAmount > 0) {
          const grossAmt = parsePositive(GrossAmount);
          const tolerance = 0.01;
          if (Math.abs(grossAmt - totalCalculatedAmount) > tolerance) {
            req.error(400, `Gross Amount ${grossAmt} does not match sum of item amounts ${totalCalculatedAmount.toFixed(2)}`, 'GrossAmount');
          }
        }
      }

      if (Supplier && GrossAmount) {
        const grossAmt = parsePositive(GrossAmount);
        const SUPPLIER_CREDIT_LIMIT = 2_000_000;

        const existingInvoices = await db.run(
          SELECT.columns('GrossAmount')
            .from('usedcar.SupplierInvoiceHeader')
            .where({
              Supplier,
              SupplierInvoice: { '!=': req.data.SupplierInvoice || 'NEW' }
            })
        );

        let totalOutstanding = 0;
        for (const invoice of existingInvoices) {
          totalOutstanding += parsePositive(invoice.GrossAmount || 0);
        }

        if ((totalOutstanding + grossAmt) > SUPPLIER_CREDIT_LIMIT) {
          req.error(
            400,
            `Supplier '${Supplier}' has outstanding invoices of ${totalOutstanding.toFixed(2)}. ` +
            `Adding this invoice (${grossAmt.toFixed(2)}) would exceed credit limit of ${SUPPLIER_CREDIT_LIMIT.toLocaleString()}`,
            'GrossAmount'
          );
        }
      }
    };

    this.before(['CREATE', 'UPDATE'], SupplierInvoiceHeader, (req) => handleSupplierInvoiceBefore(this, req));
  },

  'InfoRecordsManagementService': function () {
    const {
      PurchasingInfoRecord,
      PurchasingOrgInfoRecord,
      MaterialInfoRecordPurchasingConditions,
      MaterialMaster,
      VendorMaster,
      Plant
    } = this.entities;

    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const handlePurchInfoRecordBefore = async (srv, req) => {
      const { Material, Supplier } = req.data;

      if (Material) {
        const materialExists = await SELECT.one.from('MaterialMaster').where({ Material });
        if (!materialExists) return req.error(400, `Material ${Material} does not exist in MaterialMaster (MARA)`);
      }
      if (Supplier) {
        const supplierExists = await SELECT.one.from('VendorMaster').where({ Supplier });
        if (!supplierExists) return req.error(400, `Supplier ${Supplier} does not exist in VendorMaster (LFA1)`);
      }

      if (req.data.toPurchasingOrgInfo && Array.isArray(req.data.toPurchasingOrgInfo)) {
        for (const orgInfo of req.data.toPurchasingOrgInfo) {
          const { PurchasingOrganization, NetPrice, PriceUnit } = orgInfo;

          if (PurchasingOrganization) {
            if (!/^[A-Z0-9]{4}$/.test(PurchasingOrganization)) {
              return req.error(400, `Invalid Purchasing Organization format: ${PurchasingOrganization}. Must be 4 alphanumeric characters.`);
            }
          }

          if (NetPrice !== undefined && NetPrice !== null) {
            const np = parsePositive(NetPrice);
            if (Number.isNaN(np)) return req.error(400, `NetPrice must be a positive decimal value. Received: ${NetPrice}`);

            const PRICE_THRESHOLD = 100000;
            if (np > PRICE_THRESHOLD) {
              return req.error(400, `NetPrice ${np} exceeds maximum allowed threshold of AUD ${PRICE_THRESHOLD.toLocaleString()}`);
            }

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
                  const avg = historicalPrices.reduce((s, r) => s + Number(r.NetPrice || 0), 0) / historicalPrices.length;
                  const threshold = avg * 1.5;
                  if (np > threshold) {
                    return req.error(400, `NetPrice ${np} significantly exceeds historical average of AUD ${avg.toFixed(2)}. Please review pricing.`);
                  }
                }
              } catch (e) {
                console.warn('Could not validate against historical prices:', e.message);
              }
            }
          }

          if (PriceUnit !== undefined && PriceUnit !== null) {
            if (!Number.isInteger(PriceUnit) || PriceUnit <= 0) {
              return req.error(400, `PriceUnit must be a positive integer value. Received: ${PriceUnit}`);
            }
          }
        }
      }

      if (req.data.toPurchasingConditions && Array.isArray(req.data.toPurchasingConditions)) {
        for (const condition of req.data.toPurchasingConditions) {
          const { Plant: plant } = condition;
          if (plant) {
            const plantExists = await SELECT.one.from('Plant').where({ Plant: plant });
            if (!plantExists) return req.error(400, `Plant ${plant} does not exist in Plant (T001W) for purchasing conditions`);
          }
        }
      }
    };

    this.before(['CREATE', 'UPDATE'], PurchasingInfoRecord, (req) => handlePurchInfoRecordBefore(this, req));
  },

  'SourcingRFQService': function () {
    const {
      PurchaseOrderHeader,
      PurchaseOrderItem,
      RFQQuote,
      RFQStatus,
      MaterialMaster,
      Plant,
      PurchasingGroup,
      VendorMaster,
      PurchasingInfoRecord,
      PurchasingOrgInfoRecord,
      PurchaseRequisition
    } = this.entities;

    // Helper functions
    const parsePositive = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const exists = (db, entity, where) => db.exists(entity).where(where);

    const generateRFQNumber = async (db) => {
      const lastRFQ = await db.run(
        SELECT.one.from(PurchaseOrderHeader)
          .columns('PurchaseOrder')
          .where({ DocumentCategory: 'Q' })
          .orderBy('PurchaseOrder desc')
      );

      const lastNum = lastRFQ ? parseInt(lastRFQ.PurchaseOrder.replace('RFQ', '')) : 0;
      return `RFQ${String(lastNum + 1).padStart(7, '0')}`;
    };

    // === RFQ CREATION VALIDATION ===
    this.before(['CREATE', 'UPDATE'], PurchaseOrderHeader, async (req) => {
      const db = cds.transaction(req);
      const {
        Material,
        Plant: plantCode,
        PurchasingGroup: group,
        Supplier,
        DocumentDate,
        toPurchaseOrderItem
      } = req.data;

      // Auto-set RFQ properties
      req.data.DocumentCategory = 'Q';
      req.data.PurchaseOrderType = 'RFQ';

      if (!req.data.PurchaseOrder) {
        req.data.PurchaseOrder = await generateRFQNumber(db);
      }

      // Validate master data
      if (plantCode && !await exists(db, Plant, { Plant: plantCode })) {
        req.error(400, `Plant '${plantCode}' does not exist.`);
      }

      if (group && !await exists(db, PurchasingGroup, { PurchasingGroup: group })) {
        req.error(400, `Purchasing Group '${group}' does not exist.`);
      }

      // Validate RFQ items
      const rfqItems = toPurchaseOrderItem || [];
      if (rfqItems.length === 0) {
        req.error(400, 'RFQ must contain at least one item.');
      }

      let totalEstimatedValue = 0;

      for (const item of rfqItems) {
        const { Material: itemMaterial, Plant: itemPlant, Quantity } = item;

        if (!itemMaterial) req.error(400, 'Each RFQ item must include Material.');
        if (!await exists(db, MaterialMaster, { Material: itemMaterial })) {
          req.error(400, `Material '${itemMaterial}' does not exist.`);
        }

        if (!itemPlant) req.error(400, 'Each RFQ item must include Plant.');
        if (!await exists(db, Plant, { Plant: itemPlant })) {
          req.error(400, `Plant '${itemPlant}' does not exist.`);
        }

        const qty = parsePositive(Quantity);
        if (Number.isNaN(qty)) req.error(400, 'Quantity must be positive.');

        // Get estimated price from purchasing info records if available
        let estimatedPrice = 0;
        const infoRecord = await db.run(
          SELECT.one.from(PurchasingInfoRecord).where({ Material: itemMaterial })
        );

        if (infoRecord) {
          const orgInfo = await db.run(
            SELECT.one.from(PurchasingOrgInfoRecord)
              .where({ PurchasingInfoRecord: infoRecord.PurchasingInfoRecord })
          );
          if (orgInfo && orgInfo.NetPrice) {
            estimatedPrice = parsePositive(orgInfo.NetPrice) / parsePositive(orgInfo.PriceUnit || 1);
          }
        }

        // Use a default estimation if no info record exists
        if (estimatedPrice === 0) estimatedPrice = 50000; // AUD 50k default for used cars

        totalEstimatedValue += qty * estimatedPrice;
      }

      // Validate against purchasing limits
      const MONTHLY_RFQ_LIMIT = 500000; // AUD 500k per Purchasing Group monthly

      if (group && totalEstimatedValue > 0) {
        const currentDate = new Date(DocumentDate || Date.now());
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Get existing RFQs for this purchasing group in current month
        const existingRFQs = await db.run(
          SELECT.from(PurchaseOrderHeader)
            .where({
              PurchasingGroup: group,
              DocumentCategory: 'Q',
              DocumentDate: { '>=': monthStart, '<=': monthEnd },
              PurchaseOrder: { '!=': req.data.PurchaseOrder || 'NEW' }
            })
        );

        let monthlyTotal = 0;
        for (const rfq of existingRFQs) {
          const items = await db.run(
            SELECT.from(PurchaseOrderItem).where({ PurchaseOrder: rfq.PurchaseOrder })
          );
          for (const item of items) {
            if (item.NetPrice && item.Quantity) {
              monthlyTotal += parsePositive(item.NetPrice) * parsePositive(item.Quantity);
            }
          }
        }

        if ((monthlyTotal + totalEstimatedValue) > MONTHLY_RFQ_LIMIT) {
          req.error(
            400,
            `Purchasing Group '${group}' has ${monthlyTotal.toFixed(2)} AUD in RFQs this month. ` +
            `Adding this RFQ (est. ${totalEstimatedValue.toFixed(2)} AUD) exceeds monthly limit of ${MONTHLY_RFQ_LIMIT.toLocaleString()} AUD.`
          );
        }
      }

      // Create initial RFQ status
      if (req.event === 'CREATE') {
        await db.run(
          INSERT.into(RFQStatus).entries({
            PurchaseOrder: req.data.PurchaseOrder,
            Status: 'DRAFT'
          })
        );
      }
    });

    // === RFQ ACTIONS ===

    // Send RFQ to suppliers
    this.on('sendRFQ', PurchaseOrderHeader, async (req) => {
      const { PurchaseOrder } = req.params[0];
      const db = cds.transaction(req);

      try {
        // Validate RFQ exists and is in DRAFT status
        const rfqStatus = await db.run(
          SELECT.one.from(RFQStatus).where({ PurchaseOrder })
        );

        if (!rfqStatus) {
          req.error(404, `RFQ ${PurchaseOrder} not found.`);
          return;
        }

        if (rfqStatus.Status !== 'DRAFT') {
          req.error(400, `RFQ ${PurchaseOrder} is not in DRAFT status. Current status: ${rfqStatus.Status}`);
          return;
        }

        // Update status to SENT
        await db.run(
          UPDATE(RFQStatus)
            .set({
              Status: 'SENT',
              SentDate: new Date().toISOString(),
              ResponseDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
            })
            .where({ PurchaseOrder })
        );

        // TODO: Implement email/SAP integration here
        console.log(`RFQ ${PurchaseOrder} sent to suppliers`);

        req.notify('success', `RFQ ${PurchaseOrder} sent successfully`);
        return `RFQ ${PurchaseOrder} sent successfully`;

      } catch (error) {
        req.error(500, `Error sending RFQ: ${error.message}`);
      }
    });

    // Close RFQ
    this.on('closeRFQ', PurchaseOrderHeader, async (req) => {
      const { PurchaseOrder } = req.params[0];
      const db = cds.transaction(req);

      try {
        await db.run(
          UPDATE(RFQStatus)
            .set({
              Status: 'CLOSED',
              ClosedDate: new Date().toISOString()
            })
            .where({ PurchaseOrder })
        );

        req.notify('success', `RFQ ${PurchaseOrder} closed successfully`);
        return `RFQ ${PurchaseOrder} closed successfully`;

      } catch (error) {
        req.error(500, `Error closing RFQ: ${error.message}`);
      }
    });

    // Convert RFQ to Purchase Requisition
    this.on('convertToPR', PurchaseOrderHeader, async (req) => {
      const { PurchaseOrder } = req.params?.[0] || {};
      const db = cds.transaction(req);

      if (!PurchaseOrder) {
        return req.reject(400, 'Missing PurchaseOrder in parameters.');
      }

      // Defaults (adjust to your customizing / master data)
      const DEFAULT_PR_TYPE = 'NB';   // must exist in T161 / PurchasingDocumentType
      const DEFAULT_PGROUP = '001';  // must exist in T024 / PurchasingGroup
      const DEFAULT_REQSTR = (req.user && req.user.id ? String(req.user.id) : 'SYSTEM').slice(0, 12);
      const DEFAULT_CREATEDBY = DEFAULT_REQSTR;

      try {
        // 1) Pull all SELECTED quotes for this RFQ number (PurchaseOrder)
        const selectedQuotes = await db.run(
          SELECT.from(RFQQuote)
            .columns(
              'PurchaseOrder',
              'PurchaseOrderItem',
              'Supplier',
              'Material',
              'NetPrice',
              'PriceUnit',
              'DeliveryDate',
              'Currency'
            )
            .where({ PurchaseOrder, QuoteStatus: 'SELECTED' })
        );

        if (!selectedQuotes.length) {
          return req.reject(400, `No selected quotes found for RFQ ${PurchaseOrder}.`);
        }

        // 2) For each quote, find the matching RFQ item for Plant/StorageLocation/Quantity/BaseUnit
        //    and create/ensure a PR line.
        const entries = [];
        for (const q of selectedQuotes) {
          // Fetch item data for this RFQ line
          const it = await db.run(
            SELECT.one.from(PurchaseOrderItem)
              .columns('Plant', 'StorageLocation', 'Quantity', 'BaseUnit')
              .where({ PurchaseOrder: q.PurchaseOrder, PurchaseOrderItem: q.PurchaseOrderItem })
          );
          if (!it) {
            return req.reject(404, `RFQ Item ${q.PurchaseOrder}/${q.PurchaseOrderItem} not found.`);
          }

          // Build PR row (one line per selected quote)
          const prRow = {
            // Keys (reuse RFQ number + item as PR keys)
            PurchaseRequisition: q.PurchaseOrder,       // String(10)
            PurchaseReqnItem: q.PurchaseOrderItem,   // String(5)

            // Mandatory business fields
            Material: q.Material,
            Plant: it.Plant,
            StorageLocation: it.StorageLocation,
            PurchasingGroup: DEFAULT_PGROUP,    // change if you can derive from header/item
            PurchaseRequisitionType: DEFAULT_PR_TYPE,

            Quantity: it.Quantity,
            BaseUnit: it.BaseUnit,
            DeliveryDate: q.DeliveryDate,

            // Status & audit
            ReleaseStatus: 'NOT_REL',
            Requisitioner: DEFAULT_REQSTR,
            RequisitionDate: new Date().toISOString().slice(0, 19), // your model is String(20)
            CreatedByUser: DEFAULT_CREATEDBY
          };

          // Validate minimal required values
          for (const f of [
            'Material', 'Plant', 'StorageLocation', 'PurchasingGroup',
            'PurchaseRequisitionType', 'Quantity', 'BaseUnit', 'DeliveryDate'
          ]) {
            if (prRow[f] == null || prRow[f] === '') {
              return req.reject(400,
                `Cannot create PR line ${q.PurchaseOrder}/${q.PurchaseOrderItem}: missing ${f}.`);
            }
          }

          // Check if PR line already exists
          const exists = await db.exists(PurchaseRequisition).where({
            PurchaseRequisition: prRow.PurchaseRequisition,
            PurchaseReqnItem: prRow.PurchaseReqnItem
          });

          if (!exists) {
            entries.push(prRow);
          } else {
            // If you want to refresh fields on existing PR line, uncomment this:
            await db.run(
              UPDATE(PurchaseRequisition)
                .set({
                  Material: prRow.Material,
                  Plant: prRow.Plant,
                  StorageLocation: prRow.StorageLocation,
                  PurchasingGroup: prRow.PurchasingGroup,
                  PurchaseRequisitionType: prRow.PurchaseRequisitionType,
                  Quantity: prRow.Quantity,
                  BaseUnit: prRow.BaseUnit,
                  DeliveryDate: prRow.DeliveryDate
                })
                .where({
                  PurchaseRequisition: prRow.PurchaseRequisition,
                  PurchaseReqnItem: prRow.PurchaseReqnItem
                })
            );
          }
        }

        // 3) Bulk insert new PR lines (if any)
        if (entries.length) {
          await db.run(INSERT.into(PurchaseRequisition).entries(entries));
        }

        // 4) Optionally close the RFQ
        await db.run(
          UPDATE(RFQStatus)
            .set({
              Status: 'CLOSED',
              ClosedDate: new Date().toISOString()
            })
            .where({ PurchaseOrder })
        );

        const msg = `RFQ ${PurchaseOrder} converted to PR successfully. ${entries.length} new PR line(s) created.`;
        console.log(msg);
        req.notify?.('success', msg);
        return msg;

      } catch (error) {
        console.error('Error converting RFQ to PR:', error);
        return req.reject(500, `Error converting RFQ to PR: ${error.message}`);
      }
    });


    // Convert RFQ to Purchase Order
    this.on('convertToPO', PurchaseOrderHeader, async (req) => {
      const { PurchaseOrder } = req.params[0];
      const db = cds.transaction(req);

      try {
        // Get selected quotes
        const selectedQuotes = await db.run(
          SELECT.from(RFQQuote)
            .where({ PurchaseOrder, QuoteStatus: 'SELECTED' })
        );

        if (selectedQuotes.length === 0) {
          req.error(400, 'No quotes selected for conversion to PO');
          return;
        }

        // TODO: Implement PO creation logic based on selected quotes
        // This would create a new PurchaseOrderHeader with DocumentCategory='F' (Standard PO)

        req.notify('success', `RFQ ${PurchaseOrder} converted to PO successfully`);
        return `RFQ ${PurchaseOrder} converted to PO successfully`;

      } catch (error) {
        req.error(500, `Error converting RFQ to PO: ${error.message}`);
      }
    });

    // === QUOTE MANAGEMENT ===

    this.on('selectQuote', RFQQuote, async (req) => {
      const { PurchaseOrder } = req.params?.[0] || {};
      const db = cds.transaction(req);

      if (!PurchaseOrder) {
        return req.reject(400, 'Missing PurchaseOrder in parameters.');
      }

      try {
        // Find any one quote for this PO (could add filters if needed)
        const quote = await db.run(
          SELECT.one.from(RFQQuote).where({ PurchaseOrder })
        );

        if (!quote) {
          return req.reject(404, `Quote not found for PurchaseOrder '${PurchaseOrder}'`);
        }

        // Mark all quotes for this PO as REJECTED first
        await db.run(
          UPDATE(RFQQuote)
            .set({ QuoteStatus: 'REJECTED' })
            .where({ PurchaseOrder })
        );

        // Mark the selected quote as SELECTED
        await db.run(
          UPDATE(RFQQuote)
            .set({ QuoteStatus: 'SELECTED' })
            .where({ PurchaseOrder })
        );

        // Update RFQ status
        await db.run(
          UPDATE(RFQStatus)
            .set({
              Status: 'EVALUATED',
              EvaluationDate: new Date().toISOString()
            })
            .where({ PurchaseOrder })
        );

        const msg = `Winning quote for PurchaseOrder ${PurchaseOrder} selected successfully.`;
        req.notify?.('success', msg);
        return msg;

      } catch (error) {
        console.error('Error selecting quote:', error);
        return req.reject(500, `Error selecting quote: ${error.message}`);
      }
    });

    // === CUSTOM FUNCTIONS ===

    // Get quote comparison
    this.on('getQuoteComparison', async (req) => {
      const { rfqId } = req.data;
      const db = cds.transaction(req);

      try {
        const quotes = await db.run(
          SELECT.from(RFQQuote)
            .columns([
              'Supplier',
              'NetPrice',
              'DeliveryDate',
              'Material'
            ])
            .where({ PurchaseOrder: rfqId })
        );

        // Get supplier names and calculate rankings
        const result = [];
        for (let i = 0; i < quotes.length; i++) {
          const quote = quotes[i];
          const supplier = await db.run(
            SELECT.one.from(VendorMaster).where({ Supplier: quote.Supplier })
          );

          // Get quantity from RFQ item
          const rfqItem = await db.run(
            SELECT.one.from(PurchaseOrderItem)
              .where({
                PurchaseOrder: rfqId,
                Material: quote.Material
              })
          );

          const quantity = parsePositive(rfqItem?.Quantity || 1);
          const totalValue = parsePositive(quote.NetPrice) * quantity;

          result.push({
            Supplier: quote.Supplier,
            SupplierName: supplier?.SupplierName || quote.Supplier,
            NetPrice: quote.NetPrice,
            DeliveryDate: quote.DeliveryDate,
            TotalValue: totalValue,
            Ranking: i + 1 // Simple ranking by order, could be enhanced
          });
        }

        // Sort by total value (ascending - cheapest first)
        result.sort((a, b) => a.TotalValue - b.TotalValue);
        result.forEach((item, index) => item.Ranking = index + 1);

        return result;

      } catch (error) {
        req.error(500, `Error getting quote comparison: ${error.message}`);
      }
    });

    // Validate RFQ budget
    this.on('validateRFQBudget', async (req) => {
      const { rfqId, estimatedValue } = req.data;
      const MONTHLY_LIMIT = 500000; // AUD 500k

      // Simple validation - in reality would check against actual budgets
      const withinBudget = estimatedValue <= MONTHLY_LIMIT;

      return {
        withinBudget,
        availableBudget: MONTHLY_LIMIT - (withinBudget ? estimatedValue : 0),
        message: withinBudget
          ? 'RFQ is within budget limits'
          : `RFQ exceeds monthly limit of ${MONTHLY_LIMIT.toLocaleString()} AUD`
      };
    });
  }
};
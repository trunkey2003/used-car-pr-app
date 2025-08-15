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

  // 'SourcingRFQService': function() {
  //   const {
  //     PurchaseOrderHeader,
  //   } = this.entities;

  //   this.before('CREATE', PurchaseOrderHeader, async (req) => {
  //     // Ensure DocumentCategory is set to "Q" for RFQs
  //     req.data.DocumentCategory = 'Q';
  //     console.log('Creating RFQ');
  //   });

  //   this.on('convertRFQToPR', async (req) => {
  //     const { rfqId } = req.data;
  //     // Add conversion logic from RFQ to PR
  //     return `RFQ ${rfqId} converted to Purchase Requisition successfully`;
  //   });

  //   this.on('convertRFQToPO', async (req) => {
  //     const { rfqId } = req.data;
  //     // Add conversion logic from RFQ to PO
  //     return `RFQ ${rfqId} converted to Purchase Order successfully`;
  //   });
  // }
};
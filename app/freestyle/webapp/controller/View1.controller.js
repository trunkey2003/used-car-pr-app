sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Fragment, Spreadsheet, exportLibrary) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("freestyle.controller.View1", {
        onInit() {
            const oViewModel = new JSONModel({
                count: 0,
                busy: false,
                title: "Purchase Requisitions"
            });
            this.getView().setModel(oViewModel, "view");
            this._initializeWhenModelReady();
        },
        _initializeWhenModelReady() {
            const oView = this.getView();
            const oModel = oView.getModel();
            if (oModel && oModel.getMetaModel) {
                this._loadData();
                this._setupCountBinding();
            } else {
                oView.attachModelContextChange(this._onModelContextChange.bind(this));
            }
        },
        _onModelContextChange() {
            const oModel = this.getView().getModel();
            if (oModel && oModel.getMetaModel) {
                this.getView().detachModelContextChange(this._onModelContextChange.bind(this));
                this._loadData();
                this._setupCountBinding();
            }
        },
        _loadData() {
            const oTable = this.byId("purchaseRequisitionTable");
            if (!oTable) {
                return;
            }
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.attachDataReceived(this._onDataReceived.bind(this));
                oBinding.attachDataRequested(this._onDataRequested.bind(this));
            } else {
                oTable.attachEvent("_bindingChange", () => {
                    const oNewBinding = oTable.getBinding("items");
                    if (oNewBinding) {
                        oNewBinding.attachDataReceived(this._onDataReceived.bind(this));
                        oNewBinding.attachDataRequested(this._onDataRequested.bind(this));
                    }
                });
            }
        },
        _setupCountBinding() {
            const oModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("view");
            if (!oModel || !oModel.bindList) {
                return;
            }
            try {
                const oListBinding = oModel.bindList("/PurchaseRequisition", null, null, null, {
                    $count: true
                });
                oListBinding.requestContexts(0, 1).then((aContexts) => {
                    const iCount = oListBinding.getCount();
                    oViewModel.setProperty("/count", iCount || 0);
                }).catch((oError) => {
                    console.warn("Could not get count:", oError);
                    oViewModel.setProperty("/count", 0);
                });
            } catch (oError) {
                console.warn("Error setting up count binding:", oError);
                oViewModel.setProperty("/count", 0);
            }
        },
        _onDataRequested() {
            this.getView().getModel("view").setProperty("/busy", true);
        },
        _onDataReceived(oEvent) {
            const oViewModel = this.getView().getModel("view");
            const oData = oEvent.getParameter("data");
            oViewModel.setProperty("/busy", false);
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            if (oBinding && oBinding.getLength) {
                const iCount = oBinding.getLength();
                oViewModel.setProperty("/count", iCount);
            } else if (oData && oData.results) {
                oViewModel.setProperty("/count", oData.results.length);
            }
        },
        onApplyFilters() {
            const aFilters = this._buildFilters();
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
            MessageToast.show("Filters applied");
        },
        onClearFilters() {
            this.byId("materialFilter").setValue("");
            this.byId("plantFilter").setValue("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("dateFromFilter").setValue("");
            this.byId("dateToFilter").setValue("");
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([]);
            MessageToast.show("Filters cleared");
        },
        _buildFilters() {
            const aFilters = [];
            const sMaterial = this.byId("materialFilter").getValue();
            if (sMaterial) {
                aFilters.push(new Filter("Material", FilterOperator.Contains, sMaterial));
            }
            const sPlant = this.byId("plantFilter").getValue();
            if (sPlant) {
                aFilters.push(new Filter("Plant", FilterOperator.Contains, sPlant));
            }
            const sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus) {
                aFilters.push(new Filter("ReleaseStatus", FilterOperator.EQ, sStatus));
            }
            const dDateFrom = this.byId("dateFromFilter").getDateValue();
            const dDateTo = this.byId("dateToFilter").getDateValue();
            if (dDateFrom) {
                aFilters.push(new Filter("DeliveryDate", FilterOperator.GE, dDateFrom));
            }
            if (dDateTo) {
                aFilters.push(new Filter("DeliveryDate", FilterOperator.LE, dDateTo));
            }
            return aFilters;
        },
        onSort() {
            if (!this._sortDialog) {
                this._createSortDialog();
            }
            this._sortDialog.open();
        },
        _createSortDialog() {
            this._sortDialog = new sap.m.ViewSettingsDialog({
                confirm: this._handleSortConfirm.bind(this),
                sortItems: [
                    new sap.m.ViewSettingsItem({
                        text: "PR Number",
                        key: "PurchaseRequisition"
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Material",
                        key: "Material"
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Plant",
                        key: "Plant"
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Delivery Date",
                        key: "DeliveryDate"
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Created At",
                        key: "createdAt",
                        selected: true
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Status",
                        key: "ReleaseStatus"
                    }),
                    new sap.m.ViewSettingsItem({
                        text: "Quantity",
                        key: "Quantity"
                    })
                ]
            });
        },
        _handleSortConfirm(oEvent) {
            const mParams = oEvent.getParameters();
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            const sSortPath = mParams.sortItem.getKey();
            const bDescending = mParams.sortDescending;
            const aSorters = [];
            aSorters.push(new Sorter(sSortPath, bDescending));
            oBinding.sort(aSorters);
            const sMessage = `Sorted by ${mParams.sortItem.getText()} ${bDescending ? "descending" : "ascending"}`;
            MessageToast.show(sMessage);
        },
        onTableSettings() {
            MessageToast.show("Table settings functionality can be implemented here");
        },
        onCreate() {
            MessageBox.information("Create Purchase Requisition functionality will be implemented");
        },
        onEdit(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sPath = oContext.getPath();
            MessageBox.information(`Edit functionality for item: ${sPath}`);
        },
        onDelete(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sPRNumber = oContext.getProperty("PurchaseRequisition");
            const sItem = oContext.getProperty("PurchaseReqnItem");
            MessageBox.confirm(`Are you sure you want to delete PR ${sPRNumber}-${sItem}?`, {
                onAction: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._deletePurchaseRequisition(oContext);
                    }
                }
            });
        },
        _deletePurchaseRequisition(oContext) {
            const oModel = this.getView().getModel();
            oModel.delete(oContext.getPath(), {
                success: () => {
                    MessageToast.show("Purchase Requisition deleted successfully");
                    this.onRefresh();
                },
                error: (oError) => {
                    MessageBox.error("Error deleting Purchase Requisition: " + oError.message);
                }
            });
        },
        onItemPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sPRNumber = oContext.getProperty("PurchaseRequisition");
            const sItem = oContext.getProperty("PurchaseReqnItem");
            MessageBox.information(`Selected PR: ${sPRNumber}-${sItem}\nDetails view can be implemented here`);
        },
        onExport() {
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            if (!oBinding || oBinding.getLength() === 0) {
                MessageToast.show("No data to export");
                return;
            }
            const aCols = this._createColumnConfig();
            const oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oBinding,
                fileName: `PurchaseRequisitions_${new Date().toISOString().slice(0, 10)}.xlsx`,
                worker: false
            };
            const oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(() => {
                    MessageToast.show("Export successful");
                })
                .finally(() => {
                    oSheet.destroy();
                });
        },
        _createColumnConfig() {
            return [
                {
                    label: "PR Number",
                    property: "PurchaseRequisition",
                    type: EdmType.String
                },
                {
                    label: "Item",
                    property: "PurchaseReqnItem",
                    type: EdmType.String
                },
                {
                    label: "Material",
                    property: "Material",
                    type: EdmType.String
                },
                {
                    label: "Plant",
                    property: "Plant",
                    type: EdmType.String
                },
                {
                    label: "Storage Location",
                    property: "StorageLocation",
                    type: EdmType.String
                },
                {
                    label: "Quantity",
                    property: "Quantity",
                    type: EdmType.Number
                },
                {
                    label: "Base Unit",
                    property: "BaseUnit",
                    type: EdmType.String
                },
                {
                    label: "Delivery Date",
                    property: "DeliveryDate",
                    type: EdmType.Date
                },
                {
                    label: "Status",
                    property: "ReleaseStatus",
                    type: EdmType.String
                },
                {
                    label: "Requisitioner",
                    property: "Requisitioner",
                    type: EdmType.String
                },
                {
                    label: "Purchasing Group",
                    property: "PurchasingGroup",
                    type: EdmType.String
                }
            ];
        },
        onRefresh() {
            const oModel = this.getView().getModel();
            oModel.refresh();
            MessageToast.show("Data refreshed");
        },
        formatStatus(sStatus) {
            switch (sStatus) {
                case "RELEASED":
                    return "Success";
                case "OPEN":
                    return "Warning";
                case "CLOSED":
                    return "None";
                default:
                    return "Information";
            }
        }
    });
});
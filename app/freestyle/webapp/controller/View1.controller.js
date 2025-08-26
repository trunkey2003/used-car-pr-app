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
    "sap/ui/export/library",
    "sap/m/library"
], (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Fragment, Spreadsheet, exportLibrary, mobileLibrary) => {
    "use strict";
    
    const EdmType = exportLibrary.EdmType;
    const ButtonType = mobileLibrary.ButtonType;
    
    return Controller.extend("freestyle.controller.View1", {
        onInit() {
            console.log("View1 Controller - onInit started");
            
            // Initialize view model
            const oViewModel = new JSONModel({
                count: 0,
                busy: false,
                title: "Purchase Requisitions"
            });
            this.getView().setModel(oViewModel, "view");
            
            // Use onAfterRendering to ensure view elements are available
            this.getView().attachAfterRendering(this._onViewRendered, this);
        },
        
        _onViewRendered() {
            console.log("View has been rendered");
            
            // Detach the event to prevent multiple calls
            this.getView().detachAfterRendering(this._onViewRendered, this);
            
            // Now wait for the model to be available
            this._waitForModel();
        },
        
        _waitForModel() {
            const oView = this.getView();
            const oModel = oView.getModel();
            
            console.log("Checking model availability:", {
                model: !!oModel,
                hasMetaModel: !!(oModel && oModel.getMetaModel),
                serviceUrl: oModel ? oModel.sServiceUrl : "No service URL"
            });
            
            if (oModel && oModel.getMetaModel) {
                // Model is ready, proceed with initialization
                console.log("Model is ready, initializing data loading");
                this._initializeDataLoading();
            } else {
                // Model not ready yet, wait for it
                console.log("Model not ready, waiting for model context change");
                oView.attachModelContextChange(this._onModelReady, this);
            }
        },
        
        _onModelReady() {
            const oView = this.getView();
            const oModel = oView.getModel();
            
            console.log("Model context changed, checking readiness");
            
            if (oModel && oModel.getMetaModel) {
                console.log("Model is now ready");
                oView.detachModelContextChange(this._onModelReady, this);
                this._initializeDataLoading();
            }
        },
        
        _initializeDataLoading() {
            console.log("Initializing data loading");
            
            // Debug: Check what controls exist in the view
            const oView = this.getView();
            console.log("View content:", oView.getContent());
            console.log("All controls in view:", oView.getControlsByFieldGroupId(""));
            
            // Try different ways to find the table
            const oTable1 = this.byId("purchaseRequisitionTable");
            const oTable2 = this.getView().byId("purchaseRequisitionTable");
            const oTable3 = sap.ui.getCore().byId("purchaseRequisitionTable");
            
            console.log("Table search results:", {
                "this.byId": !!oTable1,
                "view.byId": !!oTable2,
                "core.byId": !!oTable3
            });
            
            // Double-check that the table exists now
            const oTable = oTable1 || oTable2 || oTable3;
            if (!oTable) {
                console.error("Table 'purchaseRequisitionTable' still not found!");
                
                // Debug: List all controls in the view
                const aControls = [];
                const fnCollectControls = function(oControl) {
                    aControls.push({
                        id: oControl.getId(),
                        type: oControl.getMetadata().getName()
                    });
                    if (oControl.getAggregation) {
                        ["content", "items", "pages", "dependents"].forEach(sAggregation => {
                            const aChildren = oControl.getAggregation(sAggregation);
                            if (aChildren) {
                                if (Array.isArray(aChildren)) {
                                    aChildren.forEach(fnCollectControls);
                                } else {
                                    fnCollectControls(aChildren);
                                }
                            }
                        });
                    }
                };
                
                oView.getContent().forEach(fnCollectControls);
                console.log("All controls in view:", aControls);
                
                // Try one more time after a short delay
                setTimeout(() => {
                    console.log("Retrying table initialization after delay");
                    const oRetryTable = this.byId("purchaseRequisitionTable") || 
                                       this.getView().byId("purchaseRequisitionTable") ||
                                       sap.ui.getCore().byId("purchaseRequisitionTable");
                    if (oRetryTable) {
                        console.log("Table found on retry");
                        this._processTableBinding(oRetryTable);
                    } else {
                        console.error("Table still not found after retry");
                        console.log("Available tables:", aControls.filter(c => c.type.includes("Table")));
                        MessageBox.error("Unable to initialize table. Please check the view configuration.");
                    }
                }, 200);
                return;
            }
            
            console.log("Table found successfully:", oTable.getId());
            this._processTableBinding(oTable);
        },
        
        _processTableBinding(oTable) {
            // Check if table already has a binding
            let oBinding = oTable.getBinding("items");
            console.log("Existing table binding:", !!oBinding);
            
            if (!oBinding) {
                // Create the binding manually if it doesn't exist
                console.log("Creating table binding manually");
                this._createTableBinding(oTable);
            } else {
                // Attach events to existing binding
                this._attachBindingEvents(oBinding);
            }
            
            // Setup count binding
            this._setupCountBinding();
        },
        
        _createTableBinding(oTable) {
            const oModel = this.getView().getModel();
            
            if (!oModel) {
                console.error("No model available for binding");
                return;
            }
            
            try {
                console.log("Creating table binding with model:", oModel.sServiceUrl);
                
                oTable.bindItems({
                    path: "/PurchaseRequisition",
                    parameters: {
                        $count: true
                    },
                    sorter: new Sorter("createdAt", true),
                    template: oTable.getBindingInfo("items") ? oTable.getBindingInfo("items").template : oTable.getItems()[0]?.clone()
                });
                
                console.log("Table binding created successfully");
                
                // Attach events to the new binding
                const oNewBinding = oTable.getBinding("items");
                if (oNewBinding) {
                    console.log("New binding available, attaching events");
                    this._attachBindingEvents(oNewBinding);
                } else {
                    console.error("Failed to get binding after creation");
                }
                
            } catch (oError) {
                console.error("Error creating table binding:", oError);
                MessageBox.error("Error loading data: " + oError.message);
            }
        },
        
        _attachBindingEvents(oBinding) {
            console.log("Attaching binding events");
            
            oBinding.attachDataReceived((oEvent) => {
                console.log("Data received event fired");
                this._onDataReceived(oEvent);
            });
            
            oBinding.attachDataRequested(() => {
                console.log("Data requested event fired");
                this._onDataRequested();
            });
            
            oBinding.attachChange(() => {
                console.log("Binding change event fired");
            });
            
            // Force a refresh to trigger data loading
            console.log("Forcing binding refresh");
            oBinding.refresh();
        },
        
        _setupCountBinding() {
            const oModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("view");
            
            if (!oModel || !oModel.bindList) {
                console.warn("Cannot setup count binding - model not ready");
                return;
            }
            
            try {
                console.log("Setting up count binding");
                const oListBinding = oModel.bindList("/PurchaseRequisition", null, null, null, {
                    $count: true
                });
                
                oListBinding.requestContexts(0, 1).then((aContexts) => {
                    const iCount = oListBinding.getCount();
                    console.log("Count retrieved:", iCount);
                    oViewModel.setProperty("/count", iCount || 0);
                }).catch((oError) => {
                    console.error("Error getting count:", oError);
                    oViewModel.setProperty("/count", 0);
                });
                
            } catch (oError) {
                console.error("Error setting up count binding:", oError);
                oViewModel.setProperty("/count", 0);
            }
        },
        
        _onDataRequested() {
            console.log("Data requested - setting busy indicator");
            this.getView().getModel("view").setProperty("/busy", true);
        },
        
        _onDataReceived(oEvent) {
            console.log("Data received event handler");
            const oViewModel = this.getView().getModel("view");
            const oData = oEvent.getParameter("data");
            
            console.log("Received data:", {
                hasData: !!oData,
                hasResults: !!(oData && oData.results),
                resultCount: oData && oData.results ? oData.results.length : 0
            });
            
            oViewModel.setProperty("/busy", false);
            
            // Update count - get table from event source instead
            const oBinding = oEvent.getSource(); // The binding that fired the event
            
            if (oBinding && typeof oBinding.getLength === 'function') {
                const iCount = oBinding.getLength();
                console.log("Table binding length:", iCount);
                oViewModel.setProperty("/count", iCount);
            } else if (oData && oData.results) {
                console.log("Using data results length:", oData.results.length);
                oViewModel.setProperty("/count", oData.results.length);
            } else if (oData && oData.value) {
                console.log("Using data value length:", oData.value.length);
                oViewModel.setProperty("/count", oData.value.length);
            } else {
                console.log("No count available, setting to 0");
                oViewModel.setProperty("/count", 0);
            }
            
            // Show success message if data was loaded
            if (oData && ((oData.results && oData.results.length > 0) || (oData.value && oData.value.length > 0))) {
                const count = (oData.results || oData.value).length;
                console.log("Data loaded successfully");
                MessageToast.show(`Loaded ${count} purchase requisitions`);
            } else {
                console.log("No data loaded");
                MessageToast.show("No purchase requisitions found");
            }
        },
        
        onApplyFilters() {
            const aFilters = this._buildFilters();
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                oBinding.filter(aFilters);
                MessageToast.show("Filters applied");
            } else {
                MessageBox.error("Cannot apply filters - table not bound to data");
            }
        },
        
        onClearFilters() {
            this.byId("materialFilter").setValue("");
            this.byId("plantFilter").setValue("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("dateFromFilter").setValue("");
            this.byId("dateToFilter").setValue("");
            
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                oBinding.filter([]);
                MessageToast.show("Filters cleared");
            }
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
            } else {
                this._sortDialog.open();
            }
        },
        
        _createSortDialog() {
            sap.ui.require(["sap/m/ViewSettingsDialog", "sap/m/ViewSettingsItem"], 
                (ViewSettingsDialog, ViewSettingsItem) => {
                    this._sortDialog = new ViewSettingsDialog({
                        confirm: this._handleSortConfirm.bind(this),
                        sortItems: [
                            new ViewSettingsItem({
                                text: "PR Number",
                                key: "PurchaseRequisition"
                            }),
                            new ViewSettingsItem({
                                text: "Material",
                                key: "Material"
                            }),
                            new ViewSettingsItem({
                                text: "Plant",
                                key: "Plant"
                            }),
                            new ViewSettingsItem({
                                text: "Delivery Date",
                                key: "DeliveryDate"
                            }),
                            new ViewSettingsItem({
                                text: "Created At",
                                key: "createdAt",
                                selected: true
                            }),
                            new ViewSettingsItem({
                                text: "Status",
                                key: "ReleaseStatus"
                            }),
                            new ViewSettingsItem({
                                text: "Quantity",
                                key: "Quantity"
                            })
                        ]
                    });
                    this._sortDialog.open();
                }
            );
        },
        
        _handleSortConfirm(oEvent) {
            const mParams = oEvent.getParameters();
            const oTable = this.byId("purchaseRequisitionTable");
            const oBinding = oTable.getBinding("items");
            
            if (!oBinding) {
                MessageBox.error("Cannot sort - table not bound to data");
                return;
            }
            
            const sSortPath = mParams.sortItem.getKey();
            const bDescending = mParams.sortDescending;
            const aSorters = [new Sorter(sSortPath, bDescending)];
            
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
            if (oContext) {
                const sPath = oContext.getPath();
                MessageBox.information(`Edit functionality for item: ${sPath}`);
            } else {
                MessageBox.error("Cannot edit - no context available");
            }
        },
        
        onDelete(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                MessageBox.error("Cannot delete - no context available");
                return;
            }
            
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
                    console.error("Delete error:", oError);
                    MessageBox.error("Error deleting Purchase Requisition: " + (oError.message || "Unknown error"));
                }
            });
        },
        
        onItemPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            if (oContext) {
                const sPRNumber = oContext.getProperty("PurchaseRequisition");
                const sItem = oContext.getProperty("PurchaseReqnItem");
                MessageBox.information(`Selected PR: ${sPRNumber}-${sItem}\nDetails view can be implemented here`);
            }
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
                .catch((oError) => {
                    console.error("Export error:", oError);
                    MessageBox.error("Export failed: " + oError.message);
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
            console.log("Refresh button pressed");
            const oModel = this.getView().getModel();
            const oTable = this.byId("purchaseRequisitionTable");
            
            if (oModel) {
                oModel.refresh();
                MessageToast.show("Data refreshed");
            }
            
            // Also refresh the table binding specifically
            if (oTable) {
                const oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh();
                }
            }
        },
        
        formatStatus(sStatus) {
            const statusMap = {
                "RELEASED": "Success",
                "OPEN": "Warning", 
                "CLOSED": "None"
            };
            return statusMap[sStatus] || "Information";
        }
    });
});
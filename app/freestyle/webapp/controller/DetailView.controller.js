sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/f/library"
], (Controller, JSONModel, MessageBox, MessageToast, fioriLibrary) => {
    "use strict";

    return Controller.extend("freestyle.controller.DetailView", {

        onInit() {
            // Get the router instance
            this.oRouter = this.getOwnerComponent().getRouter();

            // Attach pattern matched event for direct URL access
            this.oRouter.getRoute("DetailRoute").attachPatternMatched(this._onObjectMatched, this);

            // Initialize view model
            const oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                mode: "display", // display, edit
                showCloseColumn: false
            });
            this.getView().setModel(oViewModel, "detailView");
        },

        /**
         * Event handler for when the route pattern is matched (direct URL access)
         * @param {sap.ui.base.Event} oEvent - The route matched event
         */
        _onObjectMatched(oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sPRNumber = oArguments.prNumber;
            const sPRItem = oArguments.prItem;

            // Validate parameters
            if (!sPRNumber || !sPRItem) {
                console.error("Missing required parameters: prNumber or prItem");
                return;
            }

            this.bindDetailData(sPRNumber, sPRItem);
        },

        /**
         * Bind detail data - can be called from route or from master list
         * @param {string} sPRNumber - PR Number
         * @param {string} sPRItem - PR Item
         */
        bindDetailData(sPRNumber, sPRItem) {
            // Use standard OData v4 key syntax for composite keys
            const sObjectPath = `/PurchaseRequisition(PurchaseRequisition='${sPRNumber}',PurchaseReqnItem='${sPRItem}',IsActiveEntity=true)`;
            console.log("Binding to path:", sObjectPath);

            this._bindView(sObjectPath);
        },

        /**
         * Bind the view to the specific purchase requisition
         * @param {string} sObjectPath - The object path
         */
        _bindView(sObjectPath) {
            const oView = this.getView();
            const oViewModel = oView.getModel("detailView");

            oViewModel.setProperty("/busy", true);

            oView.bindElement({
                path: sObjectPath,
                parameters: {
                    $expand: "toMaterial,toPlant,toStorageLocation,toPurchasingGroup,AccountAssignments"
                },
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: () => {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: (oEvent) => {
                        oViewModel.setProperty("/busy", false);
                        const oData = oEvent.getParameter("data");
                        if (!oData) {
                            console.warn("No data received for binding");
                            MessageToast.show("Purchase Requisition not found");
                        }
                    }
                }
            });
        },

        /**
         * Event handler for binding change
         */
        _onBindingChange() {
            const oView = this.getView();
            const oElementBinding = oView.getElementBinding();
            const oViewModel = oView.getModel("detailView");

            // No data for the binding
            if (!oElementBinding || !oElementBinding.getBoundContext()) {
                MessageToast.show("Purchase Requisition not found");
                return;
            }

            const oBindingContext = oView.getBindingContext();

            // Check if binding context and object are available
            if (!oBindingContext) {
                console.warn("Binding context not yet available");
                return;
            }

            const oObject = oBindingContext.getObject();

            // Check if object data is available
            if (!oObject || !oObject.PurchaseRequisition) {
                console.warn("Object data not yet available");
                return;
            }

            const sPRNumber = oObject.PurchaseRequisition;
            const sPRItem = oObject.PurchaseReqnItem;

            oViewModel.setProperty("/busy", false);

            // Update page title dynamically
            this._updatePageTitle(sPRNumber, sPRItem);
        },

        /**
         * Update page title
         */
        _updatePageTitle(sPRNumber, sPRItem) {
            const oDynamicPage = this.byId("dynamicPageId");
            if (oDynamicPage) {
                const oTitle = oDynamicPage.getTitle().getHeading();
                if (oTitle) {
                    oTitle.setText(`Purchase Requisition ${sPRNumber}-${sPRItem}`);
                }
            }
        },

        /**
         * Handle material code press - navigate to material detail
         */
        onMaterialCodePress() {
            const oContext = this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No material data available");
                return;
            }

            const oObject = oContext.getObject();
            if (!oObject || !oObject.Material) {
                MessageToast.show("Material code not available");
                return;
            }

            const sPRNumber = oObject.PurchaseRequisition;
            const sPRItem = oObject.PurchaseReqnItem;
            const sMaterialCode = oObject.Material;

            console.log("Navigating to material detail:", sMaterialCode);

            // Navigate to material detail route
            this.oRouter.navTo("MaterialDetailRoute", {
                prNumber: sPRNumber,
                prItem: sPRItem,
                materialCode: sMaterialCode
            });
        },

        /**
         * Close detail view (go back to single column)
         */
        onCloseDetailPress() {
            this.oRouter.navTo("RouteView1", {}, true);
        },

        /**
         * Navigate back - now just closes the detail panel
         */
        onNavBack() {
            this.onCloseDetailPress();
        },

        /**
         * Edit the current purchase requisition
         */
        onEdit() {
            const oContext = this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item selected for editing");
                return;
            }

            const oObject = oContext.getObject();
            if (!oObject || !oObject.PurchaseRequisition) {
                MessageToast.show("Item data not available");
                return;
            }

            const sPRNumber = oObject.PurchaseRequisition;
            const sPRItem = oObject.PurchaseReqnItem;

            MessageBox.information(`Edit functionality for PR ${sPRNumber}-${sPRItem} will be implemented in future versions.`);
        },

        /**
         * Delete the current purchase requisition
         */
        onDelete() {
            const oContext = this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item selected for deletion");
                return;
            }

            const oObject = oContext.getObject();
            if (!oObject || !oObject.PurchaseRequisition) {
                MessageToast.show("Item data not available");
                return;
            }

            const sPRNumber = oObject.PurchaseRequisition;
            const sPRItem = oObject.PurchaseReqnItem;

            MessageBox.confirm(
                `Are you sure you want to delete Purchase Requisition ${sPRNumber}-${sPRItem}?`,
                {
                    title: "Confirm Deletion",
                    onAction: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            this._deletePurchaseRequisition(oContext);
                        }
                    }
                }
            );
        },

        /**
         * Delete the purchase requisition
         * @param {sap.ui.model.Context} oContext - The binding context
         */
        _deletePurchaseRequisition(oContext) {
            const oModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("detailView");

            oViewModel.setProperty("/busy", true);

            oModel.delete(oContext.getPath(), {
                success: () => {
                    oViewModel.setProperty("/busy", false);
                    MessageToast.show("Purchase Requisition deleted successfully");
                    this.onCloseDetailPress(); // Close detail panel after deletion
                },
                error: (oError) => {
                    oViewModel.setProperty("/busy", false);
                    let sErrorMessage = "Error deleting Purchase Requisition";

                    if (oError && oError.responseText) {
                        try {
                            const oErrorResponse = JSON.parse(oError.responseText);
                            sErrorMessage += ": " + oErrorResponse.error.message;
                        } catch (e) {
                            sErrorMessage += ": " + oError.responseText;
                        }
                    }

                    MessageBox.error(sErrorMessage);
                }
            });
        },

        /**
         * Approve the purchase requisition
         */
        onApprove() {
            const oContext = this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item selected for approval");
                return;
            }

            const oObject = oContext.getObject();
            if (!oObject || !oObject.PurchaseRequisition) {
                MessageToast.show("Item data not available");
                return;
            }

            const sPRNumber = oObject.PurchaseRequisition;
            const sPRItem = oObject.PurchaseReqnItem;

            MessageBox.confirm(
                `Are you sure you want to approve Purchase Requisition ${sPRNumber}-${sPRItem}?`,
                {
                    title: "Confirm Approval",
                    onAction: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            this._approvePurchaseRequisition(oContext);
                        }
                    }
                }
            );
        },

        /**
         * Approve the purchase requisition using bound action
         * @param {sap.ui.model.Context} oContext - The binding context
         */
        _approvePurchaseRequisition(oContext) {
            const oModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("detailView");

            oViewModel.setProperty("/busy", true);

            // Call the approve action defined in the service
            oModel.callFunction("/approve", {
                urlParameters: {
                    "PurchaseRequisition": oContext.getProperty("PurchaseRequisition"),
                    "PurchaseReqnItem": oContext.getProperty("PurchaseReqnItem")
                },
                success: (oData) => {
                    oViewModel.setProperty("/busy", false);
                    MessageToast.show("Purchase Requisition approved successfully");
                    // Refresh the binding to show updated status
                    oContext.getBinding().refresh();
                },
                error: (oError) => {
                    oViewModel.setProperty("/busy", false);
                    let sErrorMessage = "Error approving Purchase Requisition";

                    if (oError && oError.responseText) {
                        try {
                            const oErrorResponse = JSON.parse(oError.responseText);
                            sErrorMessage += ": " + oErrorResponse.error.message;
                        } catch (e) {
                            sErrorMessage += ": " + oError.responseText;
                        }
                    }

                    MessageBox.error(sErrorMessage);
                }
            });
        },

        /**
         * Save as draft
         */
        onSaveDraft() {
            MessageToast.show("Save as draft functionality will be implemented in future versions.");
        },

        /**
         * Format the status for display
         * @param {string} sStatus - The status value
         * @returns {string} The formatted status state
         */
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
        },

        /**
         * Format date time for display
         * @param {string|Date} sDateTime - The date time value
         * @returns {string} The formatted date time string
         */
        formatDateTime(sDateTime) {
            if (!sDateTime) {
                return "";
            }

            try {
                const oDate = new Date(sDateTime);
                if (isNaN(oDate.getTime())) {
                    return "";
                }

                // Format as locale-specific date and time
                return oDate.toLocaleString();
            } catch (e) {
                console.warn("Error formatting date:", e);
                return "";
            }
        },

        /**
         * Format date for display (date only, no time)
         * @param {string|Date} sDate - The date value
         * @returns {string} The formatted date string
         */
        formatDate(sDate) {
            if (!sDate) {
                return "";
            }

            try {
                const oDate = new Date(sDate);
                if (isNaN(oDate.getTime())) {
                    return "";
                }

                // Format as locale-specific date only
                return oDate.toLocaleDateString();
            } catch (e) {
                console.warn("Error formatting date:", e);
                return "";
            }
        },

        /**
         * Update close column button visibility
         */
        updateCloseColumnButton(sLayout) {
            const oViewModel = this.getView().getModel("detailView");
            const bShowCloseColumn = sLayout !== fioriLibrary.LayoutType.OneColumn;
            oViewModel.setProperty("/showCloseColumn", bShowCloseColumn);
        },

        /**
         * Get the resource bundle
         * @returns {sap.ui.model.resource.ResourceModel} The resource bundle
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    })
});
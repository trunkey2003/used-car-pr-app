sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("freestyle.controller.View1", {
        
        onInit() {
            console.log("View1 controller initialized");
            
            // Initialize view model
            const oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                count: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Get router reference
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        /**
         * Handle item press - show detail in FCL
         */
        onItemPress(oEvent) {
            console.log("Item pressed");
            const oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item data available");
                return;
            }

            const sPRNumber = oContext.getProperty("PurchaseRequisition");
            const sItem = oContext.getProperty("PurchaseReqnItem");
            
            console.log("PR Number:", sPRNumber, "Item:", sItem);
            
            if (!sPRNumber || !sItem) {
                MessageToast.show("Missing PR Number or Item data");
                return;
            }

            // Navigate to detail route
            this.oRouter.navTo("DetailRoute", {
                prNumber: sPRNumber,
                prItem: sItem
            });
        },

        /**
         * Apply filters to the table
         */
        onApplyFilters() {
            MessageToast.show("Apply filters clicked");
        },

        /**
         * Clear all filters
         */
        onClearFilters() {
            MessageToast.show("Clear filters clicked");
        },

        /**
         * Create new purchase requisition
         */
        onCreate() {
            MessageBox.information("Create functionality will be implemented in future versions.");
        },

        /**
         * Export table data
         */
        onExport() {
            MessageToast.show("Export clicked");
        },

        /**
         * Refresh table data
         */
        onRefresh() {
            const oTable = this.byId("purchaseRequisitionTable");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").refresh();
                MessageToast.show("Data refreshed");
            }
        },

        /**
         * Edit purchase requisition
         */
        onEdit(oEvent) {
            MessageToast.show("Edit clicked");
        },

        /**
         * Delete purchase requisition
         */
        onDelete(oEvent) {
            MessageToast.show("Delete clicked");
        },

        /**
         * Show sort dialog
         */
        onSort() {
            MessageBox.information("Sort functionality will be implemented in future versions.");
        },

        /**
         * Show table settings
         */
        onTableSettings() {
            MessageBox.information("Table settings functionality will be implemented in future versions.");
        },

        /**
         * Format status for display
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
                
                return oDate.toLocaleString();
            } catch (e) {
                console.warn("Error formatting date:", e);
                return "";
            }
        }
    });
});
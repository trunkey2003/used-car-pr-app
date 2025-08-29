sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/f/library"
], (Controller, JSONModel, MessageToast, fioriLibrary) => {
    "use strict";

    return Controller.extend("freestyle.controller.MaterialDetail", {

        onInit() {
            console.log("MaterialDetail controller initialized");
            
            // Get the router instance
            this.oRouter = this.getOwnerComponent().getRouter();

            // Attach pattern matched event for direct URL access
            this.oRouter.getRoute("MaterialDetailRoute").attachPatternMatched(this._onObjectMatched, this);

            // Initialize view model
            const oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.getView().setModel(oViewModel, "materialDetailView");
        },

        /**
         * Event handler for when the route pattern is matched (direct URL access)
         * @param {sap.ui.base.Event} oEvent - The route matched event
         */
        _onObjectMatched(oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sPRNumber = oArguments.prNumber;
            const sPRItem = oArguments.prItem;
            const sMaterialCode = oArguments.materialCode;

            console.log("Material detail route matched:", sMaterialCode);

            // Validate parameters
            if (!sPRNumber || !sPRItem || !sMaterialCode) {
                console.error("Missing required parameters for material detail");
                return;
            }

            this.bindMaterialData(sPRNumber, sPRItem, sMaterialCode);
        },

        /**
         * Bind material data - can be called from route or from detail view
         * @param {string} sPRNumber - PR Number
         * @param {string} sPRItem - PR Item
         * @param {string} sMaterialCode - Material Code
         */
        bindMaterialData(sPRNumber, sPRItem, sMaterialCode) {
            console.log("Binding material data:", sMaterialCode);

            // For now, we'll create a simple model with the material code
            // In a real app, you'd bind to the actual material master data
            const oMaterialModel = new JSONModel({
                Material: sMaterialCode,
                PurchaseRequisition: sPRNumber,
                PurchaseReqnItem: sPRItem
            });

            this.getView().setModel(oMaterialModel);

            // Update page title
            this._updatePageTitle(sMaterialCode);
        },

        /**
         * Update page title
         */
        _updatePageTitle(sMaterialCode) {
            const oDynamicPage = this.byId("materialDetailPageId");
            if (oDynamicPage) {
                const oTitle = oDynamicPage.getTitle().getHeading();
                if (oTitle) {
                    oTitle.setText(`Material ${sMaterialCode}`);
                }
            }
        },

        /**
         * Close material detail view (go back to two column layout)
         */
        onCloseMaterialDetail() {
            console.log("Closing material detail");
            
            // Get the current route parameters to navigate back to detail
            const oHistory = this.oRouter.getHashChanger();
            const sHash = oHistory.getHash();
            
            // Extract PR info from current hash if available
            const aMatches = sHash.match(/detail\/([^\/]+)\/([^\/]+)/);
            if (aMatches && aMatches.length >= 3) {
                const sPRNumber = aMatches[1];
                const sPRItem = aMatches[2];
                
                // Navigate back to detail route (two column layout)
                this.oRouter.navTo("DetailRoute", {
                    prNumber: sPRNumber,
                    prItem: sPRItem
                }, true);
            } else {
                // Fallback to main list
                this.oRouter.navTo("RouteView1", {}, true);
            }
        },

        /**
         * Navigate back to detail view
         */
        onNavBackToDetail() {
            this.onCloseMaterialDetail();
        }
    });
});
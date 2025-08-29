sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/f/library"
], (BaseController, fioriLibrary) => {
    "use strict";

    return BaseController.extend("freestyle.controller.App", {
        
        onInit() {
            console.log("App controller initialized");
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.attachRouteMatched(this.onRouteMatched, this);
            
            // Debug: Check if FCL and master view are loaded
            setTimeout(() => {
                const oFCL = this.byId("fcl");
                const oMasterView = this.byId("masterView");
                console.log("FCL:", oFCL);
                console.log("Master View:", oMasterView);
                console.log("FCL Begin Pages:", oFCL ? oFCL.getBeginColumnPages() : "No FCL");
            }, 1000);
        },

        onRouteMatched(oEvent) {
            const sRouteName = oEvent.getParameter("name");
            console.log("Route matched:", sRouteName);

            // Handle route-based FCL state
            switch (sRouteName) {
                case "DetailRoute":
                    console.log("Setting TwoColumnsMidExpanded layout");
                    this._setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
                    break;
                case "RouteView1":
                default:
                    console.log("Setting OneColumn layout");
                    this._setLayout(fioriLibrary.LayoutType.OneColumn);
                    // Clear any existing detail view
                    this._clearDetailColumn();
                    break;
            }
        },

        onStateChanged(oEvent) {
            const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
            const sLayout = oEvent.getParameter("layout");
            console.log("State changed - Navigation Arrow:", bIsNavigationArrow, "Layout:", sLayout);

            // If user clicked the navigation arrow, we need to navigate
            if (bIsNavigationArrow) {
                if (sLayout === fioriLibrary.LayoutType.OneColumn) {
                    this.oRouter.navTo("RouteView1");
                }
            }
        },

        _setLayout(sLayout) {
            const oFCL = this.byId("fcl");
            console.log("Setting layout:", sLayout, "FCL:", oFCL);
            if (oFCL) {
                oFCL.setLayout(sLayout);
            }
        },

        _clearDetailColumn() {
            const oFCL = this.byId("fcl");
            if (oFCL) {
                // Remove all views from midColumnPages
                oFCL.removeAllMidColumnPages();
                console.log("Cleared detail column");
            }
        },

        // Helper method to get FCL instance
        getFCL() {
            return this.byId("fcl");
        },

        // Helper method to get master view
        getMasterView() {
            return this.byId("masterView");
        }
    });
});
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("freestyle.controller.NotFound", {
        
        onNavBack() {
            const sPreviousHash = History.getInstance().getPreviousHash();
            
            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        onNavToList() {
            this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
        }
    });
});
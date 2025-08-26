sap.ui.define([
    "sap/ui/core/mvc/JSView",
    "sap/m/Page",
    "sap/m/VBox",
    "sap/m/Panel",
    "sap/m/HBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/ComboBox",
    "sap/m/DatePicker",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Toolbar",
    "sap/m/Title",
    "sap/m/ToolbarSpacer",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem",
    "sap/m/ObjectIdentifier",
    "sap/m/ObjectNumber",
    "sap/m/ObjectStatus",
    "sap/ui/core/Item"
], function (JSView, Page, VBox, Panel, HBox, Label, Input, ComboBox, DatePicker, Button, mobileLibrary,
    Toolbar, Title, ToolbarSpacer, Table, Column, Text, ColumnListItem, ObjectIdentifier,
    ObjectNumber, ObjectStatus, Item) {
    "use strict";

    var ButtonType = mobileLibrary.ButtonType;

    sap.ui.jsview("freestyle.view.View1", {

        getControllerName: function () {
            return "freestyle.controller.View1";
        },

        createContent: function (oController) {
            var oPage = new Page("page", {
                title: "Purchase Requisitions Management",
                showNavButton: false
            });

            // Create Filter Panel
            var oFilterContainer = new HBox();
            oFilterContainer.addStyleClass("sapUiMediumMargin");

            // Material Filter
            var oMaterialVBox = new VBox();
            oMaterialVBox.addStyleClass("sapUiMediumMarginEnd");
            oMaterialVBox.addItem(new Label({ text: "Material:" }));
            oMaterialVBox.addItem(new Input("materialFilter", {
                placeholder: "Enter material...",
                width: "200px"
            }));

            // Plant Filter
            var oPlantVBox = new VBox();
            oPlantVBox.addStyleClass("sapUiMediumMarginEnd");
            oPlantVBox.addItem(new Label({ text: "Plant:" }));
            oPlantVBox.addItem(new Input("plantFilter", {
                placeholder: "Enter plant...",
                width: "150px"
            }));

            // Status Filter
            var oStatusVBox = new VBox();
            oStatusVBox.addStyleClass("sapUiMediumMarginEnd");
            oStatusVBox.addItem(new Label({ text: "Status:" }));
            oStatusVBox.addItem(new ComboBox("statusFilter", {
                width: "150px",
                items: [
                    new Item({ key: "", text: "All" }),
                    new Item({ key: "OPEN", text: "Open" }),
                    new Item({ key: "RELEASED", text: "Released" }),
                    new Item({ key: "CLOSED", text: "Closed" })
                ]
            }));

            // Date From Filter
            var oDateFromVBox = new VBox();
            oDateFromVBox.addStyleClass("sapUiMediumMarginEnd");
            oDateFromVBox.addItem(new Label({ text: "Date From:" }));
            oDateFromVBox.addItem(new DatePicker("dateFromFilter", { width: "150px" }));

            // Date To Filter
            var oDateToVBox = new VBox();
            oDateToVBox.addStyleClass("sapUiMediumMarginEnd");
            oDateToVBox.addItem(new Label({ text: "Date To:" }));
            oDateToVBox.addItem(new DatePicker("dateToFilter", { width: "150px" }));

            // Filter Buttons
            var oButtonsVBox = new VBox();
            oButtonsVBox.addStyleClass("sapUiMediumMarginTop");

            var oApplyButton = new Button({
                text: "Apply Filters",
                press: function () { oController.onApplyFilters(); },
                type: ButtonType.Emphasized
            });
            oApplyButton.addStyleClass("sapUiTinyMarginEnd");

            var oButtonsHBox = new HBox();
            oButtonsHBox.addItem(oApplyButton);
            oButtonsHBox.addItem(new Button({
                text: "Clear Filters",
                press: function () { oController.onClearFilters(); }
            }));

            oButtonsVBox.addItem(oButtonsHBox);

            // Add all filter items to container
            oFilterContainer.addItem(oMaterialVBox);
            oFilterContainer.addItem(oPlantVBox);
            oFilterContainer.addItem(oStatusVBox);
            oFilterContainer.addItem(oDateFromVBox);
            oFilterContainer.addItem(oDateToVBox);
            oFilterContainer.addItem(oButtonsVBox);

            var oFilterPanel = new Panel({
                headerText: "Filters",
                expandable: true,
                expanded: false,
                content: [oFilterContainer]
            });

            // Create Toolbar
            var oToolbar = new Toolbar({
                content: [
                    new Title({
                        text: "Purchase Requisitions (0)"
                    }),
                    new ToolbarSpacer(),
                    new Button({
                        text: "Create",
                        icon: "sap-icon://add",
                        press: function () { oController.onCreate(); },
                        type: ButtonType.Emphasized
                    }),
                    new Button({
                        text: "Export",
                        icon: "sap-icon://excel-attachment",
                        press: function () { oController.onExport(); }
                    }),
                    new Button({
                        text: "Refresh",
                        icon: "sap-icon://refresh",
                        press: function () { oController.onRefresh(); }
                    })
                ]
            });

            // Create Table
            var oTable = new Table("purchaseRequisitionTable", {
                items: {
                    path: "/PurchaseRequisition",
                    sorter: {
                        path: "createdAt",
                        descending: true
                    }
                },
                growing: true,
                growingThreshold: 50,
                mode: "SingleSelect",

                headerToolbar: new Toolbar({
                    content: [
                        new Title({ text: "Items" }),
                        new ToolbarSpacer(),
                        new Button({
                            icon: "sap-icon://sort",
                            press: function () { oController.onSort(); },
                            tooltip: "Sort Options"
                        }),
                        new Button({
                            icon: "sap-icon://action-settings",
                            press: function () { oController.onTableSettings(); },
                            tooltip: "Table Settings"
                        })
                    ]
                }),

                columns: [
                    new Column({ width: "120px", header: new Text({ text: "PR Number" }) }),
                    new Column({ width: "80px", header: new Text({ text: "Item" }) }),
                    new Column({ width: "200px", header: new Text({ text: "Material" }) }),
                    new Column({ width: "100px", header: new Text({ text: "Plant" }) }),
                    new Column({ width: "120px", header: new Text({ text: "Quantity" }) }),
                    new Column({ width: "100px", header: new Text({ text: "Unit" }) }),
                    new Column({ width: "120px", header: new Text({ text: "Delivery Date" }) }),
                    new Column({ width: "120px", header: new Text({ text: "Status" }) }),
                    new Column({ width: "120px", header: new Text({ text: "Requisitioner" }) }),
                    new Column({ width: "120px", header: new Text({ text: "Created At" }) }),
                    new Column({ width: "100px", header: new Text({ text: "Actions" }) })
                ],

                items: new ColumnListItem({
                    press: function (oEvent) { oController.onItemPress(oEvent); },
                    cells: [
                        new ObjectIdentifier({ title: "{PurchaseRequisition}" }),
                        new Text({ text: "{PurchaseReqnItem}" }),
                        new VBox({
                            items: [
                                new Text({ text: "{Material}" }),
                                new Text({ text: "{toMaterial/MaterialDescription/MaterialDescription}" })
                            ]
                        }),
                        new Text({ text: "{Plant}" }),
                        new ObjectNumber({
                            number: {
                                path: "Quantity",
                                type: "sap.ui.model.odata.type.Decimal",
                                formatOptions: { minFractionDigits: 2, maxFractionDigits: 3 }
                            }
                        }),
                        new Text({ text: "{BaseUnit}" }),
                        new Text({
                            text: {
                                path: "DeliveryDate",
                                type: "sap.ui.model.odata.type.Date"
                            }
                        }),
                        new ObjectStatus({
                            text: "{ReleaseStatus}",
                            state: {
                                path: "ReleaseStatus",
                                formatter: function (sStatus) {
                                    return oController.formatStatus(sStatus);
                                }
                            }
                        }),
                        new Text({ text: "{Requisitioner}" }),
                        new Text({
                            text: {
                                path: "createdAt",
                                formatter: function (sDateTime) {
                                    if (sDateTime) {
                                        return new Date(sDateTime).toLocaleDateString();
                                    }
                                    return "";
                                }
                            }
                        }),
                        new HBox({
                            items: [
                                new Button({
                                    icon: "sap-icon://edit",
                                    press: function (oEvent) { oController.onEdit(oEvent); },
                                    type: ButtonType.Transparent,
                                    tooltip: "Edit"
                                }),
                                new Button({
                                    icon: "sap-icon://delete",
                                    press: function (oEvent) { oController.onDelete(oEvent); },
                                    type: ButtonType.Transparent,
                                    tooltip: "Delete"
                                })
                            ]
                        })
                    ]
                })
            });

            // Add responsive margin to table
            oTable.addStyleClass("sapUiResponsiveMargin");

            // Create main container
            var oMainContainer = new VBox();
            oMainContainer.addStyleClass("sapUiMediumMargin");
            oMainContainer.addItem(oFilterPanel);

            // Add all content to the page
            oPage.addContent(oMainContainer);
            oPage.addContent(oToolbar);
            oPage.addContent(oTable);

            return oPage;
        }
    });
});
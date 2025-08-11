sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/assignment6/test/integration/FirstJourney',
		'ns/assignment6/test/integration/pages/PurchaseOrderHeaderList',
		'ns/assignment6/test/integration/pages/PurchaseOrderHeaderObjectPage',
		'ns/assignment6/test/integration/pages/PurchaseOrderItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseOrderHeaderList, PurchaseOrderHeaderObjectPage, PurchaseOrderItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/assignment6') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseOrderHeaderList: PurchaseOrderHeaderList,
					onThePurchaseOrderHeaderObjectPage: PurchaseOrderHeaderObjectPage,
					onThePurchaseOrderItemObjectPage: PurchaseOrderItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);
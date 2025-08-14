sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/assignment6/test/integration/FirstJourney',
		'ns/assignment6/test/integration/pages/PurchaseOrderHeaderList',
		'ns/assignment6/test/integration/pages/PurchaseOrderHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseOrderHeaderList, PurchaseOrderHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/assignment6') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseOrderHeaderList: PurchaseOrderHeaderList,
					onThePurchaseOrderHeaderObjectPage: PurchaseOrderHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);
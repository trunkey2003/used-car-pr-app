sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns1/assignment1/test/integration/FirstJourney',
		'ns1/assignment1/test/integration/pages/PurchaseRequisitionList',
		'ns1/assignment1/test/integration/pages/PurchaseRequisitionObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseRequisitionList, PurchaseRequisitionObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns1/assignment1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseRequisitionList: PurchaseRequisitionList,
					onThePurchaseRequisitionObjectPage: PurchaseRequisitionObjectPage
                }
            },
            opaJourney.run
        );
    }
);
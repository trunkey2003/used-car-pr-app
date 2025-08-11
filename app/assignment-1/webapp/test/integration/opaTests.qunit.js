sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns1/ebanlp/test/integration/FirstJourney',
		'ns1/ebanlp/test/integration/pages/PurchaseRequisitionList',
		'ns1/ebanlp/test/integration/pages/PurchaseRequisitionObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseRequisitionList, PurchaseRequisitionObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns1/ebanlp') + '/index.html'
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
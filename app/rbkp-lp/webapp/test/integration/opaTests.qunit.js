sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/rbkplp/test/integration/FirstJourney',
		'ns/rbkplp/test/integration/pages/SupplierInvoiceHeaderList',
		'ns/rbkplp/test/integration/pages/SupplierInvoiceHeaderObjectPage',
		'ns/rbkplp/test/integration/pages/SupplierInvoiceItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, SupplierInvoiceHeaderList, SupplierInvoiceHeaderObjectPage, SupplierInvoiceItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/rbkplp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSupplierInvoiceHeaderList: SupplierInvoiceHeaderList,
					onTheSupplierInvoiceHeaderObjectPage: SupplierInvoiceHeaderObjectPage,
					onTheSupplierInvoiceItemObjectPage: SupplierInvoiceItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);
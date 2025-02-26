export function print(html, title, pageFooterLeft, pageFooterRight){	
    const body = 
        `<!DOCTYPE html>
        <html lang="en">
        <head>		
        <meta charset="UTF-8">
        <title>`+title+`</title>`+
        `<style>`+
            `@page {
                size: 8.5in 11in !important;
                margin: 0.5in 0.5in 0.5in 0.5in !important;
                font-size: 10pt !important;
                font-family: Arimo !important;	
                @bottom-left {
                    content:"`+ pageFooterLeft +`";`+
                    `white-space: pre;
                    font-size: 7pt;
                    color: #606060;
                }
                @bottom-right {
                    content:`+pageFooterRight+` "  Page " counter(page) " of " counter(pages);
                    white-space: pre;
                    font-size: 7pt;
                    color: #606060;
                }
            }`+
            `@media print{
                .dnone{display:none;}
                .new-page{
                    page-break-before: always;
                    position: relative; top: 8em;
                }				
                .print-block{
                    page-break-inside: avoid;
                }				
            }`+
            `@page label{font-size: 9pt;}
            .container {				
                padding: 0 !important; 
                margin: 0 !important;				
                width: 100% !important;
                max-width: 680px !important;
                min-width: 680px !important;			
                font-size: 10pt !important;
                font-family: Arimo !important;
                color: #313132 !important;
            }`+
            `td.text-start.border-dark{border: 1px solid #313132 !important;}`+
            `table {border: 1px solid #313132 !important;}`+
            `.v-data-table.audit > .v-data-table__wrapper > table > tbody > tr > td {font-size:8.25pt; height: 16px !important; }`+
            `.v-data-table.audit > .v-data-table__wrapper > table > thead > tr > th {font-size:9pt; height: 20px !important; }`+
            
            `.v-data-table.recovery-items > .v-data-table__wrapper > table > tbody > tr > td{height: 16px !important;font-size:7.5pt; padding: 0 2px !important;}`+
            `.v-data-table.recovery-items > .v-data-table__wrapper > table > thead > tr > th{height: 20px !important;font-size:7pt; padding: 0 2px !important;}`+
            
            `.checkmark {transform: translate(-7px,-7px) scaleX(-0.75) rotate(-35deg);}`+ 
            `.v-application {font-family:  Arimo !important;}`+
            `
            body{
                font-family: Arimo !important;
            }
            `+
        `</style>
        </head>
        <body>			
            <div class="v-application v-application--is-ltr theme--light"> 
                <div class="v-application--wrap">`+html+
        `</div></div></body></html>`	 
    
    return body
}
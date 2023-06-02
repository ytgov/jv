<template>
  <div>
        <v-dialog v-model="exportJournalDialog" persistent max-width="65%">
            <template v-slot:activator="{ on, attrs }">
                <v-btn                    
                    color="#005a65"
                    class="px-5 white--text"
                    style="min-width: 0"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on"
                    >
                    <div v-if="type=='Send'">Send</div>
                    <div v-else>Create Journal Export</div>
                </v-btn>
            </template>

        <v-card >
            <v-card-title class="primary" style="border-bottom: 1px solid black">
                <div v-if="type=='Send'" class="text-h5">Send Journal Voucher</div>
                <div v-else class="text-h5">
                    Create Journal Export
                </div>
                <v-btn :loading="loadingData || savingData" color="#005a65" class="ml-auto white--text" @click="exportJournal()">
                    <div v-if="type=='Send'" class="px-1">Send</div>
                    <div v-else class="px-1">Export</div>
                </v-btn>
                <v-btn color="white" class="ml-5 cyan--text text--darken-4" @click="closeDialog">
                    <div class="px-1">Close</div>
                </v-btn>
            </v-card-title>           

            <v-card-text v-if="!loadingData">
                <div id="journal-print" style="border:1px solid; border-radius:5px;" class="container">
                    <journal-pdf :journal="journal" />                                        
                </div>
                <div v-for="recovery,inx in journal.recoveries" :key="'recovery-pdf-'+inx" >
                    <div :id="'recovery-print-'+inx" style="border:1px solid; border-radius:5px;" class="container">
                        <recovery-pdf :recovery="recovery" />
                    </div>           
                </div>                
            </v-card-text>
        </v-card>
    </v-dialog>
   
  </div>
</template>

<script>
import Vue from "vue";
import {PDF_URL, RECOVERIES_URL} from "@/urls";
import axios from "axios";

import JournalPdf from './Components/JournalPdf.vue';
import RecoveryPdf from './Components/RecoveryPdf.vue';

export default { 
    components: {
        JournalPdf,
        RecoveryPdf
    },
    name: "CreateJournalExport",
    props: {        
        journalID: {},
        type: {}
    },
    data() {
        return {
            exportJournalDialog: false,
            loadingData: false,
            savingData: false,
            journal: {},

            
        };
    },
    mounted() {},

    methods: {

        async initForm() {
            this.loadingData = true
            await this.getJournal()
            this.loadingData = false
            this.savingData = false
        },

        async getJournal() {             
            return axios.get(`${RECOVERIES_URL}/journal/${this.journalID}`)
            .then((resp) => {                    
                this.journal = resp.data;
                return                
                //console.log(this.recoveries)                           
            })
            .catch(e => {                
                console.log(e);
                this.loadingData = false                 
            });
        },   
        
        async exportJournal(){
            this.savingData = true;
            if(this.type=='Export') await this.downloadExcel();
            await this.downloadPdf();
            this.savingData = false;
            if(this.type=='Send') {
                this.$emit('jvSent');
                this.exportJournalDialog= false
            }
        },

        async downloadExcel(){
            const id = this.journal.journalID
            const jvNum = this.journal.jvNum
            const header = {
                responseType: "blob",
                headers: {
                    "Content-Type": "application/json",
                }
            };

            return axios.get(`${PDF_URL}/excel/${id}`, header)
                .then(async res => {
                    if(this.type=='Export'){
                        const blob = res.data;
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        document.body.appendChild(link);
                        link.download = `Jv-${jvNum}.xlsx`;
                        link.click();
                        await setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                    }
                    return
                })
                .catch(e => {
                    console.log(e);
                    this.loadingData = false;
                });
        },
        
        async downloadPdf(){ 
            const data = []
            const currentTime = (new Date()).toLocaleString()
            const jvNum = this.journal.jvNum
            
            //JOURNAL
            const jvEl = document.getElementById("journal-print");
            const footerText =  "Journal Voucher "+jvNum+'; Printed on ' + currentTime            
            const jvHtml = Vue.filter('printPdf')(jvEl?.innerHTML, "Journal Voucher", footerText, "");
            const journalDocNames = []
            for(const doc of this.journal.docName){
                journalDocNames.push({docName:doc.docName, id:this.journal.journalID, itemCategory:false, journal:true})
            }       
            data.push({html:jvHtml, backupDocs:journalDocNames})
            
            
            //RECOVERIES
            const activeItemCategoryList = this.$store.state.recoveries.itemCategoryList
            
            for (const inx in this.journal.recoveries){
                const recovery = this.journal.recoveries[inx]
                const recNum = recovery.refNum
                const recEl = document.getElementById(`recovery-print-${inx}`);
                const footerText =  "Recovery "+recNum+'; Printed on ' + currentTime                
                const recHtml = Vue.filter('printPdf')(recEl?.innerHTML, "Recovery", footerText, "");
                const docNames = []
                for(const doc of recovery.docName){
                    docNames.push({docName:doc.docName, id:recovery.recoveryID, itemCategory:false, journal:false})
                }
                
                const recoveryItems = recovery.recoveryItems
                recoveryItems.forEach(item =>{                
                    const index = activeItemCategoryList.findIndex(category => category.itemCatID == item.itemCatID )
                    if(index>-1){
                        const docs = activeItemCategoryList[index].docName
                        for(const doc of docs){
                            docNames.push({docName:doc.docName, id:item.itemCatID, itemCategory:true, journal:false})
                        }
                    }
                })

                data.push({html:recHtml, backupDocs:docNames})
            }

            const header = {
                responseType: "blob",
                headers: {
                    "Content-Type": "application/json",
                }
            };

            const type = this.type=='Send'? 'email': 'merge'

            return axios.post(`${PDF_URL}/${type}/${this.journal.journalID}`,{data}, header)
                .then(async res => {
                    if(this.type=='Export'){                       
                        const blob = res.data;
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        document.body.appendChild(link);
                        link.download = `Jv-${jvNum}.pdf`;
                        link.click();
                        await setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                    }
                    return                     
                })
                .catch(e => {
                    console.log(e);
                    this.loadingData = false
                }); 
        },         

        closeDialog(){
            this.exportJournalDialog = false;
        },
    }
  
};
</script>
<style>
    .margin-top-n1 {margin-top:-0.75rem !important;}
</style>

<style scoped>

    ::v-deep(*) {
        font-family: Arimo !important;
    }

    .container {
        padding: 40px 40px !important; 
        margin-top: 1rem !important;
        margin-right: auto !important;
        margin-left: auto !important;
        width: 100% !important;
        max-width: 750px !important;
        min-width: 750px !important;   
        font-size: 10pt !important;        
        color: #313132 !important;
    }
    .print-display {display: none !important;}
    .margin-top-0 {margin-top:0rem !important;}
    ::v-deep(.margin-top-1) {margin-top:1rem !important;}
    ::v-deep(td.text-start.border-dark){border-bottom:1px solid #000 !important;}
    ::v-deep(table) {border:1px solid #000 !important;}
    
    ::v-deep(.v-data-table.audit > .v-data-table__wrapper > table > tbody > tr > td) {
        height: 16px !important;
        font-size:8.25pt;
    }
    ::v-deep(.v-data-table.audit > .v-data-table__wrapper > table > thead > tr > th) {
        height: 20px !important;
        font-size:9pt;
    }

    ::v-deep(.v-data-table.recovery-items > .v-data-table__wrapper > table > tbody > tr > td) {
        height: 16px !important;
        font-size:7.5pt;
        /* text-align: center !important; */
        margin: 0 auto !important;
        padding: 0 2px!important;        
    }
    ::v-deep(.v-data-table.recovery-items > .v-data-table__wrapper > table > thead > tr > th) {
        height: 20px !important;
        font-size:7pt;
        
        /* text-align: center !important; */
        padding: 0 2px!important;
    }

    ::v-deep(.checkmark) {
        transform: translate(-7px,-7px) scaleX(-0.75) rotate(-35deg);
    }
</style>

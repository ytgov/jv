<template>
    <div v-if="!loadingData" style="font-size:9pt;">
        <v-row class="mx-1">
            <div class="print-display">
                <div style="width:30%; height: 20%;">
                    <img style="margin:0rem 0 0 0;" :src="'./byteio/logo.svg'" alt="">
                </div>
            </div>
            <div class="dnone"> <img style="margin:-2rem 0 0 0;" src="@/assets/logo.svg" alt=""></div>
            <div class="ml-15 margin-top-n1" style="margin-top:1rem; font-size:14pt;" ><b>Journal Voucher </b> {{journal.jvNum}}</div>
        </v-row>       

        <v-row class="mx-1" style="border-top:1px solid;">            
            <div class="mt-5"><b>Journal Number:</b> {{journal.jvNum}}</div>
        </v-row>

        <v-row class="mx-1">            
            <div><b>Department:</b> {{journal.department}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Amount:</b> $ {{Number(journal.jvAmount).toFixed(2)}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Period:</b> {{journal.period}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>JV Date:</b> {{journal.jvDate | getDate}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Fiscal Year:</b> {{journal.fiscalYear}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Description:</b> {{journal.description}}</div>
        </v-row>

        <v-row class="mx-1">
            <div  style="width:49%; border:1px solid #FFF; border-radius:4px;">
                <div><b>Originating Department:</b> {{journal.orgDepartment}}</div>
            </div>
        </v-row>

        <v-row class="mx-1">
            <div><b>OD Completed By:</b> {{journal.odCompletedBy}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Receiving Department:</b> {{journal.recvDepartment}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>RD Completed By:</b> {{journal.rdCompletedBy}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Journal Explanation:</b> {{journal.explanation}}</div>
        </v-row>

        <v-row class="mt-10 mx-1" style="font-size:9pt;">
            <div><b>Journal Audits:</b></div>
        </v-row>                   
        <audit-table-pdf :audits="journal.journalAudits" class=""/>
    </div>
</template>

<script>
import AuditTablePdf from "./AuditTablePdf.vue"
export default { 
    components: {
        AuditTablePdf,
    },
    name: "JournalPdf",
    props: {        
        journal: {},      
    },
    data() {
        return {            
            loadingData: false,
        };
    },
    mounted() {
        this.loadingData=true        
        this.loadingData=false
    },
    computed: {        
    },
    methods: {
    },
}
</script>

<template>
    <div v-if="!loadingData" style="font-size:9pt;">
        <v-row class="mx-1">
            <div class="print-display">
                <div style="width:30%; height: 20%;">
                    <img style="margin:0rem 0 0 0;" :src="'./byteio/logo.svg'" alt="">
                </div>
            </div>
            <div class="dnone"> <img style="margin:-2rem 0 0 0;" src="@/assets/logo.svg" alt=""></div>
            <div class="ml-15 margin-top-n1" style="margin-top:1rem; font-size:14pt;" ><b>Recovery </b> {{recovery.recoveryID}}</div>
        </v-row>       

        <v-row class="mx-1" style="border-top:1px solid;">            
            <div class="mt-5"><b>Requastor Name:</b> {{recovery.firstName}} {{recovery.lastName}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Requastor Mail Code:</b> {{recovery.mailcode}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Requastor Department:</b> {{recovery.department}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Requastor Branch:</b> {{recovery.employeeBranch}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Recovery ID:</b> {{recovery.recoveryID}}</div>
        </v-row>

        <v-row class="mx-1">
            <div><b>Reference Number:</b> {{recovery.refNum}}</div>
        </v-row>

        <v-row class="mt-10 mx-1" style="font-size:9pt;">
            <div><b>Recovery Items:</b></div>
        </v-row>
        <recovery-items-table-pdf  :recoveryItems="recovery.recoveryItems" class=""/>
        
        <v-row class="mt-10 mx-1" style="font-size:9pt;">
            <div><b>Recovery Audits:</b></div>
        </v-row>
        <audit-table-pdf :audits="recovery.recoveryAudits" class=""/>

    </div>
</template>

<script>
import AuditTablePdf from "./AuditTablePdf.vue"
import RecoveryItemsTablePdf from './RecoveryItemsTablePdf.vue';


export default { 
    components:{ 
        AuditTablePdf,
        RecoveryItemsTablePdf
    },
    name: "RecoveryPdf",
    props: {        
        recovery: {},      
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

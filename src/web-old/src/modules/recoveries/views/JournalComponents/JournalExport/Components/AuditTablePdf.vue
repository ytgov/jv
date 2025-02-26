<template>
    <v-row class="mt-4 mb-1 mx-0" v-if="!loadingData">
        <v-data-table class="audit" :headers="auditHeaders" :items="sortedAudits" style="width:100%;" dense hide-default-footer>                                
            <template v-slot:[`item.date`]="{ item }">
                {{item.date | getDate}}
            </template>
        </v-data-table>
    </v-row>
</template>

<script>

export default { 
    components: {
    },
    name: "AuditTablePdf",
    props: {        
        audits: {},      
    },
    data() {
        return {
            auditHeaders: [
                { text: "Date",   value: "date",   class: "grey lighten-4", sortable: false, width: "15%" },                
                { text: "Action", value: "action", class: "grey lighten-4", sortable: false, width: "45%" },
                { text: "User",   value: "user",   class: "grey lighten-4", sortable: false, width: "40%" },                
            ],
            sortedAudits: [],
            loadingData: false,
        };
    },
    mounted() {
        this.loadingData=true
        this.sortedAudits = this.audits.sort((a,b)=>{ return (a.date > b.date ? -1 :1) });
        this.loadingData=false
    },
    computed: {        
    },
    methods: {
    },
}
</script>
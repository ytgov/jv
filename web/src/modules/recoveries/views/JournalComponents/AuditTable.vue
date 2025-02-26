<template>
    <div style="width:70%;">
        <v-data-table dense :items-per-page="5" :headers="auditHeaders" :items="sortedAudits" class="elevation-1">
            <template v-slot:[`item.date`]="{ item }">
                {{item.date | getDate}}
            </template>
        </v-data-table>
    </div>
</template>

<script>

export default { 
    components: {
    },
    name: "AuditTable",
    props: {        
        audits: {},      
    },
    data() {
        return {
            auditHeaders: [
                { text: "Date",   value: "date",   class: "grey lighten-4", width: "20%" },                
                { text: "Action", value: "action", class: "grey lighten-4", width: "40%" },
                { text: "User",   value: "user",   class: "grey lighten-4", width: "40%" },                
            ],
            sortedAudits: [],
        };
    },
    mounted() {
        this.sortedAudits = this.audits.sort((a,b)=>{ return (a.date > b.date ? -1 :1) });
    },
    computed: {        
    },
    methods: {
    },
}
</script>
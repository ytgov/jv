<template>
    <div class="mt-15 mx-10 mb-5">       
        <!-- <v-btn @click="call">
            CLK
        </v-btn> -->
        <v-data-table 
            :headers="headers" 
            :items="journals" 
            :items-per-page="10"
            class="elevation-1">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:[`item.submissionDate`]="{ item }">
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                {{ item.submissionDate | beautifyDate }}
            </template>

            <template v-slot:[`item.jvAmount`]="{ item }">
                $ {{Number(item.jvAmount).toFixed(2) | currency}}
            </template>

            <template v-slot:[`item.refRecoveries`]="{ item }">
                {{getRefs(item)}}
            </template>

            <template v-slot:[`item.edit`]="{ item }">
                <v-row>
                    <div style="width: 4.5rem">
                        <edit-journal
                            :journal="item"
                            @updateTable="updateTable"                                              
                        />
                    </div>
                </v-row>
             </template>
            
        </v-data-table>
    </div>
</template>

<script>
// import EditJournal from './EditJournal.vue'
// import { AUTH_URL} from "../../../../urls";
// import axios from "axios";

export default {
    components: {
        // EditJournal
    },
    name: "FinanceJournalTable",
    props: {
        journals: {}
    },
    data() {
        return {
            headers: [
                { text: "Date", value: "submissionDate", class: "blue-grey lighten-4" },
                { text: "JV Number", value: "jvNum", class: "blue-grey lighten-4" },
                // { text: "Department", value: "department", class: "blue-grey lighten-4" },
                { text: "Period", value: "period", class: "blue-grey lighten-4" },
                { text: "Affiliated Recoveries", value: "refRecoveries", class: "blue-grey lighten-4" },
                { text: "Amount", value: "jvAmount", class: "blue-grey lighten-4" },                
                { text: "Status", value: "status", class: "blue-grey lighten-4" },
                // { text: "", sortable: false, value: "edit", class: "blue-grey lighten-4", width: "1rem" }                             
            ],
            admin: false,       
        };
    },
    mounted() {
       
    },
    methods: {
        updateTable() {
            this.$emit("updateTable");
        },

        getRefs(item){
            const refs = item.recoveries.map(recovery => recovery.refNum)
            return refs.join('/')
        },
        // async call(){
        //     return axios.get(`${AUTH_URL}/user_info`)
        //     .then(resp => {          
        //         console.log(resp.data)
        //     })
        //     .catch(e => {
        //         console.log(e);
        //     });
        // }
    }
};
</script>

<style scoped>
    ::v-deep(tbody tr:nth-of-type(even)) {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>

<template>
  <div>
        <v-dialog v-model="addNewRecoveryDialog" persistent max-width="950px">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    :elevation="type == 'Add New' ? '5' : '0'"
                    style="min-width: 0"
                    :class="type == 'Add New' ? '' : ''"
                    :color="type == 'Add New' ? 'primary' : 'transparent'"
                    @click="initForm()"
                    v-bind="attrs"
                    v-on="on">
                    <div v-if="type == 'Add New'">Create New Recovery</div>
                    <v-icon v-else dense color="primary">mdi-pencil</v-icon>
                </v-btn>
            </template>

        <v-card>
            <v-card-title class="primary" style="border-bottom: 1px solid black">
                <div class="text-h5">
                    {{ type == 'Add New' ? 'Create' :'Edit' }} Recovery
                </div>
            </v-card-title>

            <v-card-text>

                <v-row class="mt-5 mx-0">
                    <v-col cols="6">
                        <v-select
                            :readonly="readonly || lockDepartment"
                            :error="state.departmentErr"
                            @change="departmentChanged"
                            v-model="department"
                            :items="departmentList"
                            item-text="name"
                            label="Requestor Department"
                            outlined
                        />
                    </v-col>
                    <v-col cols="6">
                        <v-autocomplete
                            @change="state.employeeNameErr = false"
                            :error="state.employeeNameErr"
                            :items="employeeNameList"
                            item-text="fullName"
                            v-model="employeeName"
                            label="Requestor Name"
                            outlined
                        />
                    </v-col>
                </v-row>
                <v-row class="mt-5 mx-0">
                    <v-col cols="6">
                        <v-text-field
                            :readonly="readonly"
                            :error="state.referenceErr"
                            @input="state.referenceErr = false"
                            v-model="reference"
                            label="Reference"
                            persistent-hint
                            hint="Footprints Incident #, Project #"
                            outlined
                            :clearable="!readonly"
                        />
                    </v-col>
                </v-row>
                <v-row class="mt-5 mx-0">
                    <v-btn                        
                        class="ml-auto mr-5"
                        color="primary"
                        @click="addRecoveryItem()"
                        small
                        >Add Item
                    </v-btn>
                </v-row>
                <v-row class="mt-5 mx-0">
                    <v-col cols="12">
                        <v-data-table :headers="itemHeaders" :items="recoveryItems" class="elevation-1" hide-default-footer>
                            <template v-slot:[`item.recoveryItem`]="{ item }">
                                <v-autocomplete  
                                    dense                                   
                                    hide-details
                                    :readonly="readonly"                                    
                                    :items="itemCategoryList"                                    
                                    v-model="item.recoveryItem"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.description`]="{ item }">
                                <v-text-field
                                    dense
                                    hide-details
                                    :readonly="readonly"
                                    v-model="item.description"
                                    solo
                                    :clearable="!readonly"
                                />
                            </template>
                            <template v-slot:[`item.quantity`]="{ item }">
                                <v-text-field
                                    dense
                                    hide-details
                                    :readonly="readonly"
                                    v-model="item.quantity"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.unitPrice`]="{ item }">
                                <v-text-field
                                    dense
                                    hide-details
                                    :readonly="readonly"
                                    v-model="item.unitPrice"
                                    prefix="$"
                                    solo
                                />
                            </template>
                            <template v-slot:[`item.totalPrice`]="{ item }">                               
                                <v-text-field
                                    dense 
                                    solo
                                    hide-details
                                    :readonly="readonly"
                                    v-model="item.totalPrice"                                    
                                    prefix="$"                                    
                                />
                            </template>

                            <template v-slot:[`item.remove`]="{ item }">
                                <v-btn                                    
                                    @click="removeItem(item)"
                                    style="min-width: 0"
                                    color="transparent"
                                    class="px-0 mt-0"
                                    small>
                                    <v-icon class="" color="red">mdi-delete</v-icon>
                                </v-btn>
                            </template>                            
                            <template v-slot:footer>
                                <v-row class="my-2 mx-0">
                                    <div class="ml-auto mr-12"><b class="mr-5">TOTAL </b></div> <div style="width:9rem;font-weight:600;">$81,340.00</div>
                                </v-row>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
                
            </v-card-text>

        <v-card-actions>
          <v-btn color="grey darken-5" @click="addNewRecoveryDialog = false">
            <div v-if="type == 'View'">Close</div>
            <div v-else>Cancel</div>
          </v-btn>
          <v-btn
            v-if="type == 'Edit' && admin"
            class="ml-5"
            color="red darken-5"
            @click="deleteDialog = true"
            :loading="savingData"
          >
            Delete
          </v-btn>
          <v-btn
            v-if="type == 'Add New' || type == 'Edit'"
            class="ml-auto"
            color="green darken-1"
            @click="saveNewTravelRequest()"
            :loading="savingData"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

   
  </div>
</template>

<script>
// import Vue from "vue";
// import { PREAPPROVED_URL } from "../../../../urls";

export default {
    name: "NewRecovery",
    props: {
        type: { type: String },
        recovery: {}
    },
    data() {
        return {
            itemHeaders: [
                { text: "Item",        value: "recoveryItem", class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "19%" },
                { text: "Description", value: "description",  class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "40%" },
                { text: "Quantity",    value: "quantity",     class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "10%" },
                { text: "Unit Price",  value: "unitPrice",    class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "14%" },
                { text: "Total Price", value: "totalPrice",   class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "14%" },  
                { text: "",            value: "remove",       class: "blue-grey lighten-4", cellClass: "px-1 py-1", sortable: false, width: "3%" }
            ],

            addNewRecoveryDialog: false,
            lockDepartment: false,
            department: "",
            departmentList: [],
            employeeNameList: [],
            itemCategoryList: [],
            recoveryItems: [],
            
            readonly: false,
            reference: '',
            tmpid: 0,
            

            state: {           
                referenceErr: false,
                departmentErr: false,          
            },
        };
    },
    mounted() {},
    methods: {
        addRecoveryItem(){
            const recoveryItem = {
                tmpid: this.tmpid,
                recoveryItem: '',
                description: '',
                quantity: 0,
                unitPrice: 0,
                totalPrice: 0
            }
            this.tmpid++;
            this.recoveryItems.push(recoveryItem)
        },
    

  //   checkFields() {
  //     this.state.purposeErr = this.purpose ? false : true;
  //     this.state.costErr = this.cost ? false : true;
  //     this.state.locationErr = this.location ? false : true;

  //     this.state.unknownDateErr = !this.startDate && !this.endDate && !this.unknownDate ? true : false;
  //     this.state.anticipatedMonthErr = this.unknownDate && !this.anticipatedMonth ? true : false;

  //     this.state.startDateErr = !this.startDate && this.endDate && !this.unknownDate ? true : false;
  //     this.state.endDateErr = this.startDate && !this.endDate && !this.unknownDate ? true : false;

  //     this.state.undefinedTravellerErr = !this.undefinedTraveller && this.travellers.length == 0 ? true : false;
  //     this.state.travellerNumErr =
  //       this.undefinedTraveller && (!this.travellersNum || this.travellersNum < 1) ? true : false;

  //     for (const key of Object.keys(this.state)) {
  //       if (this.state[key]) return false;
  //     }
  //     return true;
  //   },

  //   saveNewTravelRequest() {
  //     if (this.checkFields()) {
  //       this.savingData = true;
  //       const body = {
  //         location: Vue.filter("capitalize")(this.location),
  //         purpose: this.purpose,
  //         estimatedCost: this.cost,
  //         reason: this.reason,
  //         dateUnkInd: this.unknownDate ? 1 : 0,
  //         month: this.anticipatedMonth,
  //         startDate: !this.unknownDate ? this.startDate : null,
  //         endDate: !this.unknownDate ? this.endDate : null,
  //         department: this.department,
  //         branch: this.branch,
  //         travelerUnkInd: this.undefinedTraveller ? 1 : 0,
  //         numberTravelers: this.travellersNum,
  //         travelers: this.travellers,
  //         travelerNotes: this.travellerNotes
  //       };
  //       // console.log(body);
  //       const id = this.travelRequest?.preTID ? this.travelRequest.preTID : 0;
  //       securePost(`${PREAPPROVED_URL}/${id}`, body)
  //         .then(() => {
  //           this.savingData = false;
  //           this.addNewTravelDialog = false;
  //           this.$emit("updateTable");
  //         })
  //         .catch(e => {
  //           this.savingData = false;
  //           console.log(e);
  //         });
  //     }
  //   },

    initForm() {
  //     this.admin = Vue.filter("isAdmin")();

  //     const userDept = this.$store.state.auth.department;
  //     this.lockDepartment = !Vue.filter("isSystemAdmin")() || this.type != "Add New";

        this.initStates();
        this.initEmployees();
        this.initDepartments();
        this.initItemCategory();
  //     this.purposeList = this.$store.state.preapproved?.travelPurposes?.map(item => item.purpose)

  //     this.travellers = this.type == "Add New" ? [] : this.travelRequest.travelers;
  //     this.purpose = this.type == "Add New" ? "" : this.travelRequest.purpose;
  //     this.unknownDate = this.type == "Add New" ? false : Boolean(this.travelRequest.dateUnkInd);
  //     this.location = this.type == "Add New" ? "" : this.travelRequest.location;
  //     this.cost = this.type == "Add New" ? "" : this.travelRequest.estimatedCost;
  //     this.reason = this.type == "Add New" ? "" : this.travelRequest.reason;
  //     this.startDate = this.type == "Add New" ? "" : this.travelRequest.startDate;
  //     this.endDate = this.type == "Add New" ? "" : this.travelRequest.endDate;
  //     this.department = this.type == "Add New" ? userDept : this.travelRequest.department;
  //     this.branch = this.type == "Add New" ? "" : this.travelRequest.branch;
  //     this.undefinedTraveller = this.type == "Add New" ? false : Boolean(this.travelRequest.travelerUnkInd);
  //     this.undefinedTravellerHint = "";
  //     this.travellersNum = this.type == "Add New" ? null : this.travelRequest.numberTravelers;
  //     this.anticipatedMonth = this.type == "Add New" ? "" : this.travelRequest.month;
  //     this.travellerNotes = this.type == "Add New" ? "" : this.travelRequest.travelerNotes;
  //     this.travellerDialog = false;
  //     this.adName = "";
  //     this.deleteDialog = false;

  //     this.readonly = this.type != "Add New" && this.type != "Edit";

  //     if (this.type != "Add New") this.departmentChanged(this.travelRequest.branch);
  //     else this.departmentChanged();

  //     this.loadingData = false;
  //     this.showApproval = false;
  //     this.approved = this.travelRequest?.status == "Approved";
  //     this.approvedBy = "";
  //     this.approvalDate = "";

  //     if (
  //       this.travelRequest?.preTSubID &&
  //       (this.travelRequest.status == "Approved" || this.travelRequest.status == "Declined")
  //     )
  //       this.initSubmission(this.travelRequest.preTSubID);
    },

    initStates() {    
        for (const key of Object.keys(this.state)) {
            this.state[key] = false;
        }
    },

    initEmployees() {
        this.employeeList = this.$store.state.recoveries.employees.map(item => {
            return {
                fullName: item.fullName,
                department: item.department
            };
        });
    },

    initItemCategory() {
        this.itemCategoryList = this.$store.state.recoveries.itemCategoryList.map(item => {
            return item.Category 
        })
    },

    initDepartments() {
        this.departmentList = [];
        const depts = this.$store.state.recoveries.departmentBranch;
        for (const key of Object.keys(depts)) {
            this.departmentList.push({ name: key });
        }
    },

  //   initSubmission(id) {
  //     secureGet(`${PREAPPROVED_URL}/submissions/${id}`)
  //       .then(res => {
  //         this.showApproval = res.data.status == "Finished";
  //         this.approvedBy = res.data.approvedBy;
  //         this.approvalDate = res.data.approvalDate;
  //       })
  //       .catch(e => {
  //         console.log(e);
  //       });
  //   },

  

    departmentChanged() {
        this.state.departmentErr = false;        
        
        if (this.department) {
            this.employeeNameList = this.employeeList
                .filter(employee => employee.department == this.department)
                .sort((a, b) => (a.fullName >= b.fullName ? 1 : -1));
        }            
    },

    removeItem(item) {
        this.recoveryItems = this.recoveryItems.filter(
            recoveryItem => !(recoveryItem.tmpid == item.tmpid)
        );
    }
  }
};
</script>

<style scoped>
/* 
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
} */
</style>

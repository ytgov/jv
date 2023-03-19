import Vue from "vue";
import store from "../store";

Vue.filter("isAdmin", function () {
  const userDept = store.state.auth.department;
  const userRoles = store.state.auth.user.roles;
  const admin = userRoles?.includes("Admin");
  const patAdmin = userRoles?.includes("PatAdmin") && Boolean(userDept);
  const hasAdminRole = admin || patAdmin;
  return hasAdminRole;
});

Vue.filter("isSystemAdmin", function () {
  const userRoles = store.state.auth.user.roles;
  const admin = userRoles.includes("Admin");
  return admin;
});

Vue.filter("beautifyDate", function (date) {
  const MonthList = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec"
  };
  if (date) return MonthList[Number(date.substr(5, 2))] + " " + date.substr(8, 2) + " " + date.substr(0, 4);
  else return "";
});

Vue.filter("beautifyDateTime", function (date) {
  if (date){
    const time = date.length>10 ? (', '+date.substr(11, 5)):''
    return Vue.filter("beautifyDate")(date.substr(0, 10))+time
  }
  else return "";
});

Vue.filter("getDate", function (date) {
  if(date){
    const newdate = new Date(date)
    return (newdate.getFullYear()+'-'+(newdate.getMonth()+1)+'-'+newdate.getDate())//.slice(0,10)
  }else
    return ''
});

Vue.filter("capitalize", function (text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
});

Vue.filter("currency", function (currency) {
  return currency.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

import Vue from "vue";
import store from "../store";
import { print } from "./print";

Vue.filter("isDepartmentalFinance", async function() {
  await waitForAuthToInitialize();
  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles?.includes("Admin");
  const role = userRoles?.includes("DeptFinance");
  const hasRequiredRoles = admin || role;
  return hasRequiredRoles;
});

Vue.filter("isICTFinance", async function() {
  await waitForAuthToInitialize();
  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles?.includes("Admin");
  const role = userRoles?.includes("IctFinance");
  const hasRequiredRoles = admin || role;
  return hasRequiredRoles;
});

Vue.filter("isBranchAdmin", async function() {
  await waitForAuthToInitialize();
  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles?.includes("Admin");
  const role = userRoles?.includes("BranchAdmin");
  const hasRequiredRoles = admin || role;
  return hasRequiredRoles;
});

Vue.filter("isBranchAgent", async function() {
  await waitForAuthToInitialize();

  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles?.includes("Admin");
  const role1 = userRoles?.includes("BranchAgent");
  const role2 = userRoles?.includes("BranchAdmin");
  const hasRequiredRoles = admin || role1 || role2;
  return hasRequiredRoles;
});

Vue.filter("isBranchUser", async function() {
  await waitForAuthToInitialize();
  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles?.includes("Admin");
  const role = userRoles?.includes("BranchUser");
  const hasRequiredRoles = admin || role;
  return hasRequiredRoles;
});

Vue.filter("isSystemAdmin", async function() {
  await waitForAuthToInitialize();
  const userRoles = store.state.auth.user.roles.split(",");
  const admin = userRoles.includes("Admin");
  return admin;
});

Vue.filter("beautifyDate", function(date) {
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
    12: "Dec",
  };
  if (date) return MonthList[Number(date.substr(5, 2))] + " " + date.substr(8, 2) + " " + date.substr(0, 4);
  else return "";
});

Vue.filter("beautifyDateTime", function(date) {
  if (date) {
    const time = date.length > 10 ? ", " + date.substr(11, 5) : "";
    return Vue.filter("beautifyDate")(date.substr(0, 10)) + time;
  } else return "";
});

Vue.filter("getDate", function(date) {
  if (date) {
    const newdate = new Date(date);
    let month = newdate.getMonth() + 1;
    let day = newdate.getDate();
    return newdate.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day); //.slice(0,10)
  } else return "";
});

Vue.filter("capitalize", function(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
});

Vue.filter("currency", function(currency) {
  return currency.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

Vue.filter("ictBranches", function() {
  const departmentList = store.state.recoveries.departmentBranch;
  const branchOptions = [];
  const itcBranches = departmentList["Highways and Public Works"].ictBranchUnits;
  for (const branch of Object.keys(itcBranches)) {
    if (itcBranches[branch].length > 0) {
      const branchAbbr = branch
        .trim()
        .match(/[A-Z]/g)
        .join("");
      branchOptions.push({
        text: branchAbbr,
        value: branchAbbr,
        lable: branch.trim(),
        units: itcBranches[branch],
      });
    }
  }
  return branchOptions;
});

Vue.filter("printPdf", print);

export async function waitForAuthToInitialize() {
  if (store.state.auth.isInitialized) return;

  let tries = 10;
  for (; tries > 0; tries--) {
    await sleep(30);
    if (store.state.auth.isInitialized) return;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

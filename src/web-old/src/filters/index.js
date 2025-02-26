import Vue from "vue";
import store from "../store";
import { print } from "./print";

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
  console.log("Waiting for auth to initialize", store.state.auth.isInitialized);
  if (store.state.auth.isInitialized) return;

  console.log("HERE");

  let tries = 10;
  for (; tries > 0; tries--) {
    console.log("HERE111", tries);
    await sleep(30);
    if (store.state.auth.isInitialized) return;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const si = require("systeminformation");
const fs = require("fs");

const machineInfo = {};
const promises = [];
promises.push(si.cpu().then((data) => (machineInfo.cpu = data)));
promises.push(si.mem().then((data) => (machineInfo.mem = data)));
promises.push(si.system().then((data) => (machineInfo.system = data)));
promises.push(si.dockerInfo().then((data) => (machineInfo.dockerInfo = data)));
promises.push(si.vboxInfo().then((data) => (machineInfo.vboxInfo = data)));
promises.push(si.osInfo().then((data) => (machineInfo.osInfo = data)));
Promise.all(promises).then(() => {
  fs.writeFileSync("./dist/build-system", JSON.stringify(machineInfo));
});

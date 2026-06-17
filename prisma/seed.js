const fs = require('fs/promises');
const path = require('path');
async function main(){
  const dataDir=path.join(process.cwd(),'data');
  await fs.mkdir(dataDir,{recursive:true});
  console.log('Seed JSON local disponível em /data. Login demo: owner@attoagenda.com.br / Demo@12345');
}
main();

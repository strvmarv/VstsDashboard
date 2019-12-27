export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

export function show(divName: string, func: (target: HTMLElement) => void){
    const elt = document.getElementById(divName)!;
    let result = func(elt);
}

import BuildRestClient = require("TFS/Build/RestClient");
export function getAvailableBuildDefinitions(target: HTMLElement): void {
    // Get an instance of the client
    let client = BuildRestClient.getClient();
    client.getDefinitions(getTeamContext().projectname).then(definitions => {
        //target.innerText = JSON.stringify(definitions);
        target.innerText = "Loaded !!";
    });
} 
show("builds", getAvailableBuildDefinitions);

// List all Build instance runs...

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");

class buildGrid {
  id: number;
  definitionName: string;
  requestedFor: string;
}

export function getLastBuilds(source: Array<buildGrid>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname).then(builds => {
    builds.forEach(b=> {
      source.push({ 
        id: b.id, 
        definitionName: b.definition.name,
        requestedFor: b.requestedFor.displayName
      });
      target.setDataSource(source);
    })
  });
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<buildGrid>();
var buildGridOptions: Grids.IGridOptions = {
  height: "300px",
  width: "500px",
  source: buildSource,
  columns: [
    { text: "Id", width: 100, index: "id"},
    { text: "Build Definition", width: 200, index: "definitionName" },
    { text: "RequestedFor", width: 200, index: "requestedFor" }
  ]
}
var grid = Controls.create(Grids.Grid, buildContainer, buildGridOptions);
getLastBuilds(buildSource, grid);

//import RestClient = require("ReleaseManagement/Core/RestClient");
//import Controls = require("VSS/Controls");
//import Grids = require("VSS/Controls/Grids");

//little holder class for my grid datasource
/*
class releaseGrid {
    name: string;
    id: number;
}
  
export function getAvailableReleaseDefinitions(source: Array<releaseGrid>, target: Grids.Grid): void {    
  // Get an instance of the client
  let client = RestClient.getClient();
  client.getReleaseDefinitions(getTeamContext().projectname).then(definitions => {
      definitions.forEach(d => {
          source.push({ name: d.name, id: d.id });
      });
      //data is retrieved via a IPromise so update the datasource when you have gotten it
      target.setDataSource(source);
  });
} 

//get the div to show your grid
var container = $("#grid-container");
var source = new Array<releaseGrid>();

//define your grid
var gridOptions: Grids.IGridOptions = {
    height: "300px",
    width: "500px",
    source: source,
    columns: [
      { text: "ReleaseName", width: 200, index: "name" },
      { text: "ReleaseIdentifier", width: 200, index: "id" }
    ]
};

var grid = Controls.create(Grids.Grid, container, gridOptions);

getAvailableReleaseDefinitions(source, grid);
*/
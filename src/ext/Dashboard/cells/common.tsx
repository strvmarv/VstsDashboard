import * as React from "react";
import { css } from "azure-devops-ui/Util";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Status, IStatusProps, Statuses, StatusSize } from "azure-devops-ui/Status";
import { IColor } from "azure-devops-ui/Utilities/Color";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";
import { Deployment, DeploymentStatus, ReleaseReference, ApprovalStatus } from "azure-devops-extension-api/Release";
import { Pill, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";
import { Build } from "azure-devops-extension-api/Build";
import { Link } from "azure-devops-ui/Link";

const lightGreen: IColor = {
  red: 204,
  green: 255,
  blue: 204,
};

const lightRed: IColor = {
  red: 255,
  green: 204,
  blue: 204,
};

const lightBlue: IColor = {
  red: 204,
  green: 229,
  blue: 255,
};

const lightOrange : IColor = {
  red: 255,
  green: 229, 
  blue: 204,
}

export const lightGray : IColor = {
  red: 224,
  green: 224,
  blue: 224,
}

export interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label: string;
  color: IColor;
}

export function WithIcon(props: {
  className?: string;
  iconProps: IIconProps;
  children?: React.ReactNode;
}) {
  return (
      <div className={css(props.className, "flex-row flex-center")}>
          {Icon({ ...props.iconProps, className: "icon-margin" })}
          {props.children}
      </div>
  );
}

export function WithIconSpan(props: {
  className?: string;
  iconProps: IIconProps;
  children?: React.ReactNode;
}) {
  return (
      <span className={css(props.className, "flex-row flex-center")}>
          {Icon({ ...props.iconProps, className: "icon-margin" })}
          {props.children}
      </span>
  );
}

export function getReleaseStatus(depl: Deployment) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray,
  };
  
  return getReleaseIndicator(depl.deploymentStatus);
}

export function getReleaseIndicator(status: DeploymentStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGreen
  };

  if(status === undefined){
    status = DeploymentStatus.Undefined;
  }

  switch(status){
    case DeploymentStatus.NotDeployed:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Canceled"};
      indicatorData.label = "Not Deployed";
      indicatorData.color = lightGray;
      break;
    case DeploymentStatus.Succeeded:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success"};
      indicatorData.label = "Success";
      indicatorData.color = lightGreen;
      break;
    case DeploymentStatus.Failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Fail"};
      indicatorData.label = "Fail";
      indicatorData.color = lightRed;
      break;
    case DeploymentStatus.PartiallySucceeded:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "PartiallySucceeded"};
      indicatorData.label = "PartiallySucceeded";
      indicatorData.color = lightOrange;
      break;
    case DeploymentStatus.InProgress:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "InProgress"};
      indicatorData.label = "In Progress";
      indicatorData.color = lightBlue;
      break;
  }
  return indicatorData;
}

export function getPipelineIndicator(result: BuildResult, status:BuildStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray,
  };

  if(result === undefined){
    result = BuildResult.None;
  }

  switch(result){
    case BuildResult.Canceled:
      indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Canceled"};
      indicatorData.label = "Canceled";
      break;
    case BuildResult.Succeeded:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success"};
      indicatorData.label = "Success";
      break;
    case BuildResult.Failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Fail"};
      indicatorData.label = "Fail";
      break;
    case BuildResult.PartiallySucceeded:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "PartiallySucceeded"};
      indicatorData.label = "PartiallySucceeded";
      break;
    case BuildResult.None:
      switch(status){
        case BuildStatus.Cancelling:
          indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Cancelling"};
          indicatorData.label = "Cancelling";
          break;
        case BuildStatus.Completed:
          indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Completed"};
          indicatorData.label = "Completed";
          break;
        case BuildStatus.NotStarted:
          indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Not Started"};
          indicatorData.label = "NotStarted";
          break;
        case BuildStatus.InProgress:
          indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "InProgress"};
          indicatorData.label = "InProgress";
          break;
        case BuildStatus.Postponed:
          indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Postponed"};
          indicatorData.label = "Postponed";
          break;
      }
      break;
  }
  return indicatorData;
}

export function getReleaseTagFromBuild(build: Build, releases: Array<Deployment>) {
  if(build === undefined) {
    return (<div>Not deploy yet</div>);
  }

  let deploys = releases.filter(
    x=> x.release.artifacts.find(
      a=> {
        let version = a.definitionReference["version"];
        return version.id === build.id.toString();
      }
    ) != null
  );

  let releaseReferences = Array<ReleaseReference>();
  for(let i=0;i<deploys.length;i++) {
    let dep = deploys[i];
    if(releaseReferences.find(x=> x.id === dep.release.id) === undefined){
      releaseReferences.push(dep.release);
    }
  }

  let content = [];
  let children = [];
  let lastRelease = Array<string>();
  for(let relRef=0;relRef<releaseReferences.length;relRef++){
    let relRefInfo = releaseReferences[relRef];
    lastRelease = Array<string>();
    let releaseDeploys = deploys.filter(x=> x.release.id == relRefInfo.id)
                         .sort((a,b)=> a.releaseEnvironment.id - b.releaseEnvironment.id);

    for(let i=0;i<releaseDeploys.length;i++) {
      let dep = releaseDeploys[i];
      let lastDeploys = releaseDeploys.filter(x=> x.releaseEnvironment.name === dep.releaseEnvironment.name).sort(x=> x.id);
      let lastDep = lastDeploys[0];
      let envName = lastDep.releaseEnvironment.name;
      let env = lastRelease.find(x => x === envName);

      if(env === undefined) {
        
        let appIcon = getApprovalIcon(lastDep, lastDep.releaseEnvironment.id);

        lastRelease.push(lastDep.releaseEnvironment.name);
        let relStatusInfo = getReleaseStatus(lastDep);
        children.push(
          <Pill color={relStatusInfo.color} variant={PillVariant.colored} 
            onClick={() => window.open(lastDep.releaseEnvironment._links.web.href, "_blank") }>
            <Status {...relStatusInfo.statusProps} className="icon-small-margin" size={StatusSize.s} />&nbsp;{lastDep.releaseEnvironment.name}&nbsp;{appIcon}
          </Pill>)
      }
    }
    let all = false;
    if(all === false) {
      relRef = releaseReferences.length;
    }

    if(deploys.length > 0) {
      content.push(<div><b><Link href={relRefInfo._links.web.href} target="_blank">{relRefInfo.name}</Link></b><p>
                          <PillGroup className="flex-row" overflow={PillGroupOverflow.wrap}>{children}</PillGroup></p></div>);
    }
    children = [];
  }

  if(releaseReferences.length > 0){
    return content;
  }
  return <div>Not deploy yet</div>
}

export function getApprovalIcon(dep: Deployment, envId: number) {
  let personIcon = <Icon iconName="person"/>
  let preApproval = dep.preDeployApprovals.find(x=> x.releaseEnvironment.id === envId);
  if(preApproval !== undefined && preApproval.status === ApprovalStatus.Pending) {
    // Pending Approval
    return personIcon;
  }

  let postApproval = dep.postDeployApprovals.find(x=> x.releaseEnvironment.id === envId);
  if(postApproval !== undefined && postApproval.status === ApprovalStatus.Pending) {
    // Pending Approval
    return personIcon;
  }

  return undefined;
}
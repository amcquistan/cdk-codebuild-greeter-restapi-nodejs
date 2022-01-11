import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class CdkCodebuildStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      version: true
    });

    const githubSource = codebuild.Source.gitHub({
      owner: 'amcquistan',
      repo: 'cdk-codebuild-greeter-restapi-nodejs',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED)
          .andBranchIs('main'),
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_UPDATED)
          .andBranchIs('main'),
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_REOPENED)
          .andBranchIs('main')
      ]
    });

    const buildProject = new codebuild.Project(this, 'BuildProject', {
      source: githubSource,
      
    })

    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: artifactBucket.bucketName
    });
  }
}

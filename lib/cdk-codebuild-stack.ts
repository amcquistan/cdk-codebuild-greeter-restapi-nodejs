import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";


export class CdkCodebuildStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      versioned: true
    });

    const githubSource = codebuild.Source.gitHub({
      owner: 'amcquistan',
      repo: 'cdk-codebuild-greeter-restapi-nodejs',
      branchOrRef: 'main',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED),
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_UPDATED),
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_REOPENED)
      ]
    });

    const buildProject = new codebuild.Project(this, 'BuildProject', {
      source: githubSource,
      buildSpec: codebuild.BuildSpec.fromSourceFilename('src/greeter-api/buildspec.yml'),
      timeout: cdk.Duration.minutes(10),
      artifacts: codebuild.Artifacts.s3({
        bucket: artifactBucket
      }),
      badge: true,
      logging: {
        cloudWatch: {
          logGroup: new logs.LogGroup(this, 'CodeBuildLogs', {
            retention: logs.RetentionDays.THREE_DAYS
          })
        }
      }
    });

    const topic = new sns.Topic(this, 'BuildFailedTopic', {
      displayName: 'Greeter API Build Failed'
    });
    topic.addSubscription(new subscriptions.EmailSubscription('adam.mcquistan@thecodinginterface.com'));
    buildProject.onBuildFailed('BuildFailed', {
      target: new targets.SnsTopic(topic),
      description: 'Greeter API Build Failed'
    });

    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: artifactBucket.bucketName
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class EduAuthServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'edu_track_user_pool',
      signInAliases: { username: true, email: true },
    });

    // Create Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: userPool,
      generateSecret: false,
    });

    // Create Lambda Function
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'), // Directory containing your Lambda function code
      environment: {
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_APP_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    // Create API Gateway and integrate with Lambda
    const api = new apigateway.RestApi(this, 'AuthApi', {
      restApiName: 'Auth Service',
      description: 'This service handles user authentication.',
    });

    const authResource = api.root.addResource('auth');
    const authIntegration = new apigateway.LambdaIntegration(authFunction);

    // Add POST method to the API Gateway
    authResource.addMethod('POST', authIntegration);
  }
}

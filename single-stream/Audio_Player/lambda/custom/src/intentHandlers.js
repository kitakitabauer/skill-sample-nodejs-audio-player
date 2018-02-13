'use strict';

var Alexa = require('alexa-sdk');
var ddb = require('./ddbController.js');
var audioData = require('./audioAssets');
var controller = require('./audioController.js');
var constants = require('./constants');

/*
 Returns true if we should play the jingle for that user.
 Rule is we play the jingle once per rolling period of 24hours.

 This function relies on a DDB table to keep track of last played time per user.
 It silently fails if the table does not exist of if there is a permission issue.

 The table definition is
 aws dynamodb describe-table --table-name my_radio
{
    "Table": {
        "TableArn": "arn:aws:dynamodb:us-east-1:<YOUR ACCOUNT ID>:table/my_radio",
        "AttributeDefinitions": [
            {
                "AttributeName": "userId",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0,
            "WriteCapacityUnits": 5,
            "ReadCapacityUnits": 5
        },
        "TableSizeBytes": 0,
        "TableName": "my_radio",
        "TableStatus": "ACTIVE",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "userId"
            }
        ],
        "ItemCount": 0,
        "CreationDateTime": 1513766788.6
    }
}

 At runtime, the code needs the following IAM policy attached to the lambda role.

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "sid123",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/my_radio"
        }
    ]
}

*/
var intentHandlers = {
    'LaunchRequest': function () {
        this.emit('PlayAudio');
    },
    'PlayAudio': function () {

        let request = this.event.request;

        console.log('これがリクエスト!', request);

        //is the jingle URL defined ?
        if (audioData(request).startJingle) {

                controller.play.call(
                    this,
                    this.t('WELCOME_MSG', {skillName: audioData(request).card.title}),
                    audioData(request).url, audioData(request).card
                );

        } else {

            // play the radio directly
            controller.play.call(this, this.t('WELCOME_MSG', {
                skillName: audioData(request).card.title
            }), audioData(request).url, audioData(request).card);

        }
    },
    'AMAZON.HelpIntent': function () {
        this.response.listen(this.t('HELP_MSG', {
            skillName: audioData(this.event.request).card.title
        }));
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        // No session ended logic
        // do not return a response, as per https://developer.amazon.com/docs/custom-skills/handle-requests-sent-by-alexa.html#sessionendedrequest
        this.emit(':responseReady');
    },
    'System.ExceptionEncountered': function () {
        console.log("\n******************* EXCEPTION **********************");
        console.log("\n" + JSON.stringify(this.event.request, null, 2));
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(this.t('UNHANDLED_MSG'));
        this.emit(':responseReady');
    },
    'AMAZON.NextIntent': function () {
        this.response.speak(this.t('CAN_NOT_SKIP_MSG'));
        this.emit(':responseReady');
    },
    'AMAZON.PreviousIntent': function () {
        this.response.speak(this.t('CAN_NOT_SKIP_MSG'));
        this.emit(':responseReady');
    },

    'AMAZON.PauseIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent': function () {
        controller.stop.call(this, this.t('STOP_MSG'))
    },

    'AMAZON.ResumeIntent': function () {
        controller.play.call(this, this.t('RESUME_MSG'), audioData(this.event.request).url, audioData(this.event.request).card)
    },

    'AMAZON.LoopOnIntent': function () {
        this.emit('AMAZON.StartOverIntent');
    },
    'AMAZON.LoopOffIntent': function () {
        this.emit('AMAZON.StartOverIntent');
    },
    'AMAZON.ShuffleOnIntent': function () {
        this.emit('AMAZON.StartOverIntent');
    },
    'AMAZON.ShuffleOffIntent': function () {
        this.emit('AMAZON.StartOverIntent');
    },
    'AMAZON.StartOverIntent': function () {
        this.response.speak(this.t('NOT_POSSIBLE_MSG'));
        this.emit(':responseReady');
    },

    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function () {
        controller.play.call(this, this.t('WELCOME_MSG', {
            skillName: audioData(this.event.request).card.title
        })), audioData(this.event.request).url, audioData(this.event.request).card
    },
    'PauseCommandIssued': function () {
        controller.stop.call(this, this.t('STOP_MSG'))
    }
}

module.exports = intentHandlers;

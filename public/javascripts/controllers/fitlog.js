var app = angular.module('fantasyFitness')
    .config(['$stateProvider', function($stateProvider) {

    }])
    .controller('FitlogCtrl', ['$scope', 'FitlogService', 'auth', function($scope, FitlogService, auth) {
        $scope.isLoggedIn = auth.isLoggedIn();
        $scope.currentUser = auth.currentUser();
        // TODO: Replace locally stored logs with db calls
        $scope.recordedValues = [];
        $scope.totalPoints = 0;
        $scope.log = {};
        $scope.dates = getWeek();
        $scope.dateRange = [$scope.dates[0],$scope.dates[6]];

        FitlogService.getLogs().success(function(data) {
            console.log('FitlogService -- retrieved logs: ');
            console.log(data);
            $scope.fitlogs = data;
            $scope.lastEntry = $scope.fitlogs[$scope.fitlogs.length - 1];
            console.log($scope.lastEntry);
            // Populate the inputs with data from the last log entry
            if ($scope.lastEntry.status == 'WORKING') {
                $('.input-number').each(function(index) {
                    $(this).val($scope.lastEntry.log[index].entryValue);
                });
                $('.row-activity').each(function() {
                    var value = $(this).attr('data-activityValue');
                    var activity = $(this).attr('data-activityId');
                    $scope.updateRow(value, activity);
                });
            }
        }).error(function(err, req, res) {console.log('FitlogService -- error retrieving logs: ' + '\nerr: ' + err + '\nreq body: ' + req.body + '\nres: ' + res.json);});

        // Update scope variables with current values in fields
        $scope.saveLog = function() {
            var recordedValues = [];
            var totalPoints = 0;
            $('.input-number').each(function(index) {
                var value = $(this).val();
                if (value === null || value === '') {
                    value = 0;
                }
                var rowValue = $(this).attr('data-pointsvalue');
                var entry = {
                    entryIndex: Number(index),
                    entryValue: Number(value)
                };
                totalPoints += (rowValue * Number(value));
                recordedValues.push(entry);
            });
            $scope.recordedValues = recordedValues;
            $scope.totalPoints = totalPoints;
        };

        $scope.submitLog = function() {
            $scope.saveLog();
            // If $scope.fitlogs has a 'WORKING' entry, update the working entry
            if ($scope.lastEntry.status == 'WORKING') {
                var log = $scope.lastEntry;
                //TODO: Update the working log (CURRENTLY BROKEN)
                //log.log = $scope.recordedValues;
                //log.totalPoints = $scope.totalPoints;
                //FitlogService.saveLog(log);
            } else {
                // Else if $scope.fitlogs has no 'WORKING' entries, create a new entry
                var log = {
                    'status': 'WORKING',
                    'startDate': $scope.dates[0],
                    'endDate': $scope.dates[6],
                    'ownerName': $scope.currentUser,
                    'log': $scope.recordedValues,
                    'totalPoints': $scope.totalPoints
                };
                FitlogService.createLog(log);
            }
        };
        $scope.updateRow = function(pointVal, activity) {
            var rowTotal = 0;
            $('.row-'+activity+' :input').each(function() {
                rowTotal += Number($(this).val());
            });
            $('.total-'+activity).html((pointVal*rowTotal));
            $scope.saveLog();
        };

        //FitlogService.getLogs().success(function(data) {
        //    console.log(data);
        //    $scope.fitlogs = data;
        //}).error(function(err){console.log('error retrieving logs for user -- error: ' + err)});

        //FitlogService.getLogById().success(function(data) {
        //    console.log(data);
        //}).error(function(err){console.log('error retrieving logs for user -- error: ' + err)});


        // TODO: Replace hardcoded activities with a http.get from the database
        $scope.activitiesHourly = [
            {
                "activityId": 'pphhigh',
                "activityValue": 7000,
                "label": 'High Intensity (Hours)',
                "description": 'Circuits, crossfit, spin class, sprints, HIIT, core exercises'
            },
            {
                "activityId": 'pphlow',
                "activityValue": 5000,
                "label": 'Low Intensity (Hours)',
                "description": 'Weightlifting, yoga, swimming'
            },
            {
                "activityId": 'pphsport',
                "activityValue": 3500,
                "label": 'Sports (Hours)',
                "description": 'Ultimate, goaltimate, soccer, basketball, rock climbing, downhill skiing, etc.'
            }
        ];
        $scope.activitiesIndividual = [
            {
                "activityId": 'pppu',
                "activityValue": 10,
                "label": 'Push-ups',
                "description": 'Chest/shirt to ground. Push ups done from knees counts at 1/3 rate'
            },
            {
                "activityId": 'pphpu',
                "activityValue": 50,
                "label": 'Pull-ups, HPUs',
                "description": 'HPU = Handstand push-up. Kipping counts at 1/3 rate'
            },
            {
                "activityId": 'ppsq',
                "activityValue": 5,
                "label": 'Air Squats',
                "description": 'Butt below knees'
            },
            {
                "activityId": 'ppqgi',
                "activityValue": 50,
                "label": 'Agility Ladder (Sets)',
                "description": ''
            },
            {
                "activityId": 'ppmrun',
                "activityValue": 1000,
                "label": 'Running (Miles)',
                "description": ''
            },
            {
                "activityId": 'ppmswim',
                "activityValue": 3500,
                "label": 'Swimming (Miles)',
                "description": ''
            },
            {
                "activityId": 'ppmcyc',
                "activityValue": 250,
                "label": 'Cycling (Miles)',
                "description": ''
            },
            {
                "activityId": 'ppmrow',
                "activityValue": 250,
                "label": 'Rowing (Kilometers)',
                "description": ''
            }
        ];
        $scope.activitiesBonus = [
            {
                "activityId": 'bonstr',
                "activityValue": 1000,
                "label": 'Stretching Bonus',
                "description": 'Must stretch for at least 10 minutes. Practicing yoga also achieves this bonus. Record number of days (1-7)'
            },
            {
                "activityId": 'bonh2h',
                "activityValue": 5000,
                "label": 'Head-to-Head',
                "description": 'Reserved for additional head-to-head challenge calculations'
            },
            {
                "activityId": 'bontbt',
                "activityValue": 1500,
                "label": 'Tabata Challenges',
                "description": 'May be completed ONCE per day'
            }
        ];

        function getWeek() {
            var today = new Date(),
                sun = today.getDate() - today.getDay(),
                mon = sun + 1,
                tue = sun + 2,
                wed = sun + 3,
                thu = sun + 4,
                fri = sun + 5,
                sat = sun + 6;
            return [
                new Date(today.setDate(sun)),
                new Date(today.setDate(mon)),
                new Date(today.setDate(tue)),
                new Date(today.setDate(wed)),
                new Date(today.setDate(thu)),
                new Date(today.setDate(fri)),
                new Date(today.setDate(sat))
            ];
        }
}]);
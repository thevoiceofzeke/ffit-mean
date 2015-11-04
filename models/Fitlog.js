var mongoose = require('mongoose');

var FitlogSchema = new mongoose.Schema({
    status: String,
    startDate: Date,
    endDate: Date,
    ownerName: String,
    log: [{entryIndex: Number, entryValue: Number}],
    totalPoints: Number
});

FitlogSchema.methods.update = function(log) {
    this.log = log.log;
    this.totalPoints = log.totalPoints;
    this.save(log);
    //var today = new Date();
    //if (today > this.endDate) {
    //    this.status = 'CLOSED';
    //}
};

mongoose.model('Fitlog', FitlogSchema);
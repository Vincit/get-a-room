describe('updateBookingController', () => {
    describe('addTimeToBooking', () => {
        test.todo('Should return Bad request when bookingId length is invalid');
        test.todo('Should return Bad request when bookingId does not exist');
        test.todo('Should call updateEndTime with previous time + added time');
        test.todo('Should set updated event to locals');
    });

    describe('checkRoomIsFree', () => {
        test.todo('Should do query with previous end time + added time');
        test.todo('Should return Internal server error when no query results');
        test.todo('Should return Conflict when there is event overlap');
        test.todo('Should call next when successful');
    });

    describe('rollBackDeclinedUpdate', () => {
        test.todo('Should call next immediately if roomAccepted');
        test.todo('Should call updateEndTime with previous time');
        test.todo('Should return Conflict when successful');
    });
});

import { DisplayValuePipe } from './display-value.pipe';
import { APP_UTILITIES } from '@app/app.utilities';
describe('DisplayValuePipe', () => {
    it('create an instance', () => {
        const pipe = new DisplayValuePipe();
        expect(pipe).toBeTruthy();
    });

    it('tranforms event id "7" to "FEMA 2013 exercise"', () => {
        const pipe = new DisplayValuePipe();
        let expectedResult = 'FEMA 2013 exercise';
        expect(
            pipe.transform(
                7,
                'event_id',
                'event_name',
                APP_UTILITIES.EVENTS_DUMMY_DATA_LIST
            )
        ).toBe(expectedResult);
    });
});

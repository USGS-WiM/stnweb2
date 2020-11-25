import { TestBed } from '@angular/core/testing';

import { APP_UTILITIES } from './app.utilities';

describe('APP_UTILITIES', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [APP_UTILITIES],
            providers: [],
        });
    });

    function getExpectedScale(i) {
        switch (i) {
            case 19:
                return '1,128';
            case 18:
                return '2,256';
            case 17:
                return '4,513';
            case 16:
                return '9,027';
            case 15:
                return '18,055';
            case 14:
                return '36,111';
            case 13:
                return '72,223';
            case 12:
                return '144,447';
            case 11:
                return '288,895';
            case 10:
                return '577,790';
            case 9:
                return '1,155,581';
            case 8:
                return '2,311,162';
            case 7:
                return '4,622,324';
            case 6:
                return '9,244,649';
            case 5:
                return '18,489,298';
            case 4:
                return '36,978,596';
            case 3:
                return '73,957,193';
            case 2:
                return '147,914,387';
            case 1:
                return '295,828,775';
            case 0:
                return '591,657,550';
        }
    }

    it('#SORT should return a correctly sorted ascending array', () => {
        let testSortArray = [
            { id: 1, value: 5 },
            { id: 2, value: 19 },
            { id: 3, value: 3 },
            { id: 4, value: 1 },
            { id: 5, value: 789 },
            { id: 6, value: 138 },
        ];
        let sortedArray = APP_UTILITIES.SORT(testSortArray, 'value', 'ascend');
        expect(sortedArray).toEqual([
            { id: 4, value: 1 },
            { id: 3, value: 3 },
            { id: 1, value: 5 },
            { id: 2, value: 19 },
            { id: 6, value: 138 },
            { id: 5, value: 789 },
        ]);
    });

    it('#SORT should return a correctly sorted descending array', () => {
        let testSortArray = [
            { id: 1, value: 5 },
            { id: 2, value: 19 },
            { id: 3, value: 3 },
            { id: 4, value: 1 },
            { id: 5, value: 789 },
            { id: 6, value: 138 },
        ];
        let sortedArray = APP_UTILITIES.SORT(testSortArray, 'value', 'descend');
        expect(sortedArray).toEqual([
            { id: 5, value: 789 },
            { id: 6, value: 138 },
            { id: 2, value: 19 },
            { id: 1, value: 5 },
            { id: 3, value: 3 },
            { id: 4, value: 1 },
        ]);
    });

    it('#SCALE_LOOKUP should return the correct scale level string', () => {
        for (let i = 0; i < 20; i++) {
            let scale = APP_UTILITIES.SCALE_LOOKUP(i);
            expect(scale).toEqual(getExpectedScale(i));
        }
    });
});
